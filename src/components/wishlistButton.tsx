'use client';
 
import { useSyncExternalStore } from 'react';
import { toggleWishlistItem } from '@/actions/wishlist';
import {
  getWishlistIds,
  getWishlistServerSnapshot,
  setWishlistIds,
  subscribeToWishlist,
} from '@/lib/wishlist-store';
 
type WishlistButtonProps = {
  productId: string;
  productHandle: string;
  productTitle: string;
  productImage: string | null;
};
 
export default function WishlistButton({ productId, productHandle, productTitle, productImage }: WishlistButtonProps) {
  const wishlist = useSyncExternalStore(subscribeToWishlist, getWishlistIds, getWishlistServerSnapshot);
  const isWishlisted = wishlist.includes(productId);
 
  function toggleWishlist(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
 
    const current = getWishlistIds();
    let updated: string[];
 
    if (current.includes(productId)) {
      updated = current.filter((id) => id !== productId);
    } else {
      updated = [...current, productId];
    }
 
    setWishlistIds(updated);
    void toggleWishlistItem({ productId, productHandle, productTitle, productImage }).catch(() => {
      // Local wishlist remains available when the optional dashboard sync is unavailable.
    });
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