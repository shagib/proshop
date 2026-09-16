export const CART_UPDATED_EVENT = 'cart-updated';
export const OPEN_CART_EVENT = 'open-cart';

export type CartUpdatedDetail = {
  /** Whether the right-side cart drawer should pop open after this change. */
  openDrawer?: boolean;
  /** Product card whose local confirmation should remain visible. */
  popupProductId?: string;
};

export function notifyCartUpdated(detail: CartUpdatedDetail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CartUpdatedDetail>(CART_UPDATED_EVENT, { detail }));
}

export function requestCartOpen() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));
}