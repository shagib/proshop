'use server';
 
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { Review } from './reviews';

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