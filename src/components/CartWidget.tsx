'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Cart } from '@/lib/shopify/cart';
import { getCurrentCart, updateCartLine, removeItemFromCart } from '@/actions/cart';
import { CART_UPDATED_EVENT, OPEN_CART_EVENT, type CartUpdatedDetail } from '@/lib/cart-events';
import { MAX_LINE_QUANTITY } from '@/lib/cart-constants';

export default function CartWidget() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());
  const requestVersions = useRef<Record<string, number>>({});
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

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

    function handleOpenCart() {
      setIsOpen(true);
      refreshCart();
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener(OPEN_CART_EVENT, handleOpenCart);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener(OPEN_CART_EVENT, handleOpenCart);
    };
  }, []);

  const lines = cart?.lines.edges.map((edge) => edge.node) ?? [];
  const itemCount = cart?.totalQuantity ?? 0;
  const isAllSelected = lines.length > 0 && selectedLineIds.size === lines.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = selectedLineIds.size > 0 && !isAllSelected;
    }
  }, [isAllSelected, selectedLineIds]);

  function changeQuantity(lineId: string, quantity: number) {
    const currentLine = cart?.lines.edges.find((edge) => edge.node.id === lineId)?.node;
    if (!currentLine) return;

    if (quantity > currentLine.merchandise.quantityAvailable || quantity > MAX_LINE_QUANTITY) {
      setMessage('This product is out of stock or the requested quantity is unavailable.');
      return;
    }
    const nextQuantity = Math.max(1, quantity);
    if (nextQuantity === currentLine.quantity) return;

    const version = (requestVersions.current[lineId] ?? 0) + 1;
    requestVersions.current[lineId] = version;
    const quantityDelta = nextQuantity - currentLine.quantity;
    setCart((current) => current && ({
      ...current,
      totalQuantity: current.totalQuantity + quantityDelta,
      lines: {
        ...current.lines,
        edges: current.lines.edges.map((edge) =>
          edge.node.id === lineId
            ? { ...edge, node: { ...edge.node, quantity: nextQuantity } }
            : edge,
        ),
      },
    }));

    startTransition(async () => {
      try {
        const updated = await updateCartLine(lineId, nextQuantity);
        if (updated && requestVersions.current[lineId] === version) {
          setCart(updated);
        }
      } catch {
        const latest = await getCurrentCart();
        setCart(latest);
        setMessage('This product is out of stock or the requested quantity is unavailable.');
      }
    });
  }

  function toggleLineSelection(lineId: string) {
    setSelectedLineIds((current) => {
      const next = new Set(current);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedLineIds(isAllSelected ? new Set() : new Set(lines.map((line) => line.id)));
  }

  function cancelDeleteMode() {
    setIsDeleteMode(false);
    setSelectedLineIds(new Set());
  }

  function closeCart() {
    setIsOpen(false);
    cancelDeleteMode();
  }

  function removeSelectedLines() {
    if (selectedLineIds.size === 0) return;

    const lineIdsToRemove = [...selectedLineIds];
    startTransition(async () => {
      try {
        let updatedCart = cart;
        for (const lineId of lineIdsToRemove) {
          updatedCart = await removeItemFromCart(lineId);
        }
        setCart(updatedCart);
        cancelDeleteMode();
      } catch {
        const latest = await getCurrentCart();
        setCart(latest);
        setMessage('Selected items could not be removed. Please try again.');
      }
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
        <div className="cart-drawer-overlay fixed inset-0 z-50 flex justify-end bg-black/35 max-[767px]:items-end max-[767px]:justify-center">
          <button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-black/40"
            onClick={closeCart}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="cart-drawer relative flex h-full w-full max-w-[390px] flex-col bg-[#fffdfd] shadow-2xl max-[767px]:h-[min(82dvh,720px)] max-[767px]:max-w-none max-[767px]:rounded-t-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="text-lg font-bold tracking-tight text-neutral-950">Cart <span className="font-normal text-neutral-500">({itemCount})</span></h2>
              <div className="flex items-center gap-2">
                {isDeleteMode ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelDeleteMode}
                      disabled={isPending}
                      className="px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-950 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={removeSelectedLines}
                      disabled={isPending || selectedLineIds.size === 0}
                      className="rounded px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete ({selectedLineIds.size})
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDeleteMode(true)}
                    disabled={lines.length === 0}
                    className="flex h-8 items-center gap-1 rounded px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Delete
                  </button>
                )}
                <button type="button" onClick={closeCart} aria-label="Close cart" className="flex h-8 w-8 items-center justify-center text-2xl leading-none text-neutral-700 hover:bg-neutral-100">
                  &times;
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {message && <p className="mb-3 border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs font-medium text-red-700" role="status">{message}</p>}
              {lines.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  {isPending ? 'Loading...' : 'Your cart is empty.'}
                </p>
              ) : (
                <>
                  {isDeleteMode && (
                    <label className="mb-1 flex cursor-pointer items-center gap-2 border-b border-neutral-100 pb-3 text-sm font-medium text-neutral-800">
                      <input
                        ref={selectAllCheckboxRef}
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 accent-neutral-950"
                      />
                      Select all ({lines.length})
                    </label>
                  )}
                  <ul className="divide-y divide-neutral-100">
                    {lines.map((line) => {
                      const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
                      const isDefaultVariant = line.merchandise.title === 'Default Title';
                      return (
                        <li key={line.id} className="flex gap-3 py-4 first:pt-1">
                          {isDeleteMode && (
                            <label className="flex w-5 shrink-0 cursor-pointer items-center">
                              <input
                                type="checkbox"
                                checked={selectedLineIds.has(line.id)}
                                onChange={() => toggleLineSelection(line.id)}
                                aria-label={`Select ${line.merchandise.product.title} for removal`}
                                className="h-4 w-4 accent-neutral-950"
                              />
                            </label>
                          )}
                          <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden bg-neutral-100">
                            {image && (
                              <img src={image.url} alt={image.altText ?? line.merchandise.product.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-neutral-950">{line.merchandise.product.title}</p>
                            {!isDefaultVariant && (
                              <p className="text-xs text-neutral-500">{line.merchandise.title}</p>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex h-7 items-center rounded-full bg-neutral-100 text-sm">
                                <button
                                  type="button"
                                  className="h-full w-7 rounded-full disabled:opacity-40"
                                  aria-label="Decrease quantity"
                                  onClick={() => changeQuantity(line.id, line.quantity - 1)}
                                  disabled={line.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-medium">{line.quantity}</span>
                                <button
                                  type="button"
                                  className="h-full w-7 rounded-full disabled:opacity-40"
                                  aria-label="Increase quantity"
                                  onClick={() => changeQuantity(line.id, line.quantity + 1)}
                                  disabled={line.quantity >= MAX_LINE_QUANTITY}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap text-neutral-950">
                            {line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            {lines.length > 0 && cart && (
              <div className="border-t border-neutral-200 bg-white px-5 py-4 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>
                    {cart.cost.subtotalAmount.amount} {cart.cost.subtotalAmount.currencyCode}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="mb-2 block text-center text-xs font-semibold text-neutral-500 underline"
                >
                  View full cart
                </Link>
                <a
                  href={cart.checkoutUrl}
                  className="block rounded-full bg-[#e50920] py-3 text-center text-sm font-bold text-white shadow-[0_6px_14px_rgba(229,9,32,0.22)] hover:bg-[#c7071b]"
                >
                  Go to checkout <span className="ml-1">›</span>
                </a>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
