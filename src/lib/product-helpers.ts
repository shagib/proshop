import { Product, ProductOption, ProductOptionValue } from './shopify/products';

type PriceLike = {
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string
  } | null;
};



export function getProductBadgeInfo(product: Product, variant?: PriceLike | null) {
  const price = parseFloat(
    variant ? variant.price.amount: product.priceRange.minVariantPrice.amount
  );

  const compareAtRaw = variant ? variant.compareAtPrice?.amount : product.compareAtPriceRange.minVariantPrice.amount;
  const compareAtPrice = compareAtRaw ? parseFloat(compareAtRaw) : 0;

  const hasDiscount = compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const daysSinceCreated =
    (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const isNew = daysSinceCreated <= 30;

  return { 
    hasDiscount, 
    discountPercent, 
    isNew,
    price,
    compareAtPrice,
    currencyCode: variant ? variant.price.currencyCode : product.priceRange.minVariantPrice.currencyCode 
  };
}

export function hasRealVariants(
  product: { options: { name: string; values: string[] }[]; 
}): boolean {
  
  if(product.options.length === 0) return false;
  
  if(product.options.length === 1 && product.options[0].name.toLowerCase() === 'title') {
    return false;
  }
  return true;
}

export function getOptionValues(option: ProductOption): ProductOptionValue[] {
  return option.optionValues?.length > 0
    ? option.optionValues
    : option.values.map((value) => ({ id: value, name: value, swatch: null }));
}

export type SelectedOptions = Record<string, string>;

type VariantLike = {
  id: string;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: { name: string; value: string }[];
}

/** Find the variant that matches every selected option value (works for 1..N options: color, size, material, etc). */
export function findMatchingVariant<T extends VariantLike>(
  variants: T[],
  selectedOptions: SelectedOptions
): T | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.length === Object.keys(selectedOptions).length &&
    variant.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
  );
}

/** Find an available variant that matches the options selected so far. */
export function findVariantForSelectedOptions<T extends VariantLike>(
  variants: T[],
  selectedOptions: SelectedOptions,
): T | undefined {
  return variants.find((variant) =>
    Object.entries(selectedOptions).every(
      ([name, value]) => variant.selectedOptions.some((option) => option.name === name && option.value === value),
    )
  );
}


/** Sensible starting variant: first in-stock one, falling back to the first variant overall. */
export function getDefaultVariant<T extends VariantLike>(variants: T[]): T | undefined {
  return variants.find((v) => v.availableForSale && v.quantityAvailable > 0) ?? variants[0];
}

/** Build a selectedOptions map (Color -> "Red", Size -> "M") from a variant. */
export function optionsFromVariant(variant: VariantLike): SelectedOptions {
  return Object.fromEntries(variant.selectedOptions.map((opt) => [opt.name, opt.value]));
}

/** Which values of a given option (e.g. "Color") currently have at least one in-stock variant. */
export function getAvailableValuesForOption(
  variants: VariantLike[],
  optionName: string,
  selectedOptions: SelectedOptions = {},
): Set<string> {
  const set = new Set<string>();
  for (const variant of variants) {
    const matchesOtherOptions = Object.entries(selectedOptions).every(
      ([name, value]) => name === optionName || variant.selectedOptions.some(
        (option) => option.name === name && option.value === value,
      ),
    );
    if (!matchesOtherOptions) continue;

    const match = variant.selectedOptions.find((opt) => opt.name === optionName);
    if (match) set.add(match.value);
  }
  return set;
}









