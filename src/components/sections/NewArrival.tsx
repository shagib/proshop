'use client';

import { useEffect, useState, useTransition, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addItemToCart, updateCartLine } from '@/actions/cart';
import { CART_UPDATED_EVENT, notifyCartUpdated, type CartUpdatedDetail } from '@/lib/cart-events';
import { getDefaultVariant, getOptionValues, getProductBadgeInfo, hasRealVariants } from '@/lib/product-helpers';
import { getSwatchColor } from '@/lib/colors';
import { Product } from '@/lib/shopify/products';
import type { Cart } from '@/lib/shopify/cart';
import WishlistButton from '@/components/wishlistButton';
import CartAddPopup from '@/components/CartAddPopup';

type MinimalProductCardProps = {
    product: Product;
};

export default function MinimalProductCard({ product }: MinimalProductCardProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [cartPopup, setCartPopup] = useState<'success' | 'error' | null>(null);
    const [addedCart, setAddedCart] = useState<Cart | null>(null);

    useEffect(() => {
        function closePreviousPopup(event: Event) {
            const detail = (event as CustomEvent<CartUpdatedDetail>).detail;
            if (detail?.popupProductId && detail.popupProductId !== product.id) {
                setCartPopup(null);
                setAddedCart(null);
            }
        }

        window.addEventListener(CART_UPDATED_EVENT, closePreviousPopup);
        return () => window.removeEventListener(CART_UPDATED_EVENT, closePreviousPopup);
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
    const displayImage = selectedVariant?.image ?? images[activeImageIndex] ?? product.featuredImage;
    const isAvailable = Boolean(
        selectedVariant?.availableForSale && selectedVariant.quantityAvailable > 0,
    );
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
        if (!selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable <= 0) return;

        startTransition(async () => {
            try {
                const updatedCart = await addItemToCart(selectedVariant.id, 1);
                setAddedCart(updatedCart);
                setCartPopup('success');
                notifyCartUpdated({ popupProductId: product.id });
            } catch {
                setIsOutOfStock(true);
                setCartPopup('error');
            }
        });
    }

    async function updatePopupQuantity(quantity: number) {
        if (!addedCart) return quantity;
        const line = addedCart.lines.edges.find((edge) => edge.node.merchandise.id === selectedVariant?.id)?.node;
        if (!line) throw new Error('Cart item not found.');
        const updatedCart = await updateCartLine(line.id, quantity);
        if (!updatedCart) throw new Error('Cart item could not be updated.');
        setAddedCart(updatedCart);
        return quantity;
    }

    return (

        <div className="group relative block flex-none w-[340px] bg-neutral-50 border border-neutral-100">
            {cartPopup && (
                <CartAddPopup
                    productTitle={product.title}
                    imageUrl={displayImage?.url ?? null}
                    status={cartPopup}
                    quantity={addedCart?.lines.edges.find((edge) => edge.node.merchandise.id === selectedVariant?.id)?.node.quantity}
                    checkoutUrl={addedCart?.checkoutUrl}
                    onUpdateQuantity={cartPopup === 'success' ? updatePopupQuantity : undefined}
                    onClose={() => {
                        setCartPopup(null);
                        setAddedCart(null);
                    }}
                />
            )}

            <Link href={`/products/${product.handle}`} className="block">
            
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

                {(!isAvailable || isOutOfStock) && (
                    <span className="absolute inset-x-5 top-5 z-10 bg-white/90 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-700">
                        Out of stock
                    </span>
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

                {isAvailable || hasVariants ? (
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || isPending || !selectedVariant.availableForSale || selectedVariant.quantityAvailable <= 0 || isOutOfStock}
                        className="absolute bottom-5 left-5 right-5 hidden h-12 bg-neutral-950 text-base leading-[22.4px] font-semibold text-white cursor-pointer hover:bg-neutral-800 group-hover:block disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isPending ? 'Adding...' : isAvailable && !isOutOfStock ? 'Add to cart' : 'Out of stock'}
                    </button>
                ) : (
                    <span className="absolute bottom-5 left-5 right-5 bg-neutral-700/90 px-4 py-3 text-center text-base font-semibold text-white">
                        Out of stock
                    </span>
                )}
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

                {(!isAvailable || isOutOfStock) && <p className="mt-2 text-sm font-medium text-neutral-500">Out of stock</p>}

                {colorValues.length > 0 && (
                    <div className="mt-2 flex gap-1.5">
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
                                className={`h-3 w-3 cursor-pointer rounded-full border-2 ${selectedColor === optionValue.name ? 'border-neutral-950' : 'border-neutral-200'}`}
                                style={{ backgroundColor: getSwatchColor(optionValue.name, optionValue.swatch?.color) }}
                            />
                        ))}
                    </div>
                )}
            </div>
            </Link>
        </div>
    );
}