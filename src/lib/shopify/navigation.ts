import { shopifyFetch } from './client';

export type ShopifyMenuItem = {
  id: string;
  title: string;
  url: string;
  items: ShopifyMenuItem[];
};

export type StorefrontNavigation = {
  shop: {
    name: string;
    brand: {
      logo: {
        image: {
          url: string;
          altText: string | null;
        } | null;
      } | null;
    } | null;
  };
  menu: {
    items: ShopifyMenuItem[];
  } | null;
};

const navigationQuery = `
  query getStorefrontNavigation($handle: String!) {
    shop {
      name
      brand {
        logo {
          image {
            url
            altText
          }
        }
      }
    }
    menu(handle: $handle) {
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;

export async function getStorefrontNavigation(
  handle = 'main-menu',
): Promise<StorefrontNavigation> {
  return shopifyFetch<StorefrontNavigation>({
    query: navigationQuery,
    variables: { handle },
  });
}

export function getStorefrontPath(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

    if (!storeDomain || parsedUrl.hostname !== storeDomain) {
      return url;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return url || '/';
  }
}