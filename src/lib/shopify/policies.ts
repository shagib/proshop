import { shopifyFetch } from './client';

// Shop Policy (Return Policy)
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