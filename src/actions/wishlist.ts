'use server';

import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { sql } from '@/lib/db';
import { getProduct } from '@/lib/shopify/products';

const WISHLIST_SESSION_COOKIE = 'wishlistSessionId';

async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(WISHLIST_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  cookieStore.set(WISHLIST_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return sessionId;
}

type WishlistProductInput = {
  productId: string;
  productHandle: string;
  productTitle: string;
  productImage: string | null;
};

/**
 * Mirrors the toggle already done client-side in localStorage, so the admin
 * dashboard has a server-side record of wishlist activity. Non-blocking /
 * best-effort: the client is the source of truth for the user's own UI.
 */
export async function toggleWishlistItem(product: WishlistProductInput) {
  if (!/^gid:\/\/.+/.test(product.productId) || !/^[a-z0-9-]{1,255}$/.test(product.productHandle)) {
    throw new Error('Invalid wishlist product.');
  }

  const sessionId = await getOrCreateSessionId();

  const existing = await sql`
    SELECT id FROM wishlist_items
    WHERE session_id = ${sessionId} AND product_id = ${product.productId}
  `;

  if (existing.length > 0) {
    await sql`
      DELETE FROM wishlist_items
      WHERE session_id = ${sessionId} AND product_id = ${product.productId}
    `;
    return { wishlisted: false };
  }

  const canonicalProduct = await getProduct(product.productHandle);
  if (!canonicalProduct || canonicalProduct.id !== product.productId) {
    throw new Error('Wishlist product could not be verified.');
  }

  await sql`
    INSERT INTO wishlist_items (session_id, product_id, product_handle, product_title, product_image)
    VALUES (${sessionId}, ${canonicalProduct.id}, ${canonicalProduct.handle}, ${canonicalProduct.title}, ${canonicalProduct.featuredImage?.url ?? null})
    ON CONFLICT (session_id, product_id) DO NOTHING
  `;
  return { wishlisted: true };
}