'use client';

import { useState } from 'react';

type AddToCartFormProps = {
  available: boolean;
};

export default function AddToCartForm({ available }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);

  function decrease() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increase() {
    setQuantity((q) => q + 1);
  }

  function handleAddToCart() {
    console.log('Add to cart clicked, quantity:', quantity);
  }

  return (
    <div className="product-form-actions">
      <div className="product-quantity">
        <button
          type="button"
          className="product-quantity-btn product-quantity-btn--minus"
          aria-label="Decrease quantity"
          onClick={decrease}
        >
          -
        </button>
        <input
          className="product-quantity-input"
          type="number"
          value={quantity}
          min={1}
          readOnly
          aria-label="Quantity"
        />
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
        className="product-add-to-cart"
        disabled={!available}
        onClick={handleAddToCart}
      >
        <span className="product-add-to-cart-text">
          {available ? 'ADD TO CART' : 'SOLD OUT'}
        </span>
      </button>
    </div>
  );
}