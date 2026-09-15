'use client';

import { useProductVariant } from './ProductVariantcontext';
import { getSwatchColor } from '@/lib/colors';
import { getAvailableValuesForOption, getOptionValues, hasRealVariants } from '@/lib/product-helpers';

export default function ProductOptions() {
  const { product, variants, selectedOptions, setOption } = useProductVariant();

  if (!hasRealVariants(product)) {
    return null;
  }

  return (
    <div className="product-options mt-10 flex flex-col gap-10">
      {product.options.map((option) => {
        const isEyewearFrameColor = option.name.trim().toLowerCase() === 'eyewear frame color';
        const isColor = option.name.trim().toLowerCase() === 'color';
        const availableValues = getAvailableValuesForOption(
          variants,
          option.name,
          selectedOptions,
        );
        const optionValues = getOptionValues(option);

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

            {isEyewearFrameColor ? (
              <select
                value={selectedOptions[option.name] ?? ''}
                onChange={(event) => setOption(option.name, event.target.value)}
                aria-label={`Select ${option.name}`}
                className="w-full max-w-sm rounded border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              >
                {optionValues.map((optionValue) => (
                  <option
                    key={optionValue.name}
                    value={optionValue.name}
                    disabled={!availableValues.has(optionValue.name)}
                  >
                    {optionValue.name}
                    {!availableValues.has(optionValue.name) ? ' (Unavailable)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap gap-2">
                {optionValues.map((optionValue) => {
                  const value = optionValue.name;
                  const isSelected = selectedOptions[option.name] === value;
                  const isAvailable = availableValues.has(value);

                  return isColor ? (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      aria-pressed={isSelected}
                      aria-label={value}
                      disabled={!isAvailable}
                      onClick={() => setOption(option.name, value)}
                      className={`relative h-8 w-8 rounded-full border-2 transition ${
                        isSelected ? 'border-neutral-950' : 'border-neutral-200'
                      } ${!isAvailable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:border-neutral-500'}`}
                      style={{ backgroundColor: getSwatchColor(value, optionValue.swatch?.color) }}
                    />
                  ) : (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={!isAvailable}
                      onClick={() => setOption(option.name, value)}
                      className={`rounded border px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-200 text-neutral-900'
                      } ${!isAvailable ? 'cursor-not-allowed opacity-60 line-through' : 'cursor-pointer hover:border-neutral-950'}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}