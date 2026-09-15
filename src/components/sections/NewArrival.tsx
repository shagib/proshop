'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addItemToCart } from '@/actions/cart';
import { notifyCartUpdated } from '@/lib/cart-events';
import { getOptionValues, getProductBadgeInfo } from '@/lib/product-helpers';
import { getSwatchColor } from '@/lib/colors';
import { Product } from '@/lib/shopify/products';
import WishlistButton from '@/components/wishlistButton';

type MinimalProductCardProps = {
    product: Product;
};

export default function MinimalProductCard({ product }: MinimalProductCardProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isPending, startTransition] = useTransition();
    const images = product.images.edges.map((edge) => edge.node);
    const displayImage = images[activeImageIndex] ?? product.featuredImage;
    const defaultVariant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;
    const { hasDiscount, discountPercent } = getProductBadgeInfo(product);
    const colorOption = product.options.find((option) => option.name.toLowerCase() === 'color');
    const colorValues = colorOption ? getOptionValues(colorOption) : [];
    const currencyCode = product.priceRange.minVariantPrice.currencyCode;
    const formatPrice = (amount: string) => new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
    }).format(Number(amount));

    function changeImage(event: MouseEvent, direction: -1 | 1) {
        event.preventDefault();
        event.stopPropagation();
        setActiveImageIndex((index) => (index + direction + images.length) % images.length);
    }

    function handleAddToCart(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!defaultVariant) return;

        startTransition(async () => {
            await addItemToCart(defaultVariant.id, 1);
            notifyCartUpdated({ openDrawer: true });
        });
    }

    return (

        <Link href={`/products/${product.handle}`} className="group block flex-none w-[340px] bg-neutral-50 border border-neutral-100">
            
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                <div className="absolute right-5 top-5 z-10">
                    <WishlistButton
                        productId={product.id}
                        productHandle={product.handle}
                        productTitle={product.title}
                        productImage={product.featuredImage?.url ?? null}
                    />
                </div>

                {displayImage && (
                    <Image
                        src={displayImage.url}
                        alt={displayImage.altText ?? product.title}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                )}

                {images.length > 1 && (
                    <>
                        <button type="button" onClick={(event) => changeImage(event, -1)} aria-label="Previous image" className="absolute left-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center bg-white text-neutral-950 group-hover:flex">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 6.75H0.749998M6.75 12.75L0.749998 6.75L6.75 0.75" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button type="button" onClick={(event) => changeImage(event, 1)} aria-label="Next image" className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center bg-white text-neutral-950 group-hover:flex">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.75 6.75H13M7 12.75L13 6.75L7 0.75" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </>
                )}

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!defaultVariant || isPending}
                    className="absolute bottom-5 left-5 right-5 hidden h-12 bg-neutral-950 text-base leading-[22.4px] font-semibold text-white cursor-pointer hover:bg-neutral-800 group-hover:block disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isPending ? 'Adding...' : defaultVariant ? 'Add to cart' : 'Sold out'}
                </button>
            </div>

            <div className="p-5">
                <h3 className="truncate text-xl font-semibold leading-[40px] text-neutral-950 pb-2 border-b border-neutral-400">{product.title}</h3>
                <p className="mt-3 flex items-center gap-2 text-base leading-[22.4px] font-semibold">
                    {hasDiscount && (
                        <span className="text-neutral-400 line-through">
                            {formatPrice(product.compareAtPriceRange.minVariantPrice.amount)}
                        </span>
                    )}
                    <span className={hasDiscount ? 'text-neutral-950' : 'text-neutral-950'}>
                        {formatPrice(product.priceRange.minVariantPrice.amount)}
                    </span>
                    {hasDiscount && <span className="rounded-full bg-error-base px-[3px] py-[1px] text-[10px] leading-[13px] font-medium text-white">-{discountPercent}%</span>}
                </p>

                {colorValues.length > 0 && (
                    <div className="mt-2 flex gap-1.5">
                        {colorValues.map((optionValue) => (
                            <span key={optionValue.id} title={optionValue.name} className="h-2.5 w-2.5 rounded-full border border-neutral-200" style={{ backgroundColor: getSwatchColor(optionValue.name, optionValue.swatch?.color) }} />
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}