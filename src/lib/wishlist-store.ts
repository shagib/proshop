export const WISHLIST_UPDATED_EVENT = 'wishlist-updated';
const WISHLIST_STORAGE_KEY = 'wishlist';

const EMPTY_WISHLIST: string[] = [];

let cachedWishlist: string[] = EMPTY_WISHLIST;
let cachedRaw: string | null = null;

export function getWishlistIds(): string[] {
  if (typeof window === 'undefined') return EMPTY_WISHLIST;

  const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedWishlist;
  }

  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedWishlist = Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')
      ? parsed
      : EMPTY_WISHLIST;
  } catch {
    cachedWishlist = EMPTY_WISHLIST;
  }
  return cachedWishlist;
}

export function getWishlistServerSnapshot(): string[] {
  return EMPTY_WISHLIST;
}

export function subscribeToWishlist(callback: () => void) {
  window.addEventListener(WISHLIST_UPDATED_EVENT, callback);
  return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, callback);
}

export function setWishlistIds(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string'))];
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}