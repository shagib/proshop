'use client';

import { useRef, useState, useTransition } from 'react';
import type { Cart } from '@/lib/shopify/cart';
import { getCurrentCart, updateCartLine, removeItemFromCart } from '@/actions/cart';
import { notifyCartUpdated } from '@/lib/cart-events';
import { MAX_LINE_QUANTITY } from '@/lib/cart-constants';

export default function CartPageLines({ initialCart }: { initialCart: Cart }) {
  const [cart, setCart] = useState(initialCart);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const requestVersions = useRef<Record<string, number>>({});

  const lines = cart.lines.edges.map((edge) => edge.node);

  function changeQuantity(lineId: string, quantity: number) {
    const currentLine = cart.lines.edges.find((edge) => edge.node.id === lineId)?.node;
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
    setCart((current) => ({
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
          notifyCartUpdated();
        }
      } catch {
        const latest = await getCurrentCart();
        if (latest) setCart(latest);
        setMessage('This product is out of stock or the requested quantity is unavailable.');
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
      {message && <p className="text-sm font-medium text-red-600" role="status">{message}</p>}
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
                    <button type="button" className="px-3 py-1 disabled:opacity-40" aria-label="Decrease quantity" onClick={() => changeQuantity(line.id, line.quantity - 1)} disabled={line.quantity <= 1}>
                      -
                    </button>
                    <span className="px-3">{line.quantity}</span>
                    <button type="button" className="px-3 py-1 disabled:opacity-40" aria-label="Increase quantity" onClick={() => changeQuantity(line.id, line.quantity + 1)} disabled={line.quantity >= 100}>
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