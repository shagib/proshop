'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createCart, addToCart, getCart, updateCartLine as updateShopifyCartLine, removeFromCart, type Cart } from "@/lib/shopify/cart";
import { MAX_LINE_QUANTITY } from "@/lib/cart-constants";
import { canIncreaseCartLine } from "@/lib/cart-stock";

export type AddToCartResult =
    | { success: true; cart: Cart }
    | { success: false; message: string; cart?: Cart };

export type UpdateCartLineResult =
    | { success: true; cart: Cart }
    | { success: false; message: string; cart?: Cart };

async function getCartId() {
    const cookieStore = await cookies();
    return cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;
}

function setCartCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, cartId: string) {
    cookieStore.set('cartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });
}

function clearCartCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
    cookieStore.delete('cartId');
    cookieStore.delete('cartID');
}

function validateVariantId(variantId: string) {
    if (typeof variantId !== 'string' || variantId.length === 0 || variantId.length > 500) {
        throw new Error('Invalid product variant.');
    }
}

function validateQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
        throw new Error(`You can order a maximum of ${MAX_LINE_QUANTITY} items.`);
    }
}

// ✅ 1. Add Item To Cart
export async function addItemToCart(variantId: string, quantity: number): Promise<AddToCartResult> {
    try {
        validateVariantId(variantId);
        validateQuantity(quantity);
        const cookieStore = await cookies();
        const existingCartId = cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;

        let cart;

        if (existingCartId) {
            const existingCart = await getCart(existingCartId);

            if (existingCart) {
                const existingLine = existingCart.lines.edges.find(
                    (edge) => edge.node.merchandise.id === variantId
                );

                if (
                    existingLine &&
                    !canIncreaseCartLine(existingLine.node, quantity)
                ) {
                    return {
                        success: false,
                        message: 'Requested quantity exceeds available stock.',
                        cart: existingCart
                    };
                }

                cart = await addToCart(existingCartId, variantId, quantity);
            } else {
                clearCartCookies(cookieStore);
                cart = await createCart(variantId, quantity);
                if (cart?.id) setCartCookie(cookieStore, cart.id);
            }
        } else {
            cart = await createCart(variantId, quantity);
            if (cart?.id) setCartCookie(cookieStore, cart.id);
        }

        revalidatePath('/', 'layout');
        return { success: true, cart };
    } catch (error) {
        console.error("====== SERVER ACTION ERROR ======", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Out of stock or unavailable.'
        };
    }
}

// ✅ 2. Buy Now — fresh checkout cart with a single line (does not touch the saved cart cookie)
export async function createBuyNowCart(variantId: string, quantity: number): Promise<Cart> {
    validateVariantId(variantId);
    validateQuantity(quantity);
    return createCart(variantId, quantity);
}

// ✅ 3. Get Current Cart (Required by CartWidget.tsx)
export async function getCurrentCart() {
    try {
        const cookieStore = await cookies();
        const cartId = cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;
        if (!cartId) return null;

        const cart = await getCart(cartId);
        if (!cart) {
            clearCartCookies(cookieStore);
            return null;
        }
        return cart;
    } catch (error) {
        console.error("Error fetching current cart:", error);
        return null;
    }
}

// ✅ 4. Update Cart Line
export async function updateCartLine(
    lineId: string,
    quantity: number,
): Promise<UpdateCartLineResult> {
    if (typeof lineId !== 'string' || lineId.length === 0) {
        return { success: false, message: 'Invalid cart line.' };
    }

    const cartId = await getCartId();
    if (!cartId) {
        return { success: false, message: 'Cart not found.' };
    }

    try {
        validateQuantity(quantity);
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Invalid quantity.',
        };
    }

    try {
        const currentCart = await getCart(cartId);
        if (!currentCart) {
            return { success: false, message: 'Cart not found.' };
        }

        const currentLine = currentCart.lines.edges.find((edge) => edge.node.id === lineId)?.node;
        if (!currentLine) {
            return { success: false, message: 'Cart item not found.', cart: currentCart };
        }

        const increase = quantity - currentLine.quantity;
        if (increase > 0 && !canIncreaseCartLine(currentLine, increase)) {
            return {
                success: false,
                message: 'This product is out of stock or the requested quantity is unavailable.',
                cart: currentCart,
            };
        }

        const updated = await updateShopifyCartLine(cartId, lineId, quantity);
        revalidatePath('/', 'layout');
        return { success: true, cart: updated };
    } catch (error) {
        console.error('Error updating cart line:', error);
        let cart: Cart | undefined;
        try {
            cart = (await getCart(cartId)) ?? undefined;
        } catch {
            cart = undefined;
        }
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update line quantity.',
            cart,
        };
    }
}

// ✅ 5. Remove Item From Cart
export async function removeItemFromCart(lineId: string) {
    if (typeof lineId !== 'string' || lineId.length === 0) {
        throw new Error('Invalid cart line.');
    }
    const cartId = await getCartId();
    if (!cartId) return null;

    try {
        const res = await removeFromCart(cartId, lineId);
        revalidatePath('/', 'layout');
        return res;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to remove item');
    }
}