import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/shopify';
import ProductGallery from '@/components/ProductGallery';
import AddToCartForm from '@/components/AddToCartForm';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const images = product.images.edges.map((edge) => edge.node);
  const collection = product.collections.edges[0]?.node;

  const isAvailable = product.variants.edges.some((edge) => edge.node.availableForSale);

  return (
    <main className="product-single-page px-8 max-[1024px]:px-4">
        <section className="product-single py-25 max-w-[1856px] mx-auto max-[768px]:py-15" aria-label="Product Detail">
            <div className="product-container flex gap-16">

                <ProductGallery 
                    images={images} 
                    productTitle={product.title}
                />

                <div className="product-info w-1/2">
                    <div className="product-header flex flex-col gap-10">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <ol className="breadcrumb-list flex gap-2 text-base font-semibold text-neutral-700 leading-[23.4px]">
                                <li className="breadcrumb-item flex gap-2">
                                    <Link href="/" className="product-breadcrumb-link hover:text-neutral-950">HOME</Link>
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.5 15C7.5 15 12.5 11.3167 12.5 10C12.5 8.68333 7.5 5 7.5 5" stroke="#575757" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                </li>
                                <li className="breadcrumb-item flex gap-2">
                                    <Link href="/shop" className="product-breadcrumb-link hover:text-neutral-950">SHOP</Link>
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.5 15C7.5 15 12.5 11.3167 12.5 10C12.5 8.68333 7.5 5 7.5 5" stroke="#575757" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                </li>
                                {collection && (
                                    <li className="breadcrumb-item flex gap-2">
                                        <Link href={`/collections/${collection.handle}`} className="breadcrumb-link hover:text-neutral-950">
                                            {collection.title.toUpperCase()}
                                        </Link>
                                        <span>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.5 15C7.5 15 12.5 11.3167 12.5 10C12.5 8.68333 7.5 5 7.5 5" stroke="#575757" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </span>
                                    </li>
                                )}
                                <li className="breadcrumb-item breadcrumb-item-current" aria-current="page">
                                    <span className="breadcrumb-text">
                                        {product.title}
                                    </span>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="product-title text-5xl font-semibold text-neutral-900 leading-[57.6px] max-[768px]:text-3xl max-[768px]:leading-[38.6px]">
                            {product.title}
                        </h1>
                        <p className="product-price text-3xl font-semibold text-neutral-900 leading-[36px] max-[768px]:text-2xl max-[768px]:leading-[31.2px]">
                            <span className="product-price-value">
                                {product.priceRange.minVariantPrice.amount}{' '}
                                {product.priceRange.minVariantPrice.currencyCode}
                            </span>
                        </p>

                        <div className="product-rating">
                            <span className="product-rating-count text-base leading-[22.4px] font-normal text-neutral-950">(0 Customer Reviews)</span>
                        </div>

                        <div className="product-short-description">
                            <p className='text-base leading-[22.4px] font-normal text-neutral-950'>
                                {product.description.slice(0, 200)}
                            </p>
                        </div>
                    </div>

                    <AddToCartForm available={isAvailable} />

                    <div className="product-accordion">
                        <details className="product-accordion-item" open>
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">DESCRIPTION</span>
                            </summary>
                            <div className="product-accordion-content">
                                {product.description}
                            </div> 
                        </details>

                        <details className="product-accordion-item">
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">SIZE CHART</span>
                            </summary>
                            <div className="product-accordion-content">
                                <p>Size chart information coming soon.</p>
                            </div>
                        </details>

                        <details className="product-accordion-item">
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">RETURN POLICY</span>
                            </summary>
                            <div className="product-accordion-content">
                                <p>Please contact us for return policy details.</p>
                            </div>
                        </details>

                        <details className="product-accordion-item product-accordion-item--reviews" open>
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">REVIEWS (0)</span>
                            </summary>
                            <div className="product-accordion-content">
                                <p>No reviews yet. Be the first to review this product.</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div> 
        </section>
    </main>
    
  );
}