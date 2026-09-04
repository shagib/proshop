'use client';

import { useRef } from 'react';

type ProductCarouselProps = {
  title: string;
  children: React.ReactNode;
};

export default function ProductCarousel({ title, children }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;

    const scrollAmount = 372; //scroll range by px
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="products-carousel">
      <div className="products-header flex justify-between items-end gap-5 mb-10">
        <h2 className="products-heading text-5xl font-semibold leading-[57.6px] max-[768px]:text-4xl  max-[768px]:leading-[43.2px]">{title}</h2>
        <div className="products-carousel-arrows flex justify-between gap-5">
          <button
            onClick={() => scroll('left')}
            className="carousel-arrow px-6 py-3 border bg-neutral rounded-lg border-neutral-100 transition hover:border-neutral-950"
            aria-label="Previous products"
          >
            <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.328033 6.1694C-0.109391 6.56627 -0.109391 7.25377 0.328033 7.65063L6.83979 13.5585C7.48239 14.1415 8.51172 13.6856 8.51172 12.8179L8.51172 1.00213C8.51172 0.134464 7.48239 -0.321494 6.83979 0.261519L0.328033 6.1694Z" fill="#1A1A1A"/>
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="carousel-arrow px-6 py-3 border bg-neutral rounded-lg border-neutral-100 transition hover:border-neutral-950"
            aria-label="Next products"
          >
            <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.18369 6.1694C8.62111 6.56627 8.62111 7.25377 8.18369 7.65063L1.67193 13.5585C1.02933 14.1415 -7.08305e-07 13.6856 -6.70378e-07 12.8179L-1.53894e-07 1.00213C-1.15967e-07 0.134464 1.02933 -0.321494 1.67193 0.261519L8.18369 6.1694Z" fill="#1A1A1A"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="products-grid flex gap-8 overflow-x-auto scroll-smooth scrollbar-none" ref={scrollRef}>
        {children}
      </div>
    </div>
  );
}