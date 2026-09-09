'use server';

import { getProducts } from '@/lib/shopify/products';

export async function getWishlistProducts(productIds: string[]) {
  if (productIds.length === 0) return [];

  const products = await getProducts({ first: 250 });
  return products.filter((product) => productIds.includes(product.id));
}
