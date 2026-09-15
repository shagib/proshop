import Link from 'next/link';
import { getBlogArticles } from '@/lib/shopify/blogs';

type BlogPageProps = {
  params: Promise<{ blogHandle: string }>;
};

export default async function BlogPage({ params }: BlogPageProps) {
  const { blogHandle } = await params;
  const blog = await getBlogArticles(blogHandle);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-8 py-16 max-[1024px]:px-4">
      <h1 className="mb-10 text-4xl font-semibold">{blog?.title || 'News'}</h1>

      {!blog || blog.articles.edges.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-8 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
          {blog.articles.edges.map(({ node: article }) => (
            <article key={article.id} className="overflow-hidden border border-neutral-200 bg-white">
              {article.image && (
                <img
                  src={article.image.url}
                  alt={article.image.altText || article.title}
                  className="aspect-[16/10] w-full object-cover"
                />
              )}
              <div className="p-6">
                <time dateTime={article.publishedAt} className="text-sm text-neutral-700">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <Link
                  href={`/blogs/${blogHandle}/${article.handle}`}>  
                    <h2 className="mt-2 text-2xl font-semibold hover:text-primary-800">{article.title}</h2>
                </Link>

                <p className="mt-3 line-clamp-3 text-neutral-700">
                  {article.excerpt || article.excerptHtml.replace(/<[^>]+>/g, '')}
                </p>

                <Link
                  href={`/blogs/${blogHandle}/${article.handle}`}
                  className="mt-5 inline-block font-medium underline underline-offset-4 hover:text-primary-800"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}