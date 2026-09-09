'use client';

import { useState, useTransition } from 'react';
import type { Cart } from '@/lib/shopify/cart';
import { updateCartLine, removeItemFromCart } from '@/actions/cart';
import { notifyCartUpdated } from '@/lib/cart-events';

export default function CartPageLines({ initialCart }: { initialCart: Cart }) {
  const [cart, setCart] = useState(initialCart);
  const [isPending, startTransition] = useTransition();

  const lines = cart.lines.edges.map((edge) => edge.node);

  function changeQuantity(lineId: string, quantity: number) {
    startTransition(async () => {
      const updated = await updateCartLine(lineId, quantity);
      if (updated) {
        setCart(updated);
        notifyCartUpdated();
      }
    });
  }

  function removeLine(lineId: string) {
    startTransition(async () => {
      const updated = await removeItemFromCart(lineId);
      if (updated) {
        setCart(updated);
        notifyCartUpdated();
      }
    });
  }

  if (lines.length === 0) {
    return <p className="text-neutral-500">Your cart is empty.</p>;
  }

  return (
    <div className="flex flex-col gap-10 max-[900px]:flex-col md:flex-row">
      <ul className="flex-1 flex flex-col gap-6">
        {lines.map((line) => {
          const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
          const isDefaultVariant = line.merchandise.title === 'Default Title';
          return (
            <li key={line.id} className="flex gap-4 border-b border-neutral-100 pb-6">
              <div className="w-24 h-24 flex-shrink-0 bg-neutral-50 border border-neutral-100 rounded-lg overflow-hidden">
                {image && (
                  <img src={image.url} alt={image.altText ?? line.merchandise.product.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">{line.merchandise.product.title}</p>
                {!isDefaultVariant && <p className="text-sm text-neutral-500">{line.merchandise.title}</p>}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-neutral-200 rounded">
                    <button type="button" className="px-3 py-1" aria-label="Decrease quantity" onClick={() => changeQuantity(line.id, line.quantity - 1)} disabled={isPending}>
                      -
                    </button>
                    <span className="px-3">{line.quantity}</span>
                    <button type="button" className="px-3 py-1" aria-label="Increase quantity" onClick={() => changeQuantity(line.id, line.quantity + 1)} disabled={isPending}>
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => removeLine(line.id)} className="text-sm text-neutral-500 underline" disabled={isPending}>
                    Remove
                  </button>
                </div>
              </div>
              <span className="font-medium whitespace-nowrap">
                {line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="w-full md:w-[320px] flex-shrink-0 border border-neutral-100 rounded-lg p-6 h-max flex flex-col gap-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal</span>
          <span>
            {cart.cost.subtotalAmount.amount} {cart.cost.subtotalAmount.currencyCode}
          </span>
        </div>
        <a
          href={cart.checkoutUrl}
          className="text-center text-sm font-bold bg-neutral-950 text-white rounded py-3 hover:bg-neutral-700"
        >
          Checkout
        </a>
      </div>
    </div>
  );
}