'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCurrentCart } from '@/actions/cart';
import { CART_UPDATED_EVENT } from '@/lib/cart-events';
import type { Cart } from '@/lib/shopify/cart';

export function useLiveCart(initialCart: Cart | null = null) {
  const [liveCart, setLiveCart] = useState<Cart | null>(initialCart);

  useEffect(() => {
    setLiveCart(initialCart);
  }, [initialCart]);

  const refreshLiveCart = useCallback(async () => {
    setLiveCart(await getCurrentCart());
  }, []);

  useEffect(() => {
    function handleCartUpdated() {
      void refreshLiveCart();
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, [refreshLiveCart]);

  useEffect(() => {
    void refreshLiveCart();
  }, [refreshLiveCart]);

  return { liveCart, setLiveCart, refreshLiveCart };
}
