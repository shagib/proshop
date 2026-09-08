export type Product = {
    id: string;
    title: string;
    handle: string;
    description: string;
    createdAt: string;
    vendor: string;
    productType: string;

    featuredImage: {
        url: string;
        altText: string | null;
    } | null;

    images: {
        edges: {
            node: {
                url: string;
                altText: string | null;
            };
        }[];
    };

    options: {
        name: string;
        values: string[];
    }[];

    priceRange: {
        minVariantPrice: {
            amount: string;
            currencyCode: string;
        };
    };

    compareAtPriceRange: {
        minVariantPrice: {
            amount: string;
            currencyCode: string;
        };
    };
};

export type ProductsResponse = {
    products: {
        edges: {
            node: Product;
        }[];
    };
};

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = '2024-10';
const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

async function shopifyFetch<T>({ query, variables }: { query: string; variables?: Record<string, any> }): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-shopify-storefront-access-token': token as string,
        },
        body: JSON.stringify({ query, variables })
    });

    const json = await response.json();
    if (json.errors) {
        console.error('Shopify GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    }
    return json.data;
}

const getProductsQuery = `
  query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
            id
            title
            handle
            description
            createdAt
            vendor
            productType
            featuredImage {
                url
                altText
            }
            images(first: 4) {
                edges {
                    node {
                        url
                        altText
                    }
                }
            }
            options {
                name
                values
            }
            priceRange {
                minVariantPrice {
                    amount
                    currencyCode
                }
            }
            compareAtPriceRange {
                minVariantPrice {
                    amount
                    currencyCode
                }
            }
        }
      }
    }
  }
`;

export async function getProducts(options?: {
  first?: number;
  sortKey?: 'TITLE' | 'PRICE' | 'CREATED_AT' | 'BEST_SELLING' | 'RELEVANCE';
  reverse?: boolean;
}): Promise<Product[]> {
  const data = await shopifyFetch<ProductsResponse>({
    query: getProductsQuery,
    variables: {
      first: options?.first ?? 10,
      sortKey: options?.sortKey ?? 'RELEVANCE',
      reverse: options?.reverse ?? false,
    },
  });
  return data.products.edges.map((edge) => edge.node);
}

//For single product page
export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: {
    amount: string;
    currencyCode: string;
  };
};

export type SingleProduct = Product & {
  images: {
    edges: {
      node: {
        url: string;
        altText: string | null;
      };
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
  collections: {
    edges: {
      node: {
        title: string;
        handle: string;
      };
    }[];
  };
  tags: string[];
  metafield: {              
    value: string;
  } | null;
};

type SingleProductResponse = {
  product: SingleProduct | null;
};

const getProductByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
        id
        title
        handle
        description
        createdAt
        featuredImage {
            url
            altText
        }
        priceRange {
            minVariantPrice {
                amount
                currencyCode
            }
        }
        compareAtPriceRange {
            minVariantPrice {
                amount
                currencyCode
            }
        }
        images(first: 10) {
            edges {
                node {
                    url
                    altText
                }
            }
        }
        options {
            name
            values
        }
        variants(first: 25) {
            edges {
                node {
                    id
                    title
                    availableForSale
                    selectedOptions {
                        name
                        value
                    }
                    price {
                        amount
                        currencyCode
                    }
                }
            }
        }
        collections(first: 1) {
            edges {
                node {
                    title
                    handle
                }
            }
        }
        tags
        metafield(namespace: "custom", key: "additional_information") {
            value
        }
    }
  }
`;

export async function getProduct(handle: string): Promise<SingleProduct | null> {
  const data = await shopifyFetch<SingleProductResponse>({
    query: getProductByHandleQuery,
    variables: { handle },
  });
  return data.product;
}

// ===== Shop Policy (Return Policy) =====
type ShopPolicyResponse = {
  shop: {
    refundPolicy: {
      title: string;
      body: string;
    } | null;
  };
};
 
const getShopPolicyQuery = `
  query getShopPolicy {
    shop {
      refundPolicy {
        title
        body
      }
    }
  }
`;
 
export async function getReturnPolicy() {
  const data = await shopifyFetch<ShopPolicyResponse>({ query: getShopPolicyQuery });
  return data.shop.refundPolicy;
}

// ===== Cart Types =====
export type Cart = {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    lines: {
        edges: {
            node: {
                id: string;
                quantity: number;
                merchandise: {
                    id: string;
                    title: string;
                    product: {
                        title: string;
                        handle: string;
                    };
                };
            };
        }[];
    };
};

const cartFragment = `
    id
    checkoutUrl
    totalQuantity
    lines(first: 50) {
        edges {
            node {
                id 
                quantity
                merchandise {
                    ... on ProductVariant {
                        id
                        title
                        product {
                            title
                            handle
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

// Products Collections
type CollectionWithProductsResponse = {
  collection: {
    id: string;
    title: string;
    handle: string;
    description: string;
    image: {
      url: string;
      altText: string | null;
    } | null;
    products: {
      edges: {
        node: Product;
      }[];
    };
  } | null;
};

const getCollectionByHandleQuery = `
  query getCollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      products(first: 24) {
        edges {
          node {
            id
            title
            handle
            description
            createdAt
            vendor
            productType
            featuredImage {
              url
              altText
            }
            images(first: 4) {
                edges {
                    node {
                        url
                        altText
                    }
                }
            }
            options {
                name
                values
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export async function getCollection(handle: string) {
  const data = await shopifyFetch<CollectionWithProductsResponse>({
    query: getCollectionByHandleQuery,
    variables: { handle },
  });
  return data.collection;
}

// import { ProductsResponse } from '@/types/shopify';

// interface ShopifyFetchOptions {
//     query: string;
//     variables?: Record<string, any>;
// }

// export async function shopifyFetch<T = any> ({ query, variables = {}} : ShopifyFetchOptions): Promise<T> {
//     const response  = await fetch(
//         `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql.json`,
//         {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
//             },
//             body: JSON.stringify({ query, variables }),
//         }
//     );

//     if(!response.ok) {
//         throw new Error(`Shopify API error: ${response.statusText}`);
//     }

//     const json = await response.json();
//     if(json.errors) {
//         throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
//     }

//     return json.data as T;
// }

// export async function getProducts(first: number = 12): Promise<ProductsResponse> {
//     const query = `
//         query GetProducts($first: Int!) { 
//            products(first: $first) {
//                 nodes {
//                     id
//                     title
//                     handle
//                     description
//                     priceRange {
//                         minVariantPrice {
//                             amount
//                             currencyCode
//                         }
//                     }
//                     images(first: 1) {
//                         nodes {
//                             url
//                             altText
//                         }
//                     }
//                     variants(first: 1) {
//                         nodes {
//                             id
//                             price {
//                                 amount
//                                 currencyCode
//                             }
//                         }
//                     }
//                 }
//            }
//         }
//     `;
//     return shopifyFetch<ProductsResponse>({
//         query,
//         variables: { first },
//     });
// } 