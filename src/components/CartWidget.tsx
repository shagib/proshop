'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Cart } from '@/lib/shopify/cart';
import { getCurrentCart, updateCartLine, removeItemFromCart } from '@/actions/cart';
import { CART_UPDATED_EVENT, type CartUpdatedDetail } from '@/lib/cart-events';

export default function CartWidget() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function refreshCart() {
    startTransition(async () => {
      const latest = await getCurrentCart();
      setCart(latest);
    });
  }

  useEffect(() => {
    refreshCart();

    function handleCartUpdated(event: Event) {
      refreshCart();
      const detail = (event as CustomEvent<CartUpdatedDetail>).detail;
      if (detail?.openDrawer) {
        setIsOpen(true);
      }
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, []);

  const lines = cart?.lines.edges.map((edge) => edge.node) ?? [];
  const itemCount = cart?.totalQuantity ?? 0;

  function changeQuantity(lineId: string, quantity: number) {
    startTransition(async () => {
      const updated = await updateCartLine(lineId, quantity);
      setCart(updated);
    });
  }

  function removeLine(lineId: string) {
    startTransition(async () => {
      const updated = await removeItemFromCart(lineId);
      setCart(updated);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open cart"
        className="header-cart-btn relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100"
      >
        <svg width="20" height="20" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.68732 10.6044C3.06782 12.5068 3.25806 13.4581 3.88669 14.0707C4.00287 14.184 4.12857 14.287 4.26239 14.3787C4.98643 14.875 5.95651 14.875 7.89666 14.875H9.10291C11.0431 14.875 12.0131 14.875 12.7372 14.3787C12.871 14.287 12.9967 14.184 13.1129 14.0707C13.7415 13.4581 13.9317 12.5068 14.3122 10.6044C14.8585 7.87303 15.1316 6.50736 14.5029 5.53964C14.389 5.36442 14.2562 5.20233 14.1067 5.05634C13.281 4.25 11.8883 4.25 9.10291 4.25H7.89666C5.11123 4.25 3.71851 4.25 2.8929 5.05634C2.74341 5.20233 2.61053 5.36442 2.49668 5.53964C1.86792 6.50736 2.14105 7.87303 2.68732 10.6044Z" stroke="#111111" strokeWidth="1.5"/>
          <circle cx="10.8906" cy="7.17188" r="0.796875" fill="#111111"/>
          <circle cx="6.10938" cy="7.17188" r="0.796875" fill="#111111"/>
          <path d="M6.375 4.24984V3.5415C6.375 2.3679 7.32639 1.4165 8.5 1.4165C9.6736 1.4165 10.625 2.3679 10.625 3.5415V4.24984" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-neutral-950 text-white text-[11px] leading-[18px] text-center">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="cart-drawer-overlay fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <aside className="cart-drawer relative w-full max-w-[400px] h-full bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold">Your Cart ({itemCount})</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close cart" className="text-2xl leading-none">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  {isPending ? 'Loading...' : 'Your cart is empty.'}
                </p>
              ) : (
                <ul className="flex flex-col gap-5">
                  {lines.map((line) => {
                    const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
                    const isDefaultVariant = line.merchandise.title === 'Default Title';
                    return (
                      <li key={line.id} className="flex gap-3">
                        <div className="w-16 h-16 flex-shrink-0 bg-neutral-50 border border-neutral-100 rounded overflow-hidden">
                          {image && (
                            <img src={image.url} alt={image.altText ?? line.merchandise.product.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">{line.merchandise.product.title}</p>
                          {!isDefaultVariant && (
                            <p className="text-xs text-neutral-500">{line.merchandise.title}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-neutral-200 rounded text-sm">
                              <button
                                type="button"
                                className="px-2 py-1"
                                aria-label="Decrease quantity"
                                onClick={() => changeQuantity(line.id, line.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="px-2">{line.quantity}</span>
                              <button
                                type="button"
                                className="px-2 py-1"
                                aria-label="Increase quantity"
                                onClick={() => changeQuantity(line.id, line.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              className="text-xs text-neutral-500 underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                          {line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {lines.length > 0 && cart && (
              <div className="border-t border-neutral-100 px-5 py-4 flex flex-col gap-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Subtotal</span>
                  <span>
                    {cart.cost.subtotalAmount.amount} {cart.cost.subtotalAmount.currencyCode}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-sm font-semibold border border-neutral-950 rounded py-3 hover:bg-neutral-50"
                >
                  View cart
                </Link>
                <a
                  href={cart.checkoutUrl}
                  className="text-center text-sm font-bold bg-neutral-950 text-white rounded py-3 hover:bg-neutral-700"
                >
                  Checkout
                </a>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}