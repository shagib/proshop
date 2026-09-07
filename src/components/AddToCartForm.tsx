'use client';

import { useState, useTransition } from "react";
import { addItemToCart } from "@/actions/cart";

type addToCartFormProps = {
  available: boolean;
  variantId: string;
}

export default function AddToCartForm({ available, variantId }: addToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function decrease() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increase() {
    setQuantity((q) => Math.min(10, q + 1));
  }

  function handleAddToCart() {
    startTransition(
      async () => {
        await addItemToCart(variantId, quantity);
        setMessage('Added to cart!');
        setTimeout(() => setMessage(null), 2000);
      }
    )
  }

  return (
    <div className="product-form-actions flex items-start gap-4 mt-10">
      <div className="product-quantity px-5 py-3 border border-neutral-100 rounded w-max flex item-center gap-5 text-base leading-[19.6px] font-bold">
        <button
          type="button"
          className="product-quantity-btn product-quantity-btn--minus"
          aria-label="Decrease quantity"
          onClick={decrease}
        >
          -
        </button>
        <input
          className="product-quantity-input w-[36px]"
          type="number"
          id="number"
          value={quantity}
          min={1}
          minLength={1}
          maxLength={2}
          readOnly
          aria-label="Quantity"/>
        <button
          type="button"
          className="product-quantity-btn product-quantity-btn--plus"
          aria-label="Increase quantity"
          onClick={increase}
        >
          +
        </button>
      </div>
 
      <button
        type="button"
        className="product-add-to-cart text-base leading-[19.6px] font-bold flex gap-3 px-5 py-3 bg-neutral-950 text-neutral border border-neutral-950 rounded cursor-pointer hover:bg-neutral-700 hover:border-neutral-700"
        disabled={!available || isPending}
        onClick={handleAddToCart}
      >
        <span className="product-add-to-cart-text">
          {isPending ? 'ADDING...' : available ? 'ADD TO CART' : 'SOLD OUT'}
        </span>
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.68732 10.6044C3.06782 12.5068 3.25806 13.4581 3.88669 14.0707C4.00287 14.184 4.12857 14.287 4.26239 14.3787C4.98643 14.875 5.95651 14.875 7.89666 14.875H9.10291C11.0431 14.875 12.0131 14.875 12.7372 14.3787C12.871 14.287 12.9967 14.184 13.1129 14.0707C13.7415 13.4581 13.9317 12.5068 14.3122 10.6044C14.8585 7.87303 15.1316 6.50736 14.5029 5.53964C14.389 5.36442 14.2562 5.20233 14.1067 5.05634C13.281 4.25 11.8883 4.25 9.10291 4.25H7.89666C5.11123 4.25 3.71851 4.25 2.8929 5.05634C2.74341 5.20233 2.61053 5.36442 2.49668 5.53964C1.86792 6.50736 2.14105 7.87303 2.68732 10.6044Z" stroke="white" strokeWidth="1.5"/>
          <circle cx="10.8906" cy="7.17188" r="0.796875" fill="white"/>
          <circle cx="6.10938" cy="7.17188" r="0.796875" fill="white"/>
          <path d="M6.375 4.24984V3.5415C6.375 2.3679 7.32639 1.4165 8.5 1.4165C9.6736 1.4165 10.625 2.3679 10.625 3.5415V4.24984" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

      </button>
 
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  )
}