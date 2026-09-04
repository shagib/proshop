'use client';
 
import { useSyncExternalStore } from 'react';
 
type WishlistButtonProps = {
  productId: string;
};
 
const EMPTY_WISHLIST: string[] = [];
 
let cachedWishlist: string[] = EMPTY_WISHLIST;
let cachedRaw: string | null = null;
 
function getWishlist(): string[] {
  if (typeof window === 'undefined') return EMPTY_WISHLIST;
 
  const raw = localStorage.getItem('wishlist');
 
  if (raw === cachedRaw) {
    return cachedWishlist;
  }
 
  cachedRaw = raw;
  cachedWishlist = raw ? JSON.parse(raw) : EMPTY_WISHLIST;
  return cachedWishlist;
}
 
function getServerSnapshot(): string[] {
  return EMPTY_WISHLIST;
}
 
function subscribe(callback: () => void) {
  window.addEventListener('wishlist-updated', callback);
  return () => window.removeEventListener('wishlist-updated', callback);
}
 
export default function WishlistButton({ productId }: WishlistButtonProps) {
  const wishlist = useSyncExternalStore(subscribe, getWishlist, getServerSnapshot);
  const isWishlisted = wishlist.includes(productId);
 
  function toggleWishlist(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
 
    const current = getWishlist();
    let updated: string[];
 
    if (current.includes(productId)) {
      updated = current.filter((id) => id !== productId);
    } else {
      updated = [...current, productId];
    }
 
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
  }

  return (
    <button 
        onClick={toggleWishlist} 
        className={`products-card-wishlist bg-neutral p-[6px] rounded-full ${isWishlisted ? 'active' : ''}`} 
        aria-label="Add to wishlist"
    >
       <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}