'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addItemToCart } from '@/actions/cart';
import { notifyCartUpdated } from '@/lib/cart-events';
import { getProductBadgeInfo } from '@/lib/product-helpers';
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
    const colorValues = colorOption?.values ?? [];

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
        <Link href={`/products/${product.handle}`} className="group block flex-none">
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                <div className="absolute right-3 top-3 z-10">
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
                        className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                )}

                {images.length > 1 && (
                    <>
                        <button type="button" onClick={(event) => changeImage(event, -1)} aria-label="Previous image" className="absolute left-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center bg-white text-neutral-950 group-hover:flex">
                            &#8592;
                        </button>
                        <button type="button" onClick={(event) => changeImage(event, 1)} aria-label="Next image" className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center bg-white text-neutral-950 group-hover:flex">
                            &#8594;
                        </button>
                    </>
                )}

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!defaultVariant || isPending}
                    className="absolute bottom-3 left-3 right-3 hidden h-9 bg-neutral-950 text-xs font-medium text-white group-hover:block disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isPending ? 'Adding...' : defaultVariant ? 'Add to cart' : 'Sold out'}
                </button>
            </div>

            <div className="px-1 pt-3">
                <h3 className="truncate text-sm font-medium leading-5 text-neutral-950">{product.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs leading-4">
                    {hasDiscount && (
                        <span className="text-neutral-400 line-through">
                            {product.compareAtPriceRange.minVariantPrice.amount}
                        </span>
                    )}
                    <span className={hasDiscount ? 'font-medium text-error-base' : 'font-medium text-neutral-950'}>
                        {product.priceRange.minVariantPrice.amount}
                    </span>
                    {hasDiscount && <span className="rounded-full bg-error-base px-1.5 py-0.5 text-[9px] font-semibold text-white">-{discountPercent}%</span>}
                </div>
                {colorValues.length > 0 && (
                    <div className="mt-2 flex gap-1.5">
                        {colorValues.map((value) => (
                            <span key={value} title={value} className="h-2.5 w-2.5 rounded-full border border-neutral-200" style={{ backgroundColor: getSwatchColor(value) }} />
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}