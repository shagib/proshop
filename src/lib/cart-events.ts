export const CART_UPDATED_EVENT = 'cart-updated';

export type CartUpdatedDetail = {
  /** Whether the right-side cart drawer should pop open after this change. */
  openDrawer?: boolean;
};

export function notifyCartUpdated(detail: CartUpdatedDetail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CartUpdatedDetail>(CART_UPDATED_EVENT, { detail }));
}