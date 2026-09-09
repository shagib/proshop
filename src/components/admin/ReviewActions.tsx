'use client';

import { useTransition } from 'react';
import { approveReview, deleteReview } from '@/actions/admin-review';

type ReviewActionsProps = {
  id: number;
  approved: boolean;
};

export default function ReviewActions({ id, approved }: ReviewActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveReview(id);
    });
  }

  function handleDelete() {
    if (!confirm('Are you sure? Do you want delete this review?')) return;

    startTransition(async () => {
      await deleteReview(id);
    });
  }

  return (
    <div className="flex gap-2">
      {!approved && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}