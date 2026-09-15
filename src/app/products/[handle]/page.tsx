import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/shopify/products';
import { getReturnPolicy } from '@/lib/shopify/policies';
import ProductGallery from '@/components/ProductGallery';
import AddToCartForm from '@/components/AddToCartForm';
import ProductOptions from '@/components/ProductOptions';
import ProductPrice from '@/components/ProductPrice';
import { ProductVariantProvider } from '@/components/ProductVariantcontext';
import Accordion from '@/components/Accordion';
import ReviewForm from '@/components/ReviewForm';
import { getReviews } from '@/actions/reviews';
import StarRating from '@/components/StarRating';
import type { SelectedOptions } from '@/lib/product-helpers';
import sanitizeHtml from 'sanitize-html';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
    searchParams: Promise<{ color?: string }>;
};

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
    const { handle } = await params;
    const { color } = await searchParams;
    const [product, returnPolicy, reviews] = await Promise.all([
        getProduct(handle),
        getReturnPolicy(),
        getReviews(handle),
    ]);

    if (!product) {
        notFound();
    }
  
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    const images = product.images.edges.map((edge) => edge.node);
    const collection = product.collections.edges[0]?.node;

    const colorOptionName = product.options.find(
        (option) => option.name.toLowerCase() === 'color',
    )?.name;

    const initialOptions: SelectedOptions | undefined =
        color && colorOptionName ? { [colorOptionName]: color } : undefined;


    // const isAvailable = product.variants.edges.some((edge) => edge.node.availableForSale);

    // const selectedVariant = color
    //     ? product.variants.edges.find((edge) =>
    //             edge.node.availableForSale && edge.node.selectedOptions.some(
    //                 (option) => option.name.toLowerCase() === 'color' && option.value === color,
    //             ),
    //         )?.node
    //     : undefined;
    // const defaultVariant = selectedVariant
    //     ?? product.variants.edges.find((edge) => edge.node.availableForSale)?.node
    //     ?? product.variants.edges[0]?.node;

  //additional info
    let additionalInfoRaw: unknown = [];
    if (product.metafield) {
        try {
            additionalInfoRaw = JSON.parse(product.metafield.value);
        } catch {
            additionalInfoRaw = [];
        }
    }
//   console.log(additionalInfoRaw);

    const additionalInfo = (Array.isArray(additionalInfoRaw) ? additionalInfoRaw : [])
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => {
    const parts = entry.split(':');
    if(parts.length === 2) {
        return {
            key: parts[0].trim(),
            value: parts[1].trim()
        };
    }
    return null;
  }).filter((item): item is { key: string; value: string; } => item !== null);
//   console.log(additionalInfo);

  return (
    <main className="product-single-page px-8 py-16 max-w-[1856px] w-full mx-auto max-[1024px]:px-4">
        <section className="product-single py-25 max-w-[1856px] mx-auto max-[768px]:py-15" aria-label="Product Detail">
            
            <div className="product-container flex gap-16 items-start">
                <ProductVariantProvider product={product} initialOptions={initialOptions}>  
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
                                                <path d="M7.5 15C7.5 15 12.5 11.3167 12.5 10C12.5 8.68333 7.5 5 7.5 5" stroke="#575757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </li>
                                    <li className="breadcrumb-item flex gap-2">
                                        <Link href="/shop" className="product-breadcrumb-link hover:text-neutral-950">SHOP</Link>
                                        <span>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.5 15C7.5 15 12.5 11.3167 12.5 10C12.5 8.68333 7.5 5 7.5 5" stroke="#575757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                                                    <path d="M7.5 15C7.5 15 12.5 11.3167 12.5 10C12.5 8.68333 7.5 5 7.5 5" stroke="#575757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                            
                            <ProductPrice />

                            {reviews.length > 0 && (
                                <div className="product-rating flex items-center gap-2">
                                    <StarRating rating={Math.round(averageRating)} />
                                    <span className="product-rating-count text-base leading-[22.4px] font-normal text-neutral-950">
                                        ({reviews.length} Customer Review{reviews.length !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            )}

                        </div>

                        <ProductOptions />
                        <AddToCartForm />

                        <Accordion
                            items={[
                                ...(product.description?.trim()
                                    ? [{
                                        id: 'description',
                                        title: 'DESCRIPTION',
                                        content: <div className="whitespace-pre-line text-base leading-[22.4px] font-normal text-neutral-950">{product.description}</div>,
                                        defaultOpen: true,
                                    }]
                                    : []),
                                ...(additionalInfo.length > 0
                                ?   [
                                        {
                                            id: 'additional-information',
                                            title: 'ADDITIONAL INFORMATION',
                                            content: (
                                                <table className="w-full text-left">
                                                    <tbody>
                                                        {additionalInfo.map((item) => (
                                                            <tr key={item.key} className="border-b border-neutral-100">
                                                                <th className="py-2 pr-4 font-medium text-neutral-900">{item.key}</th>
                                                                <td className="py-2 text-neutral-700">{item.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ),
                                        },
                                    ]
                                : []),

                                {
                                    id: 'return-policy',
                                    title: 'RETURN POLICY',
                                    content: returnPolicy?.body ? (
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtml(returnPolicy.body, {
                                                    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'span'],
                                                    allowedAttributes: { span: ['class'] },
                                                }),
                                            }}
                                        />
                                    ) : (
                                        <p>Please contact us for return policy details.</p>
                                    ),
                                },

                                {
                                    id: 'reviews',
                                    title: `REVIEWS${reviews.length > 0 ? ` (${reviews.length})` : ''}`,
                                    defaultOpen: true,
                                    content: (
                                        <>

                                            {reviews.length > 0 && (

                                                <div className="flex flex-col gap-6 mb-6">

                                                    {reviews.map((review) => (

                                                        <div key={review.id} className="border-b border-neutral-100 pb-5">

                                                            <StarRating rating={review.rating} size={16} />

                                                            {review.title && <h4 className="font-semibold mt-3">{review.title}</h4>}

                                                            <p className="text-neutral-700 mt-2 mb-3">&quot;{review.body}&quot;</p>

                                                            <span className="text-sm text-neutral-500">— {review.author_name}</span>

                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <ReviewForm productHandle={handle} productTitle={product.title} />
                                        </>
                                    ),
                                },

                            ]}
                        />
    
                    </div>
                </ProductVariantProvider>
            </div> 
        </section>
    </main>
    
  );
}