import { MAX_LINE_QUANTITY } from '@/lib/cart-constants';

type CartLineLike = {
  quantity: number;
  merchandise: {
    quantityAvailable: number | null;
  };
};

/** Shopify cart context: quantityAvailable = how many MORE can be added to this line. */
export function canIncreaseCartLine(line: CartLineLike, increase = 1): boolean {
  if (increase <= 0) return true;
  if (line.quantity + increase > MAX_LINE_QUANTITY) return false;
  const available = line.merchandise.quantityAvailable;
  if (available === null) return true;
  return increase <= available;
}

/** Keep optimistic cart UI in sync when quantity changes locally. */
export function applyLineQuantityChange<T extends CartLineLike>(line: T, nextQuantity: number): T {
  const increase = nextQuantity - line.quantity;
  const available = line.merchandise.quantityAvailable;
  const nextAvailable =
    available === null ? null : Math.max(0, available - increase);

  return {
    ...line,
    quantity: nextQuantity,
    merchandise: {
      ...line.merchandise,
      quantityAvailable: nextAvailable,
    },
  };
}

/** Max total quantity allowed on this cart line. */
export function getCartLineMaxQuantity(line: CartLineLike): number {
  const available = line.merchandise.quantityAvailable;
  if (available === null) return MAX_LINE_QUANTITY;
  return Math.min(MAX_LINE_QUANTITY, line.quantity + available);
}

export type VariantStockLike = {
  id: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
};

type CartLike = {
  lines: {
    edges: {
      node: {
        quantity: number;
        merchandise: {
          id: string;
          quantityAvailable: number | null;
        };
      };
    }[];
  };
} | null;

export function getCartVariantQuantity(cart: CartLike, variantId: string): number {
  return (
    cart?.lines.edges.find((edge) => edge.node.merchandise.id === variantId)?.node.quantity ?? 0
  );
}

/** How many more units of this variant can still be added to the cart. */
export function getMaxAddableQuantity(
  variant: VariantStockLike,
  cart: CartLike,
  pendingAdds = 0,
): number {
  const cartLine = cart?.lines.edges.find(
    (edge) => edge.node.merchandise.id === variant.id,
  )?.node;

  if (cartLine) {
    const available = cartLine.merchandise.quantityAvailable;
    if (available === null) {
      return Math.max(0, MAX_LINE_QUANTITY - cartLine.quantity - pendingAdds);
    }
    return Math.max(0, available - pendingAdds);
  }

  if (!variant.availableForSale) return 0;
  if (variant.quantityAvailable === null) return MAX_LINE_QUANTITY;
  const inCart = getCartVariantQuantity(cart, variant.id);
  return Math.max(0, variant.quantityAvailable - inCart - pendingAdds);
}

export function isVariantPurchasable(
  variant: VariantStockLike,
  cart: CartLike,
  pendingAdds = 0,
): boolean {
  return getMaxAddableQuantity(variant, cart, pendingAdds) > 0;
}

/** Remaining purchasable units for a variant on a product card (store stock minus cart). */
export function getVariantRemainingStock(
  variant: VariantStockLike,
  cartQuantity: number,
  pendingAdds = 0,
): number {
  if (!variant.availableForSale) return 0;

  const storeStock = variant.quantityAvailable;
  if (storeStock === null) {
    // Inventory not exposed on product query — treat as untracked / unlimited.
    return Infinity;
  }

  return Math.max(0, storeStock - cartQuantity - pendingAdds);
}
