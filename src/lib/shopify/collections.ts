import { shopifyFetch } from './client';
import { Product } from './products';

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
  }
`;

export async function getCollection(handle: string) {
  const data = await shopifyFetch<CollectionWithProductsResponse>({
    query: getCollectionByHandleQuery,
    variables: { handle },
  });
  return data.collection;
}