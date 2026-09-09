'use server';

import { sql } from '@/lib/db';

export type Review = {
  id: number;
  product_handle: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
};

export async function submitReview(data: {
  productHandle: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string;
  body: string;
}) {
  const productHandle = data.productHandle.trim();
  const authorName = data.authorName.trim();
  const authorEmail = data.authorEmail.trim().toLowerCase();
  const title = data.title.trim();
  const body = data.body.trim();

  if (!/^[a-z0-9-]{1,255}$/.test(productHandle)) {
    throw new Error('Invalid product.');
  }
  if (authorName.length < 2 || authorName.length > 100) {
    throw new Error('Name must be between 2 and 100 characters.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail) || authorEmail.length > 254) {
    throw new Error('Invalid email address.');
  }
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }
  if (title.length > 150 || body.length < 10 || body.length > 5000) {
    throw new Error('Review content is invalid.');
  }

  await sql`
    INSERT INTO reviews (product_handle, author_name, author_email, rating, title, body)
    VALUES (
      ${productHandle},
      ${authorName},
      ${authorEmail},
      ${data.rating},
      ${title || null},
      ${body}
    )
  `;

  return { success: true };
}

export async function getReviews(productHandle: string): Promise<Review[]> {
  const reviews = await sql`
    SELECT id, product_handle, author_name, rating, title, body, created_at
    FROM reviews
    WHERE product_handle = ${productHandle} AND approved = true
    ORDER BY created_at DESC
  `;

  return reviews as Review[];
}