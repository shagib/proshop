'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { sql } from '@/lib/db';

export type ContactFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const initialState: ContactFormState = {
  success: false,
  message: '',
};

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitContactMessage(
  _previousState: ContactFormState = initialState,
  formData: FormData,
): Promise<ContactFormState> {
  void _previousState;
  if (readField(formData, 'website')) {
    return { success: true, message: 'Thanks for contacting us.' };
  }

  const name = readField(formData, 'name');
  const email = readField(formData, 'email');
  const subject = readField(formData, 'subject');
  const message = readField(formData, 'message');
  const errors: Record<string, string> = {};

  if (name.length < 2 || name.length > 100) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (subject.length < 2 || subject.length > 200) errors.subject = 'Enter a subject.';
  if (message.length < 10 || message.length > 5000) {
    errors.message = 'Message must be between 10 and 5000 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: 'Please check the form.', errors };
  }

  await sql`
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (${name}, ${email}, ${subject}, ${message})
  `;

  const resendApiKey = process.env.RESEND_API_KEY;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
  const senderEmail = process.env.CONTACT_FROM_EMAIL;

  if (resendApiKey && receiverEmail && senderEmail) {
    const resend = new Resend(resendApiKey);
    try {
      await resend.emails.send({
        from: senderEmail,
        to: receiverEmail,
        replyTo: email,
        subject: `New contact message: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      });
    } catch (error) {
      console.error('Contact notification email failed:', error);
    }
  }

  revalidatePath('/admin/messages');
  return { success: true, message: 'Your message has been sent successfully.' };
}