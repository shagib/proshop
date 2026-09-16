'use server';

import { cookies  } from "next/headers";
import { createCart, addToCart, getCart, updateCartLine as updateShopifyCartLine, removeFromCart } from "@/lib/shopify/cart";
import { MAX_LINE_QUANTITY } from "@/lib/cart-constants";

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

function isClosedCartError(error: unknown) {
    return error instanceof Error && /cart.*(not found|does not exist|expired|invalid)/i.test(error.message);
}

function inventoryError() {
    return new Error('This product is out of stock or the requested quantity is unavailable.');
}

export async function addItemToCart(variantId: string, quantity: number) {
    validateVariantId(variantId);
    validateQuantity(quantity);
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;

    let cart;

    if (existingCartId) {
        const existingCart = await getCart(existingCartId);
        if (!existingCart) {
            clearCartCookies(cookieStore);
            cart = await createCart(variantId, quantity);
            setCartCookie(cookieStore, cart.id);
            return cart;
        }

        const existingLine = existingCart.lines.edges.find(
            (edge) => edge.node.merchandise.id === variantId,
        );
        const availableQuantity = existingLine?.node.merchandise.quantityAvailable;
        if (
            existingLine &&
            availableQuantity !== undefined &&
            (existingLine.node.quantity + quantity > availableQuantity ||
                existingLine.node.quantity + quantity > MAX_LINE_QUANTITY)
        ) {
            throw inventoryError();
        }

        try {
            cart = await addToCart(existingCartId, variantId, quantity);
        } catch (error) {
            if (!isClosedCartError(error)) throw error;
            // A cart is closed after checkout. Start a fresh cart for the next order.
            cart = await createCart(variantId, quantity);
            setCartCookie(cookieStore, cart.id);
        }
    } else {
        cart = await createCart(variantId, quantity);
        setCartCookie(cookieStore, cart.id);
    }
    return cart;
}

export async function createBuyNowCart(variantId: string, quantity: number) {
    validateVariantId(variantId);
    validateQuantity(quantity);
    return createCart(variantId, quantity);
}

export async function getCurrentCart() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;
    if (!cartId) return null;

    const cart = await getCart(cartId);
    if (!cart) clearCartCookies(cookieStore);
    return cart;
}

export async function updateCartLine(lineId: string, quantity: number) {
    if (typeof lineId !== 'string' || lineId.length === 0 || lineId.length > 500) {
        throw new Error('Invalid cart line.');
    }
    const cartId = await getCartId();
    if (!cartId) return null;
    validateQuantity(quantity);

    const cart = await getCart(cartId);
    const line = cart?.lines.edges.find((edge) => edge.node.id === lineId)?.node;
    if (!line) return null;
    if (quantity > line.merchandise.quantityAvailable || quantity > MAX_LINE_QUANTITY) {
        throw inventoryError();
    }
    return updateShopifyCartLine(cartId, lineId, quantity);
}

export async function removeItemFromCart(lineId: string) {
    if (typeof lineId !== 'string' || lineId.length === 0 || lineId.length > 500) {
        throw new Error('Invalid cart line.');
    }
    const cartId = await getCartId();
    return cartId ? removeFromCart(cartId, lineId) : null;
}