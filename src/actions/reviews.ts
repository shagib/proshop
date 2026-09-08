'use server';

import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

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
  await sql`
    INSERT INTO reviews (product_handle, author_name, author_email, rating, title, body)
    VALUES (
      ${data.productHandle},
      ${data.authorName},
      ${data.authorEmail},
      ${data.rating},
      ${data.title},
      ${data.body}
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

export type AdminReview = Review & {
    approved: boolean;
}

export async function getAllReviews(): Promise<AdminReview[]> {
  await requireAdmin();

  const reviews = await sql`
    SELECT id, product_handle, author_name, rating, title, body, approved, created_at
    FROM reviews
    ORDER BY created_at DESC
  `;
 
  return reviews as AdminReview[];
}

export async function approveReview(id: number) {
  await requireAdmin();

  await sql`UPDATE reviews SET approved = true WHERE id = ${id}`;
  revalidatePath('/admin/reviews');
}

export async function deleteReview(id: number) {
  await requireAdmin();

  await sql`DELETE FROM reviews WHERE id = ${id}`;
  revalidatePath('/admin/reviews');
}