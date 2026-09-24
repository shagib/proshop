const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-10';
const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

export async function shopifyFetch<T>({ 
    query, 
    variables 
}: { 
    query: string; 
    variables?: Record<string, unknown> 
}): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-shopify-storefront-access-token': token as string,
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
    }

    const json: { data?: T; errors?: unknown } = await response.json();
    if (json.errors) {
        throw new Error(`Shopify GraphQL request failed: ${JSON.stringify(json.errors)}`);
    }
    if (json.data === undefined) {
        throw new Error('Shopify returned an empty response.');
    }
    return json.data;
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