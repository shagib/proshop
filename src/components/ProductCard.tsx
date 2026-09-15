'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const images = product.images.edges.map((edge) => edge.node);
  const hasMultipleImages = images.length > 1;

  const { hasDiscount, discountPercent } = getProductBadgeInfo(product);

  const colorOption = product.options.find((option) => option.name.toLowerCase() === 'color');
  const colorValues = (colorOption?.optionValues?.length
    ? colorOption.optionValues
    : colorOption?.values.map((value) => ({ id: value, name: value, swatch: null })) ?? []
  ).filter((optionValue) =>
    product.variants.edges.some((edge) =>
      edge.node.availableForSale && edge.node.selectedOptions.some(
        (option) => option.name.toLowerCase() === 'color' && option.value === optionValue.name,
      ),
    ),
  );
  const defaultVariant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;
  const selectedVariant = selectedColor
    ? product.variants.edges.find((edge) =>
        edge.node.availableForSale && edge.node.selectedOptions.some(
          (option) => option.name.toLowerCase() === 'color' && option.value === selectedColor,
        ),
      )?.node ?? defaultVariant
    : defaultVariant;

  // useEffect(() => {
  //   console.group(`[ProductCard] ${product.title}`);
  //   console.log('Options:', product.options.map((option) => ({
  //     name: option.name,
  //     values: option.optionValues.map((optionValue) => ({
  //       id: optionValue.id,
  //       name: optionValue.name,
  //       swatchColor: optionValue.swatch?.color ?? null,
  //     })),
  //   })));
  //   console.table(product.variants.edges.map(({ node: variant }) => ({
  //     id: variant.id,
  //     title: variant.title,
  //     availableForSale: variant.availableForSale,
  //     options: variant.selectedOptions.map((option) => `${option.name}: ${option.value}`).join(' | '),
  //     price: `${variant.price.amount} ${variant.price.currencyCode}`,
  //     image: variant.image?.url ?? null,
  //   })));
  //   console.groupEnd();
  // }, [product]);

  const displayImage = selectedVariant?.image ?? images[activeImageIndex] ?? product.featuredImage;
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;
  const formatPrice = (amount: string) => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));

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
    if (!selectedVariant) return;

    startTransition(async () => {
      await addItemToCart(selectedVariant.id, 1);
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
          <Image
            src={displayImage.url}
            alt={displayImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
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
            disabled={!selectedVariant || isPending}
          className="hidden group-hover:block absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm px-4 py-2 rounded whitespace-nowrap"
        >
          {isPending ? 'Adding...' : selectedVariant ? 'Add to cart' : 'Sold out'}
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
                  {formatPrice(product.compareAtPriceRange.minVariantPrice.amount)}
                </span>
                <span className="font-semibold text-neutral-900">
                  {formatPrice(product.priceRange.minVariantPrice.amount)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-neutral-900">
                {formatPrice(product.priceRange.minVariantPrice.amount)}
              </span>
            )}
          </div>
        </div>

        {/* ===== Color Swatches ===== */}
        {colorValues.length > 0 && (
          <div className="flex gap-2 mt-2">
            {colorValues.map((optionValue) => (
              <button
                type="button"
                key={optionValue.id}
                title={optionValue.name}
                aria-label={`View ${optionValue.name} color`}
                aria-pressed={selectedColor === optionValue.name}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setSelectedColor(optionValue.name);
                  setActiveImageIndex(0);
                }}
                className={`h-4 w-4 cursor-pointer rounded-full border-2 p-0 ${selectedColor === optionValue.name ? 'border-neutral-950' : 'border-neutral-200'}`}
                style={{ backgroundColor: getSwatchColor(optionValue.name, optionValue.swatch?.color) }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}