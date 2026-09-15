import { shopifyFetch } from './client';

export type StorefrontPage = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
};

type StorefrontPageResponse = {
  page: StorefrontPage | null;
};

const pageQuery = `
  query getPage($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      body
      bodySummary
    }
  }
`;

export async function getPageByHandle(handle: string): Promise<StorefrontPage | null> {
  const data = await shopifyFetch<StorefrontPageResponse>({
    query: pageQuery,
    variables: { handle },
  });

  return data.page;
}