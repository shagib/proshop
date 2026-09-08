import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';

type CollectionPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const collection = await getCollection(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);

  return (
    <main className="px-8 py-16 max-w-[1856px] mx-auto max-[1024px]:px-4">
      {/* ===== Collection Header ===== */}
      <div className="mb-12">
        {collection.image && (
          <div className="relative w-full h-[240px] rounded-lg overflow-hidden mb-6">
            <img
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-4xl font-semibold mb-2">{collection.title}</h1>
        {collection.description && (
          <p className="text-neutral-600 max-w-[700px]">{collection.description}</p>
        )}
      </div>

      {/* ===== Products Grid ===== */}
      {products.length === 0 ? (
        <p>Product Not Found</p>
      ) : (
        <div className="grid grid-cols-5 gap-6 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      )}
    </main>
  );
}