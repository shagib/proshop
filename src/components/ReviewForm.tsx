'use client';

import { useState, useTransition } from 'react';
import { submitReview } from '@/actions/reviews';

type ReviewFormProps = {
  productHandle: string;
  productTitle: string;
};

export default function ReviewForm({ productHandle, productTitle }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating === 0) {
      alert('Please share your rating');
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {

      try {
        
        await submitReview({
          productHandle,
          authorName: formData.get('author') as string,
          authorEmail: formData.get('email') as string,
          rating,
          title: formData.get('title') as string,
          body: formData.get('body') as string,
        });

        setStatus('success');
        (event.target as HTMLFormElement).reset();
        setRating(0);

      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    });
  }

  if (status === 'success') {
    return (
      <div className="mt-10 p-6 bg-green-50 border border-green-200 rounded">
        <p className="text-green-700 font-medium">
          Thank you! Your review has submitted. 
        </p>
      </div>
    );
  }

  return (
    <div className="review-form-wrapper mt-8">
      <h3 className="text-lg font-semibold mb-8 uppercase">
        Share your feedback for &quot;{productTitle.toUpperCase()}&quot;
      </h3>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className='flex gap-4 w-max'>
          <label className="block mb-1 text-base font-medium">
            Your Rating <span aria-hidden="true">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill={star <= (hoverRating || rating) ? '#f9af58' : 'none'}
                  stroke={star <= (hoverRating || rating) ? '#f9af58' : '#d1d1d1'}
                  strokeWidth="1"
                >
                  <path d="M10 1.5L12.5 7L18.5 7.5L14 11.5L15.5 17.5L10 14L4.5 17.5L6 11.5L1.5 7.5L7.5 7L10 1.5Z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          name="title"
          placeholder="Review Title (optional)"
          className="border border-neutral-300 rounded px-4 py-5"
        />

        <div className="flex gap-4 max-[640px]:flex-col">
          <input
            type="text"
            name="author"
            placeholder="Your Name Here"
            required
            className="flex-1 border border-neutral-300 rounded px-4 py-5"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email Here"
            required
            className="flex-1 border border-neutral-300 rounded px-4 py-5"
          />
        </div>

        <textarea
          name="body"
          placeholder="Your Review Here"
          required
          rows={6}
          className="border border-neutral-300 rounded px-4 py-5"
        />

        {status === 'error' && (
          <p className="text-red-600 text-sm">Please try again, something wrong</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded border border-neutral-900 px-10 py-5 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Submit Now'}
        </button>
      </form>
    </div>
  );
}