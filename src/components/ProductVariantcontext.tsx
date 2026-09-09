'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SingleProduct, ProductVariant } from '@/lib/shopify/products';
import {
  findMatchingVariant,
  findVariantForSelectedOptions,
  getDefaultVariant,
  optionsFromVariant,
  type SelectedOptions,
} from '@/lib/product-helpers';


type ProductVariantContextValue = {
  product: SingleProduct;
  variants: ProductVariant[];
  selectedOptions: SelectedOptions;
  selectedVariant: ProductVariant | undefined;
  setOption: (name: string, value: string) => void;
};


const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);
 
type ProductVariantProviderProps = {
  product: SingleProduct;
  /** Pre-select from the URL, e.g. ?color=Red coming from a product card. */
  initialOptions?: SelectedOptions;
  children: ReactNode;
};

export function ProductVariantProvider({
  product,
  initialOptions,
  children,
}: ProductVariantProviderProps) {
  const variants = useMemo(() => product.variants.edges.map((edge) => edge.node), [product]);
 
  const startingVariant = useMemo(() => {
    if (initialOptions && Object.keys(initialOptions).length > 0) {
      const matched = findMatchingVariant(variants, initialOptions)
        ?? findVariantForSelectedOptions(variants, initialOptions);
      if (matched) return matched;
    }
    return getDefaultVariant(variants);
  }, [variants, initialOptions]);
 
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
    startingVariant ? optionsFromVariant(startingVariant) : {},
  );
 
  const selectedVariant = useMemo(
    () => findMatchingVariant(variants, selectedOptions) ?? startingVariant,
    [variants, selectedOptions, startingVariant],
  );
 
  function setOption(name: string, value: string) {
    setSelectedOptions((prev) => {
      const nextOptions = { ...prev, [name]: value };
      const matchingVariant = findVariantForSelectedOptions(variants, nextOptions);
      return matchingVariant ? optionsFromVariant(matchingVariant) : nextOptions;
    });
  }
 
  return (
    <ProductVariantContext.Provider
      value={{ product, variants, selectedOptions, selectedVariant, setOption }}
    >
      {children}
    </ProductVariantContext.Provider>
  );
}


export function useProductVariant() {
  const ctx = useContext(ProductVariantContext);
  if (!ctx) {
    throw new Error('useProductVariant must be used inside a <ProductVariantProvider>');
  }
  return ctx;
}