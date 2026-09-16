'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MAX_LINE_QUANTITY } from '@/lib/cart-constants';

type CartAddPopupProps = {
  productTitle: string;
  imageUrl: string | null;
  status: 'success' | 'error';
  quantity?: number;
  checkoutUrl?: string;
  onUpdateQuantity?: (quantity: number) => Promise<number>;
  onClose: () => void;
};

export default function CartAddPopup({
  productTitle,
  imageUrl,
  status,
  quantity = 1,
  checkoutUrl,
  onUpdateQuantity,
  onClose,
}: CartAddPopupProps) {
  const isSuccess = status === 'success';
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  async function changeQuantity(nextQuantity: number) {
    if (!onUpdateQuantity || nextQuantity < 1 || nextQuantity > MAX_LINE_QUANTITY) return;
    setIsUpdating(true);
    setQuantityError(null);
    try {
      await onUpdateQuantity(nextQuantity);
    } catch {
      setQuantityError('This quantity is not available.');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={(event) => event.stopPropagation()}
      className="absolute right-[-292px] top-4 z-40 flex h-[88px] w-[280px] items-center gap-3 border border-neutral-200 bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.14)] max-[767px]:fixed max-[767px]:inset-x-4 max-[767px]:bottom-[calc(5rem+env(safe-area-inset-bottom))] max-[767px]:right-auto max-[767px]:top-auto max-[767px]:h-auto max-[767px]:w-auto max-[767px]:animate-[cart-popup-up_180ms_ease-out]"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={productTitle} fill sizes="56px" className="object-cover" />
        ) : (
          <span className="block h-full w-full bg-neutral-100" />
        )}
      </div>
      <div className="min-w-0 flex-1 pr-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${isSuccess ? 'text-emerald-700' : 'text-red-600'}`}>
          {isSuccess ? 'Added to cart' : 'Unable to add'}
        </p>
        <p className="truncate text-sm font-medium text-neutral-950">{productTitle}</p>
        {isSuccess && onUpdateQuantity ? (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-6 items-center border border-neutral-200 text-xs">
              <button type="button" aria-label="Decrease quantity" disabled={isUpdating || quantity <= 1} onClick={() => changeQuantity(quantity - 1)} className="h-full w-6 disabled:opacity-40">-</button>
              <span className="w-5 text-center">{quantity}</span>
              <button type="button" aria-label="Increase quantity" disabled={isUpdating || quantity >= MAX_LINE_QUANTITY} onClick={() => changeQuantity(quantity + 1)} className="h-full w-6 disabled:opacity-40">+</button>
            </div>
            {checkoutUrl && (
              <a
                href={checkoutUrl}
                className="bg-neutral-950 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-neutral-700"
              >
                Buy now
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">This item may be out of stock.</p>
        )}
        {quantityError && <p className="mt-1 text-[11px] text-red-600">{quantityError}</p>}
      </div>
      <button
        type="button"
        aria-label="Close cart notification"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-2 top-2 text-lg leading-none text-neutral-400 hover:text-neutral-950"
      >
        &times;
      </button>
    </div>
  );
}
