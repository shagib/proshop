'use client';

import { useEffect, useState, useTransition, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addItemToCart } from '@/actions/cart';
import { CART_UPDATED_EVENT, notifyCartUpdated, type CartUpdatedDetail } from '@/lib/cart-events';
import { getDefaultVariant, getOptionValues, getProductBadgeInfo, hasRealVariants, isVariantInStock } from '@/lib/product-helpers';
import { getSwatchColor } from '@/lib/colors';
import { Product } from '@/lib/shopify/products';
import WishlistButton from '@/components/wishlistButton';

type MinimalProductCardProps = {
    product: Product;
};

export default function MinimalProductCard({ product }: MinimalProductCardProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [stockMessage, setStockMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!stockMessage) return;
        const timer = setTimeout(() => setStockMessage(null), 4000);
        return () => clearTimeout(timer);
    }, [stockMessage]);

    useEffect(() => {
        function clearMessageOnOtherCartUpdate(event: Event) {
            const detail = (event as CustomEvent<CartUpdatedDetail>).detail;
            if (detail?.popupProductId && detail.popupProductId !== product.id) {
                setStockMessage(null);
            }
        }

        window.addEventListener(CART_UPDATED_EVENT, clearMessageOnOtherCartUpdate);
        return () => window.removeEventListener(CART_UPDATED_EVENT, clearMessageOnOtherCartUpdate);
    }, [product.id]);
    
    const images = product.images.edges.map((edge) => edge.node);
    const defaultVariant = getDefaultVariant(product.variants.edges.map((edge) => edge.node));
    const hasVariants = hasRealVariants(product);
    const selectedVariant = selectedColor
        ? product.variants.edges.find((edge) =>
            edge.node.selectedOptions.some(
                (option) => option.name.toLowerCase() === 'color' && option.value === selectedColor,
            ),
        )?.node ?? defaultVariant
        : defaultVariant;
    const displayImage = images[activeImageIndex] ?? selectedVariant?.image ?? product.featuredImage;
    const isAvailable = Boolean(selectedVariant && isVariantInStock(selectedVariant));
    const { hasDiscount, discountPercent } = getProductBadgeInfo(product);
    const colorOption = product.options.find((option) => option.name.toLowerCase() === 'color');
    const colorValues = colorOption ? getOptionValues(colorOption) : [];
    const currencyCode = product.priceRange.minVariantPrice.currencyCode;
    const formatPrice = (amount: string) => new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
    }).format(Number(amount));

    function showPrevImage(event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    }

    function showNextImage(event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }

    function handleAddToCart(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!selectedVariant || !isVariantInStock(selectedVariant)) return;

        startTransition(async () => {
            try {
                const res = await addItemToCart(selectedVariant.id, 1);
                if (!res.success) {
                    setIsOutOfStock(true);
                    setStockMessage(
                        res.message ??
                            "Sorry, we've run out of stock for this product. We're working on restocking it soon.",
                    );
                    return;
                }
                setStockMessage(null);
                notifyCartUpdated({ openDrawer: true, popupProductId: product.id });
            } catch {
                setIsOutOfStock(true);
                setStockMessage('Something went wrong. Please try again.');
            }
        });
    }

    return (
        <div className="group relative block flex-none w-[340px] bg-neutral-50 border border-neutral-100">

            {/* Product Image Box */}
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
            
            {/* Wishlist Button */}
            <div className="absolute right-5 top-5 z-30 pointer-events-auto">
                <WishlistButton
                productId={product.id}
                productHandle={product.handle}
                productTitle={product.title}
                productImage={product.featuredImage?.url ?? null}
                />
            </div>

            {/* Main Image Link */}
            <Link href={`/products/${product.handle}`} className="block h-full w-full">
                {displayImage && (
                <Image
                    src={displayImage.url}
                    alt={displayImage.altText ?? product.title}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
                )}
            </Link>

            {/* Slider Buttons - Absolute Container with High Z-Index */}
            {images.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex justify-between">
                <button 
                    type="button" 
                    onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showPrevImage(e);
                    }} 
                    aria-label="Previous image" 
                    className="pointer-events-auto hidden h-7 w-7 items-center justify-center bg-white text-neutral-950 shadow-sm group-hover:flex hover:bg-neutral-100"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6.75H0.749998M6.75 12.75L0.749998 6.75L6.75 0.75" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <button 
                    type="button" 
                    onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showNextImage(e);
                    }} 
                    aria-label="Next image" 
                    className="pointer-events-auto hidden h-7 w-7 items-center justify-center bg-white text-neutral-950 shadow-sm group-hover:flex hover:bg-neutral-100"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.75 6.75H13M7 12.75L13 6.75L7 0.75" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                </div>
            )}

            {/* Add to Cart Button */}
            <div className="absolute bottom-5 left-5 right-5 z-30 pointer-events-auto">
                {stockMessage && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900 text-white text-xs font-medium py-2 px-3 rounded shadow-lg">
                        {stockMessage}
                    </div>
                )}
                {isAvailable || hasVariants ? (
                <button
                    type="button"
                    onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(e);
                    }}
                    disabled={!selectedVariant || isPending || !isAvailable || isOutOfStock}
                    className="hidden h-12 w-full bg-neutral-950 text-base leading-[22.4px] font-semibold text-white cursor-pointer hover:bg-neutral-800 group-hover:block disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isPending ? 'Adding...' : isAvailable && !isOutOfStock ? 'Add to cart' : 'Out of stock'}
                </button>
                ) : (
                <span className="block w-full bg-neutral-700/90 px-4 py-3 text-center text-base font-semibold text-white">
                    Out of stock
                </span>
                )}
            </div>
            </div>

            {/* Card Details */}
            <div className="p-5">
            <Link href={`/products/${product.handle}`} className="block">
                <h3 className="truncate text-xl font-semibold leading-[40px] text-neutral-950 pb-2 border-b border-neutral-400">
                {product.title}
                </h3>
            </Link>
            
            <div className="flex items-center justify-between mt-2">
                <p className="flex items-center gap-2 text-base leading-[22.4px] font-semibold">
                {hasDiscount && (
                    <span className="text-neutral-400 line-through">
                    {formatPrice(product.compareAtPriceRange.minVariantPrice.amount)}
                    </span>
                )}
                <span className="text-neutral-950">
                    {formatPrice(product.priceRange.minVariantPrice.amount)}
                </span>
                {hasDiscount && (
                    <span className="rounded-full bg-error-base px-[3px] py-[1px] text-[10px] leading-[13px] font-medium text-white">
                    -{discountPercent}%
                    </span>
                )}
                </p>

                {/* Color Swatches */}
                {colorValues.length > 0 && (
                <div className="flex gap-1.5 z-30 relative pointer-events-auto">
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
                        setIsOutOfStock(false);
                        }}
                        className={`h-4 w-4 cursor-pointer rounded-full border ${selectedColor === optionValue.name ? 'border-neutral-950' : 'border-neutral-200'}`}
                        style={{ backgroundColor: getSwatchColor(optionValue.name, optionValue.swatch?.color) }}
                    />
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>
        );
}