import { shopifyFetch } from './client';

export type BlogArticle = {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  excerptHtml: string;
  contentHtml: string;
  publishedAt: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
};

type BlogArticlesResponse = {
  blog: {
    title: string;
    handle: string;
    articles: {
      edges: { node: BlogArticle }[];
    };
  } | null;
};

type BlogArticleResponse = {
  blog: {
    articleByHandle: BlogArticle | null;
  } | null;
};

const articleFields = `
  id
  title
  handle
  excerpt
  excerptHtml
  contentHtml
  publishedAt
  image {
    url
    altText
  }
`;

const blogArticlesQuery = `
  query getBlogArticles($blogHandle: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      title
      handle
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            ${articleFields}
          }
        }
      }
    }
  }
`;

const blogArticleQuery = `
  query getBlogArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        ${articleFields}
      }
    }
  }
`;

export async function getBlogArticles(blogHandle = 'news', first = 24) {
  const data = await shopifyFetch<BlogArticlesResponse>({
    query: blogArticlesQuery,
    variables: { blogHandle, first },
  });

  return data.blog;
}

export async function getBlogArticle(
  blogHandle: string,
  articleHandle: string,
): Promise<BlogArticle | null> {
  const data = await shopifyFetch<BlogArticleResponse>({
    query: blogArticleQuery,
    variables: { blogHandle, articleHandle },
  });

  return data.blog?.articleByHandle ?? null;
}