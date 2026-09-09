'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addItemToCart } from '@/actions/cart';
import { notifyCartUpdated } from '@/lib/cart-events';
import { Product } from '@/lib/shopify/products';
import { getProductBadgeInfo } from '@/lib/product-helpers';
import { getSwatchColor } from '@/lib/colors';
import WishlistButton from '@/components/wishlistButton';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const images = product.images.edges.map((edge) => edge.node);
  const displayImage = images[activeImageIndex] ?? product.featuredImage;
  const hasMultipleImages = images.length > 1;

  const { hasDiscount, discountPercent } = getProductBadgeInfo(product);

  const colorOption = product.options.find((option) => option.name.toLowerCase() === 'color');
  const colorValues = colorOption?.values.filter((value) =>
    product.variants.edges.some((edge) =>
      edge.node.availableForSale && edge.node.selectedOptions.some(
        (option) => option.name.toLowerCase() === 'color' && option.value === value,
      ),
    ),
  ) ?? [];
  const defaultVariant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;

  function showPrevImage(event: React.MouseEvent) {
    event.preventDefault();
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function showNextImage(event: React.MouseEvent) {
    event.preventDefault();
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!defaultVariant) return;

    startTransition(async () => {
      await addItemToCart(defaultVariant.id, 1);
      notifyCartUpdated({ openDrawer: true });
    });
  }

  return (
    <Link href={`/products/${product.handle}`} className="product-card group relative block">
      {/* ===== Wishlist ===== */}
      <div className="absolute top-3 left-3 z-10">
        <WishlistButton
          productId={product.id}
          productHandle={product.handle}
          productTitle={product.title}
          productImage={product.featuredImage?.url ?? null}
        />
      </div>

      {/* ===== Discount Badge ===== */}
      {hasDiscount && (
        <span className="absolute top-3 right-3 z-10 bg-error-base text-white text-xs font-semibold px-2 py-1 rounded">
          -{discountPercent}%
        </span>
      )}

      {/* ===== Image + Hover Arrows ===== */}
      <div className="product-card__image-wrapper relative bg-neutral-50 rounded-lg overflow-hidden aspect-square">
        {displayImage && (
          <img
            src={displayImage.url}
            alt={displayImage.altText ?? product.title}
            className="w-full h-full object-cover"
          />
        )}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPrevImage}
              aria-label="Previous image"
              className="hidden group-hover:flex absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white items-center justify-center shadow"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNextImage}
              aria-label="Next image"
              className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white items-center justify-center shadow"
            >
              ›
            </button>
          </>
        )}

        {/* ===== Add to Cart - Hover এ দেখা যায় ===== */}
        <button
          type="button"
            onClick={handleAddToCart}
            disabled={!defaultVariant || isPending}
          className="hidden group-hover:block absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm px-4 py-2 rounded whitespace-nowrap"
        >
          {isPending ? 'Adding...' : defaultVariant ? 'Add to cart' : 'Sold out'}
        </button>
      </div>

      {/* ===== Info ===== */}
      <div className="product-card__content mt-3">
        {product.vendor && (
          <span className="block text-xs text-neutral-500 uppercase tracking-wide">
            {product.vendor}
          </span>
        )}

        <div className="flex justify-between items-start gap-2 mt-1">
          <div>
            <h3 className="text-base font-medium text-neutral-900">{product.title}</h3>
            {product.productType && (
              <span className="text-sm text-neutral-500">{product.productType}</span>
            )}
          </div>

          <div className="text-right">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-sm text-neutral-400 line-through">
                  {product.compareAtPriceRange.minVariantPrice.amount}
                </span>
                <span className="font-semibold text-neutral-900">
                  {product.priceRange.minVariantPrice.amount}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-neutral-900">
                {product.priceRange.minVariantPrice.amount}
              </span>
            )}
          </div>
        </div>

        {/* ===== Color Swatches ===== */}
        {colorValues.length > 0 && (
          <div className="flex gap-2 mt-2">
            {colorValues.map((value) => (
              <span
                key={value}
                title={value}
                role="link"
                tabIndex={0}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  router.push(`/products/${product.handle}?color=${encodeURIComponent(value)}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(`/products/${product.handle}?color=${encodeURIComponent(value)}`);
                  }
                }}
                className="w-4 h-4 rounded-full border border-neutral-200"
                style={{ backgroundColor: getSwatchColor(value) }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}