'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { sql } from '@/lib/db';

export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'archived';

export type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
};

export async function getAllContactMessages(): Promise<AdminContactMessage[]> {
  await requireAdmin();

  const rows = await sql`
    SELECT id, name, email, subject, message, status, created_at
    FROM contact_messages
    ORDER BY created_at DESC
  `;

  return rows as AdminContactMessage[];
}

export async function updateContactMessageStatus(id: number, status: ContactMessageStatus) {
  await requireAdmin();
  await sql`UPDATE contact_messages SET status = ${status} WHERE id = ${id}`;
  revalidatePath('/admin/messages');
}

export async function deleteContactMessage(id: number) {
  await requireAdmin();
  await sql`DELETE FROM contact_messages WHERE id = ${id}`;
  revalidatePath('/admin/messages');
}