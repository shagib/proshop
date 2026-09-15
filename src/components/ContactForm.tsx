'use client';

import { useActionState } from 'react';
import { submitContactMessage, type ContactFormState } from '@/actions/contact';

const initialState: ContactFormState = { success: false, message: '' };

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);

  return (
    <form action={formAction} className="mt-12 max-w-2xl space-y-5" noValidate>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">Name</label>
        <input id="name" name="name" required maxLength={100} className="w-full border border-neutral-300 px-4 py-3" />
        {state.errors?.name && <p className="mt-1 text-sm text-red-700">{state.errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required maxLength={200} className="w-full border border-neutral-300 px-4 py-3" />
        {state.errors?.email && <p className="mt-1 text-sm text-red-700">{state.errors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium">Subject</label>
        <input id="subject" name="subject" required maxLength={200} className="w-full border border-neutral-300 px-4 py-3" />
        {state.errors?.subject && <p className="mt-1 text-sm text-red-700">{state.errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">Message</label>
        <textarea id="message" name="message" required maxLength={5000} rows={7} className="w-full border border-neutral-300 px-4 py-3" />
        {state.errors?.message && <p className="mt-1 text-sm text-red-700">{state.errors.message}</p>}
      </div>

      <button type="submit" disabled={isPending} className="bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? 'Sending...' : 'Send message'}
      </button>

      {state.message && (
        <p role="status" className={state.success ? 'text-green-700' : 'text-red-700'}>{state.message}</p>
      )}
    </form>
  );
}