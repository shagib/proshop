import { shopifyFetch } from './client';

// ===== Cart Types =====
export type Cart = {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    cost: {
        subtotalAmount: Money;
    };
    lines: {
        edges: {
            node: {
                id: string;
                quantity: number;
                cost: {
                    totalAmount: Money;
                };
                merchandise: {
                    id: string;
                    title: string;
                    image: Image | null;
                    product: {
                        title: string;
                        handle: string;
                        featuredImage: Image | null;
                    };
                };
            };
        }[];
    };
};

type Money = {
    amount: string;
    currencyCode: string;
};

type Image = {
    url: string;
    altText: string | null;
};

const cartFragment = `
    id
    checkoutUrl
    totalQuantity
    cost {
        subtotalAmount {
            amount
            currencyCode
        }
    }
    lines(first: 50) {
        edges {
            node {
                id 
                quantity
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                }
                merchandise {
                    ... on ProductVariant {
                        id
                        title
                        image {
                            url
                            altText
                        }
                        product {
                            title
                            handle
                            featuredImage {
                                url
                                altText
                            }
                        }
                    }
                }
            }
        }
    }
`;

type CartCreateResponse = {
    cartCreate: {
        cart: Cart;
    };
};

const cartCreateMutation = `
    mutation cartCreate($lines: [CartLineInput!]) {
        cartCreate(input: {lines: $lines}) {
            cart {
                ${cartFragment}
            }
        }
    }
`;

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
    const data = await shopifyFetch<CartCreateResponse>({
        query: cartCreateMutation,
        variables: { lines: [{ merchandiseId: variantId, quantity}] },
    });
    return data.cartCreate.cart;
};

type CartLinesAddResponse = {
    cartLinesAdd: {
        cart: Cart;
    };
};

const cartLinesAddMutation = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${cartFragment}
      }
    }
  }
`;

export async function addToCart(
    cartId: string,
    variantId: string,
    quantity: number
): Promise<Cart> {
    const data = await shopifyFetch<CartLinesAddResponse>({
        query: cartLinesAddMutation,
        variables: {
            cartId, 
            lines: [{ merchandiseId: variantId, quantity}]
        }
    });
    return data.cartLinesAdd.cart;
}

type CartQueryResponse = {
        cart: Cart | null;
};

const cartQuery = `
    query getCart($cartId: ID!) {
        cart(id: $cartId) {
            ${cartFragment}
        }
    }
`;

export async function getCart(cartId: string): Promise<Cart | null> {
        const data = await shopifyFetch<CartQueryResponse>({
                query: cartQuery,
                variables: { cartId },
        });
        return data.cart;
}

type CartLinesUpdateResponse = {
        cartLinesUpdate: {
                cart: Cart;
        };
};

const cartLinesUpdateMutation = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
                ${cartFragment}
            }
        }
    }
`;

export async function updateCartLine(
        cartId: string,
        lineId: string,
        quantity: number
): Promise<Cart> {
        const data = await shopifyFetch<CartLinesUpdateResponse>({
                query: cartLinesUpdateMutation,
                variables: { cartId, lines: [{ id: lineId, quantity }] },
        });
        return data.cartLinesUpdate.cart;
}

type CartLinesRemoveResponse = {
        cartLinesRemove: {
                cart: Cart;
        };
};

const cartLinesRemoveMutation = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
                ${cartFragment}
            }
        }
    }
`;

export async function removeFromCart(
        cartId: string,
        lineId: string
): Promise<Cart> {
        const data = await shopifyFetch<CartLinesRemoveResponse>({
                query: cartLinesRemoveMutation,
                variables: { cartId, lineIds: [lineId] },
        });
        return data.cartLinesRemove.cart;
}