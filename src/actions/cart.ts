'use server';

import { cookies  } from "next/headers";
import { createCart, addToCart, getCart, updateCartLine as updateShopifyCartLine, removeFromCart } from "@/lib/shopify/cart";

async function getCartId() {
    const cookieStore = await cookies();
    return cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;
}

function validateVariantId(variantId: string) {
    if (typeof variantId !== 'string' || variantId.length === 0 || variantId.length > 500) {
        throw new Error('Invalid product variant.');
    }
}

function validateQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new Error('Quantity must be an integer between 1 and 100.');
    }
}

export async function addItemToCart(variantId: string, quantity: number) {
    validateVariantId(variantId);
    validateQuantity(quantity);
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get('cartId')?.value ?? cookieStore.get('cartID')?.value;

    let cart;

    if(existingCartId) {
        cart = await addToCart(existingCartId, variantId, quantity);
    }else {
        cart = await createCart(variantId, quantity);

        cookieStore.set('cartId', cart.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    }
    return cart;
}

export async function getCurrentCart() {
    const cartId = await getCartId();
    return cartId ? getCart(cartId) : null;
}

export async function updateCartLine(lineId: string, quantity: number) {
    if (typeof lineId !== 'string' || lineId.length === 0 || lineId.length > 500) {
        throw new Error('Invalid cart line.');
    }
    const cartId = await getCartId();
    if (!cartId) return null;
    if (quantity <= 0) return removeItemFromCart(lineId);
    validateQuantity(quantity);
    return updateShopifyCartLine(cartId, lineId, quantity);
}

export async function removeItemFromCart(lineId: string) {
    if (typeof lineId !== 'string' || lineId.length === 0 || lineId.length > 500) {
        throw new Error('Invalid cart line.');
    }
    const cartId = await getCartId();
    return cartId ? removeFromCart(cartId, lineId) : null;
}