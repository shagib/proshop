'use client';

import { useProductVariant } from './ProductVariantcontext';
import { getSwatchColor } from '@/lib/colors';
import { getAvailableValuesForOption, hasRealVariants } from '@/lib/product-helpers';

export default function ProductOptions() {
  const { product, variants, selectedOptions, setOption } = useProductVariant();

  if (!hasRealVariants(product)) {
    return null;
  }

  return (
    <div className="product-options flex flex-col gap-6">
      {product.options.map((option) => {
        const isColor = option.name.toLowerCase() === 'color';
        const availableValues = getAvailableValuesForOption(variants, option.name);

        return (
          <div key={option.name} className="product-option">
            <span className="block text-sm font-semibold text-neutral-900 mb-2 uppercase tracking-wide">
              {option.name}
              {selectedOptions[option.name] && (
                <span className="font-normal normal-case text-neutral-600">
                  {' '}
                  — {selectedOptions[option.name]}
                </span>
              )}
            </span>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                const isAvailable = availableValues.has(value);

                if (isColor) {
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      aria-pressed={isSelected}
                      aria-label={value}
                      disabled={!isAvailable}
                      onClick={() => setOption(option.name, value)}
                      className={`relative w-8 h-8 rounded-full border-2 transition ${
                        isSelected ? 'border-neutral-950' : 'border-neutral-200'
                      } ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-500'}`}
                      style={{ backgroundColor: getSwatchColor(value) }}
                    />
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={!isAvailable}
                    onClick={() => setOption(option.name, value)}
                    className={`px-4 py-2 rounded border text-sm font-medium transition ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 text-neutral-900 hover:border-neutral-950'
                    } ${!isAvailable ? 'opacity-30 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}