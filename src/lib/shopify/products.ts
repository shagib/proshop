import { shopifyFetch } from './client';

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

    variants: {
      edges: {
        node: ProductVariant;
      }[];
    };

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
            variants(first: 50) {
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
                    compareAtPrice {
                        amount
                        currencyCode
                    }
                    image {
                        url
                        altText
                    }
                }
              }
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
    compareAtPrice: {
        amount: string;
        currencyCode: string;
    } | null;
    image: {
        url: string;
        altText: string | null;
    } | null;
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
                    compareAtPrice {
                        amount
                        currencyCode
                    }
                    image {
                        url
                        altText
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