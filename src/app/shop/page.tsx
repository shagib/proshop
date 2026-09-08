import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';

type ShopPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

function resolveSortOption(sort?: string): {
  sortKey: 'TITLE' | 'PRICE' | 'CREATED_AT' | 'BEST_SELLING' | 'RELEVANCE';
  reverse: boolean;
} {
  switch (sort) {
    case 'price-asc':
      return { sortKey: 'PRICE', reverse: false };
    case 'price-desc':
      return { sortKey: 'PRICE', reverse: true };
    case 'newest':
      return { sortKey: 'CREATED_AT', reverse: true };
    case 'best-selling':
      return { sortKey: 'BEST_SELLING', reverse: false };
    default:
      return { sortKey: 'RELEVANCE', reverse: false };
  }
}

const sortOptions = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { sort } = await searchParams;
  const { sortKey, reverse } = resolveSortOption(sort);

  const products = await getProducts({ first: 24, sortKey, reverse });

  return (
    <main className="px-8 py-16 max-w-[1856px] mx-auto max-[1024px]:px-4">
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <h1 className="text-4xl font-semibold">Shop</h1>

        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={option.value ? `/shop?sort=${option.value}` : '/shop'}
              className={`px-4 py-2 text-sm rounded border ${
                (sort ?? '') === option.value
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p>Product not found.</p>
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