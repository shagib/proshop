import Link from 'next/link';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { getBlogArticle } from '@/lib/shopify/blogs';

type ArticlePageProps = {
  params: Promise<{ blogHandle: string; articleHandle: string }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { blogHandle, articleHandle } = await params;
  const article = await getBlogArticle(blogHandle, articleHandle);

  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-8 py-16 max-[1024px]:px-4">
      <Link href={`/blogs/${blogHandle}`} className="text-sm underline underline-offset-4 hover:text-primary-800">
        Back to {blogHandle}
      </Link>
      <article className="mt-8">
        {article.image && (
          <img
            src={article.image.url}
            alt={article.image.altText || article.title}
            className="mb-8 aspect-[16/8] w-full object-cover"
          />
        )}
        <time dateTime={article.publishedAt} className="text-sm text-neutral-700">
          {new Date(article.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <h1 className="mt-3 text-5xl font-semibold max-[640px]:text-3xl">{article.title}</h1>
        <div
          className="prose mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.contentHtml) }}
        />
      </article>
    </main>
  );
}