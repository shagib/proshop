'use client';

import { useEffect, useState, useSyncExternalStore, useTransition } from 'react';
import { addItemToCart } from '@/actions/cart';
import { getWishlistProducts } from '@/actions/wishlist-products';
import { notifyCartUpdated } from '@/lib/cart-events';
import {
  getWishlistIds,
  getWishlistServerSnapshot,
  setWishlistIds,
  subscribeToWishlist,
} from '@/lib/wishlist-store';
import type { Product } from '@/lib/shopify/products';

export default function WishlistBadge() {
  const wishlist = useSyncExternalStore(subscribeToWishlist, getWishlistIds, getWishlistServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const count = wishlist.length;

  useEffect(() => {
    if (!isOpen) return;
    startTransition(async () => {
      setProducts(await getWishlistProducts(wishlist));
    });
  }, [isOpen, wishlist]);

  function removeProduct(productId: string) {
    setWishlistIds(wishlist.filter((id) => id !== productId));
  }

  function addProductToCart(product: Product) {
    const variant = product.variants.edges.find(
      (edge) => edge.node.availableForSale && edge.node.quantityAvailable > 0,
    )?.node;
    if (!variant) return;

    startTransition(async () => {
      try {
        await addItemToCart(variant.id, 1);
        notifyCartUpdated({ openDrawer: true });
      } catch {
        // Inventory can change after the wishlist was loaded.
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Wishlist, ${count} item${count === 1 ? '' : 's'}`}
        className="header-wishlist-btn relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-neutral-950 text-white text-[11px] leading-[18px] text-center">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close wishlist"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative w-full max-w-[400px] h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold">Wishlist ({count})</h2>
              <button type="button" aria-label="Close wishlist" onClick={() => setIsOpen(false)} className="text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isPending && products.length === 0 ? (
                <p className="text-sm text-neutral-500">Loading wishlist...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-neutral-500">Your wishlist is empty.</p>
              ) : (
                <ul className="flex flex-col gap-5">
                  {products.map((product) => {
                    const variant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;
                    return (
                      <li key={product.id} className="flex gap-3">
                        <img src={product.featuredImage?.url ?? ''} alt={product.featuredImage?.altText ?? product.title} className="w-16 h-16 object-cover rounded bg-neutral-50" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-sm text-neutral-600 mt-1">{product.priceRange.minVariantPrice.amount}</p>
                          <div className="flex gap-3 mt-2">
                            <button type="button" disabled={!variant || isPending} onClick={() => addProductToCart(product)} className="text-xs font-semibold underline">
                              {variant ? 'Add to cart' : 'Sold out'}
                            </button>
                            <button type="button" onClick={() => removeProduct(product.id)} className="text-xs text-neutral-500 underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <a href="/shop" className="mx-5 mb-5 text-center bg-neutral-950 text-white py-3 rounded text-sm font-semibold">
              Continue shopping
            </a>
          </aside>
        </div>
      )}
    </>
  );
}