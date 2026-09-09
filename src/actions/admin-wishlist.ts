'use server';

import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export type AdminWishlistProduct = {
  product_id: string;
  product_handle: string;
  product_title: string;
  product_image: string | null;
  wishlist_count: number;
  last_added: string;
};

/** Basic view for now: which products are wishlisted and how many times. */
export async function getWishlistedProducts(): Promise<AdminWishlistProduct[]> {
  await requireAdmin();

  const rows = await sql`
    SELECT
      product_id,
      product_handle,
      MAX(product_title) AS product_title,
      MAX(product_image) AS product_image,
      COUNT(*)::int AS wishlist_count,
      MAX(created_at) AS last_added
    FROM wishlist_items
    GROUP BY product_id, product_handle
    ORDER BY wishlist_count DESC, last_added DESC
  `;

  return rows as AdminWishlistProduct[];
}