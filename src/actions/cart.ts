'use server';

import { cookies  } from "next/headers";
import { createCart, addToCart } from "@/lib/shopify";

export async function addItemToCart(variantId: string, quantity: number) {
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get('cartID')?.value;

    let cart;

    if(existingCartId) {
        cart = await addToCart(existingCartId, variantId, quantity);
    }else {
        cart = await createCart(variantId, quantity);

        cookieStore.set('cartId', cart.id, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
        });
    }
    return cart;
}