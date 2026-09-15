import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { getPageByHandle } from '@/lib/shopify/pages';
import ContactForm from '@/components/ContactForm';

type PageProps = {
  params: Promise<{ handle: string }>;
};

export default async function StorefrontPage({ params }: PageProps) {
  const { handle } = await params;
  const page = await getPageByHandle(handle);

  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-8 py-16 max-[1024px]:px-4">
      <h1 className="mb-8 text-4xl font-semibold">{page.title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body) }}
      />
      {page.handle === 'contact' && <ContactForm />}
    </main>
  );
}