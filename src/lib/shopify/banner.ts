import { shopifyFetch } from './client';

export type HeroBannerItem = {
  id: string;
  brand_tag?: string;
  banner_title?: string;
  subtitle?: string;
  discount_text?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  banner_image?: string;
  bg_img?: string;
  banner_position?: string;
};

type MetaobjectNode = {
  id: string;
  fields: {
    key: string;
    value: string;
    reference?: {
      image?: {
        url: string;
        altText: string | null;
      };
    };
  }[];
};

type HeroBannerResponse = {
  metaobjects: {
    nodes: MetaobjectNode[];
  };
};

const getHeroBannersQuery = `
  query getHeroBanners {
    metaobjects(type: "hero_main_banner", first: 3) {
      nodes {
        id
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
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

function parseBannerFields(node: MetaobjectNode): HeroBannerItem {
  const parsedData: Record<string, string | null> = { id: node.id };

  node.fields.forEach((field) => {
    if (field.key === 'banner_image' || field.key === 'bg_img') {
      parsedData[field.key] = field.reference?.image?.url || null;
    } else {
      parsedData[field.key] = field.value;
    }
  });

  return parsedData as HeroBannerItem;
}

export async function getHeroBanners(): Promise<HeroBannerItem[]> {
  const data = await shopifyFetch<HeroBannerResponse>({
    query: getHeroBannersQuery,
  });

  if (!data?.metaobjects?.nodes) {
    return [];
  }

  return data.metaobjects.nodes.map(parseBannerFields);
}
