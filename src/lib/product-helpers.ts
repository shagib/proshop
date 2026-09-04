import { Product } from './shopify';

export function getProductBadgeInfo(product: Product) {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAtPrice = parseFloat(product.compareAtPriceRange.minVariantPrice.amount);

  const hasDiscount = compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const daysSinceCreated =
    (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const isNew = daysSinceCreated <= 30;

  return { hasDiscount, discountPercent, isNew };
}