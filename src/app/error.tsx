'use client';

import { useEffect } from 'react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-neutral-600">
        We could not load this page right now. Please try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
      >
        Try again
      </button>
    </main>
  );
}
