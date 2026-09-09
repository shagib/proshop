'use client';

import { useProductVariant } from './ProductVariantcontext';
import { getProductBadgeInfo } from '@/lib/product-helpers';

export default function ProductPrice() {
  const { product, selectedVariant } = useProductVariant();
  const { hasDiscount, discountPercent, price, compareAtPrice, currencyCode } =
    getProductBadgeInfo(product, selectedVariant);

  return (
    <p className="product-price flex items-center gap-3 text-3xl font-semibold text-neutral-900 leading-[36px] max-[768px]:text-2xl max-[768px]:leading-[31.2px]">
      <span className="product-price-value">
        {price.toFixed(2)} {currencyCode}
      </span>
      {hasDiscount && (
        <>
          <span className="product-price-compare text-xl font-normal text-neutral-400 line-through">
            {compareAtPrice.toFixed(2)} {currencyCode}
          </span>
          <span className="product-price-discount text-sm font-semibold text-error-base bg-error-base/10 px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </p>
  );
}