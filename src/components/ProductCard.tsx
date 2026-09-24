'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addItemToCart } from '@/actions/cart';
import { notifyCartUpdated } from '@/lib/cart-events';
import { OUT_OF_STOCK_MESSAGE, STOCK_UNAVAILABLE_MESSAGE } from '@/lib/cart-constants';
import { getMaxAddableQuantity, isVariantPurchasable as canPurchaseVariant } from '@/lib/cart-stock';
import { useLiveCart } from '@/hooks/useLiveCart';
import { Product } from '@/lib/shopify/products';
import type { Cart } from '@/lib/shopify/cart';
import { getProductBadgeInfo } from '@/lib/product-helpers';
import WishlistButton from '@/components/wishlistButton';

type ProductCardProps = {
  product: Product;
  cart?: Cart | null;
};

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function ProductCard({ product, cart = null }: ProductCardProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [stockMessage, setStockMessage] = useState<string | null>(null);
  const { liveCart, setLiveCart } = useLiveCart(cart);
  const [pendingAdds, setPendingAdds] = useState<Record<string, number>>({});
  const [exhaustedVariantIds, setExhaustedVariantIds] = useState<Set<string>>(new Set());

  const isMounted = useIsMounted();

  useEffect(() => {
    setPendingAdds({});
    setExhaustedVariantIds(new Set());
  }, [liveCart?.totalQuantity]);

  useEffect(() => {
    if (!stockMessage) return;
    const timer = setTimeout(() => setStockMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [stockMessage]);

  const images = product.images?.edges?.map((edge) => edge.node) || [];
  const hasMultipleImages = images.length > 1;
  const { hasDiscount, discountPercent } = getProductBadgeInfo(product);
  const allVariants = product.variants?.edges?.map((edge) => edge.node) || [];

  function isVariantPurchasable(variant: (typeof allVariants)[number]) {
    if (exhaustedVariantIds.has(variant.id)) return false;
    return canPurchaseVariant(variant, liveCart, pendingAdds[variant.id] ?? 0);
  }

  const availableVariants = allVariants.filter(isVariantPurchasable);
  const selectedVariant = availableVariants[0];
  const isAvailable = Boolean(selectedVariant);

  const displayImage = images[activeImageIndex] ?? product.featuredImage;
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;
  const formatPrice = (amount: string) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(Number(amount));

  function showPrevImage(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function showNextImage(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  async function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const variantToAdd = selectedVariant;
    if (!variantToAdd) {
      setStockMessage('Sorry, this product is currently out of stock.');
      return;
    }

    setIsAdding(true);
    setPendingAdds((prev) => ({
      ...prev,
      [variantToAdd.id]: (prev[variantToAdd.id] ?? 0) + 1,
    }));

    try {
      const res = await addItemToCart(variantToAdd.id, 1);

      if (!res.success) {
        setPendingAdds((prev) => ({
          ...prev,
          [variantToAdd.id]: Math.max(0, (prev[variantToAdd.id] ?? 0) - 1),
        }));
        setExhaustedVariantIds((prev) => new Set(prev).add(variantToAdd.id));
        setStockMessage(
          res.message ??
            "Sorry, we've run out of stock for this product. We're working on restocking it soon."
        );
        if (res.cart) setLiveCart(res.cart);
        return;
      }

      setLiveCart(res.cart);
      setPendingAdds({});
      setStockMessage(null);
      notifyCartUpdated({ openDrawer: true, popupProductId: product.id });
      router.refresh();
    } catch {
      setPendingAdds((prev) => ({
        ...prev,
        [variantToAdd.id]: Math.max(0, (prev[variantToAdd.id] ?? 0) - 1),
      }));
      setStockMessage('Something went wrong. Please try again.');
    } finally {
      setIsAdding(false);
    }
  }

  const isButtonDisabled = !isMounted || !isAvailable || isAdding;

  return (
    <div className="product-card group relative">
      <div className="product-card-wrapper relative bg-neutral-50 pt-14 px-5 pb-4 border border-neutral-100">
        <div className="absolute top-4 left-5 right-5 z-20 flex justify-between items-center pointer-events-none">
          <div>
            {hasDiscount && (
              <span className="bg-error-base text-white text-xs font-semibold px-2 py-1 rounded pointer-events-auto">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="pointer-events-auto">
            <WishlistButton
              productId={product.id}
              productHandle={product.handle}
              productTitle={product.title}
              productImage={product.featuredImage?.url ?? null}
            />
          </div>
        </div>

        <div className="card-img-wrapper relative aspect-square overflow-hidden">
          <Link href={`/products/${product.handle}`} className="block w-full h-full">
            {displayImage && (
              <Image
                src={displayImage.url}
                alt={displayImage.altText ?? product.title}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </Link>

          {hasMultipleImages && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
              <button
                type="button"
                onClick={showPrevImage}
                aria-label="Previous image"
                className="hidden group-hover:flex w-7 h-7 bg-white/90 hover:bg-white text-neutral-900 items-center justify-center shadow pointer-events-auto transition"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6.75H0.749998M6.75 12.75L0.749998 6.75L6.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next image"
                className="hidden group-hover:flex w-7 h-7 bg-white/90 hover:bg-white text-neutral-900 items-center justify-center shadow pointer-events-auto transition"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.75 6.75H13M7 12.75L13 6.75L7 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="product-card-content mt-6 flex justify-between items-end gap-2">
          <div className="flex flex-col items-start gap-3">
            {product.vendor && (
              <span className="block text-sm leading-[16.8px] font-semibold text-neutral-500 uppercase tracking-wide">
                {product.vendor}
              </span>
            )}

            <div>
              <Link href={`/products/${product.handle}`} className="hover:underline">
                <h3 className="text-xl leading-[28.8px] font-semibold text-neutral-950 line-clamp-1 mb-1">
                  {product.title}
                </h3>
              </Link>
              {product.productType && (
                <span className="block text-base leading-[22.4px] font-normal text-neutral-500">
                  {product.productType}
                </span>
              )}
            </div>

            {hasDiscount ? (
              <div className="flex gap-2 items-center">
                <span className="text-sm leading-[20.8px] font-semibold text-neutral-500 line-through">
                  {formatPrice(product.compareAtPriceRange.minVariantPrice.amount)}
                </span>
                <span className="text-sm leading-[20.8px] font-semibold text-neutral-950">
                  {formatPrice(product.priceRange.minVariantPrice.amount)}
                </span>
              </div>
            ) : (
              <span className="text-sm leading-[20.8px] font-semibold text-neutral-950">
                {formatPrice(product.priceRange.minVariantPrice.amount)}
              </span>
            )}
          </div>

          <div className="relative shrink-0">
            {stockMessage && (
              <div className="absolute bottom-full right-0 mb-2 w-max max-w-[220px] bg-neutral-900 text-white text-xs font-medium py-2 px-3 rounded shadow-lg z-30">
                {stockMessage}
              </div>
            )}

            <button
              type="button"
              onClick={(event) => void handleAddToCart(event)}
              disabled={isButtonDisabled}
              className="group/btn relative cursor-pointer flex items-center justify-center bg-neutral-700 h-10 px-2.5 text-white transition-all duration-300 ease-in-out hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:opacity-70"
              aria-label={
                !isMounted
                  ? 'Loading product'
                  : !isAvailable
                  ? 'Out of stock'
                  : 'Add to cart'
              }
            >
              {!isMounted ? (
                <span className="text-xs font-medium">Loading...</span>
              ) : isAdding ? (
                <span className="text-xs">Adding...</span>
              ) : !isAvailable ? (
                <span className="text-xs font-medium">Out of Stock</span>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <path
                      d="M3.79424 14.9709C4.33141 17.6567 4.59999 18.9996 5.48746 19.8646C5.65149 20.0244 5.82894 20.1699 6.01786 20.2994C7.04004 21 8.40956 21 11.1486 21H12.8515C15.5906 21 16.9601 21 17.9823 20.2994C18.1712 20.1699 18.3486 20.0244 18.5127 19.8646C19.4001 18.9996 19.6687 17.6567 20.2059 14.9709C20.9771 11.1149 21.3627 9.18686 20.475 7.82067C20.3143 7.5733 20.1267 7.34447 19.9157 7.13836C18.7501 6 16.7839 6 12.8515 6H11.1486C7.21622 6 5.25004 6 4.08447 7.13836C3.87342 7.34447 3.68582 7.5733 3.5251 7.82067C2.63744 9.18686 3.02304 11.1149 3.79424 14.9709Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="15.375" cy="10.125" r="1.125" fill="currentColor" />
                    <circle cx="8.625" cy="10.125" r="1.125" fill="currentColor" />
                    <path
                      d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span className="inline-block max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-300 ease-in-out group-hover/btn:ml-2 group-hover/btn:max-w-[100px] group-hover/btn:opacity-100">
                    Add to Cart
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
