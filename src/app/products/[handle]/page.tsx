import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getReturnPolicy } from '@/lib/shopify';
import ProductGallery from '@/components/ProductGallery';
import AddToCartForm from '@/components/AddToCartForm';
import Accordion from '@/components/Accordion';
// import ReviewForm from '@/components/ReviewForm';

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const [product, returnPolicy] = await Promise.all([
    getProduct(handle),
    getReturnPolicy(),
  ]);

  if (!product) {
    notFound();
  }

  const images = product.images.edges.map((edge) => edge.node);
  const collection = product.collections.edges[0]?.node;

  const isAvailable = product.variants.edges.some((edge) => edge.node.availableForSale);

  const defaultVariant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node ?? product.variants.edges[0]?.node;
  //additional info
  const additionalInfoRaw: string[] = product.metafield ? JSON.parse(product.metafield.value) : [];
//   console.log(additionalInfoRaw);

  const additionalInfo = additionalInfoRaw.map((entry) => {
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
                        <p className="product-price text-3xl font-semibold text-neutral-900 leading-[36px] max-[768px]:text-2xl max-[768px]:leading-[31.2px]">
                            <span className="product-price-value">
                                {product.priceRange.minVariantPrice.amount}{' '}
                                {product.priceRange.minVariantPrice.currencyCode}
                            </span>
                        </p>

                        {/* <div className="product-rating">
                            <span className="product-rating-count text-base leading-[22.4px] font-normal text-neutral-950">(0 Customer Reviews)</span>
                        </div> */}

                    </div>

                    <AddToCartForm available={isAvailable} variantId={defaultVariant.id} />

                    <Accordion
                        items={[
                            {
                                id: 'description',
                                title: 'DESCRIPTION',
                                content: <div className="whitespace-pre-line text-base leading-[22.4px] font-normal text-neutral-950">{product.description}</div>,
                                defaultOpen: true,
                            },
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
                                    <div dangerouslySetInnerHTML={{ __html: returnPolicy.body }} />
                                ) : (
                                    <p>Please contact us for return policy details.</p>
                                ),
                            },

                            // {
                            //     id: 'reviews',
                            //     title: 'REVIEWS (0)',
                            //     defaultOpen: true,
                            //     content: (
                            //         <>
                            //             <p className="mb-6">No reviews yet. Be the first to review this product.</p>
                            //             <ReviewForm productTitle={product.title} />
                            //         </>
                            //     ),
                            // },
                        ]}
                    />
 
                    {/* <div className="product-accordion mt-16">
                        <details className="product-accordion-item" open>
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">DESCRIPTION</span>
                            </summary>
                            <div className="product-accordion-content">
                                <p className='text-base leading-[22.4px] font-normal text-neutral-950'>
                                    {product.description.slice(0, 200)}
                                </p>
                                <a href='#'>Read more</a>
                            </div> 
                        </details>

                        {additionalInfo.length > 0 && (
                            <details className="product-accordion-item">
                                <summary className="product-accordion-header">
                                    <span className="product-accordion-title">Additional information</span>
                                </summary>
                                <div className="product-accordion-content">
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
                                </div>
                            </details>
                        )}
                        

                        <details className="product-accordion-item">
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">RETURN POLICY</span>
                            </summary>
                            <div className="product-accordion-content">
                                 {returnPolicy?.body ? (
                                    <div className='text-base leading-[22.4px] font-normal text-neutral-950' dangerouslySetInnerHTML={{ __html: returnPolicy.body }} />
                                ) : (
                                    <p>Please contact us for return policy details.</p>
                                )}
                                <p className='text-base leading-[22.4px] font-normal text-neutral-950'>
                                   
                                </p>
                            </div>
                        </details>

                        <details className="product-accordion-item product-accordion-item--reviews" open>
                            <summary className="product-accordion-header">
                                <span className="product-accordion-title">
                                    REVIEWS(1)
                                </span>
                                <svg className="product-accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M6 9L12 15L18 9" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </summary>
                            <div className="product-accordion-content">

                                <div className="product-reviews-list">
                                
                                    <div className="product-review">
                                        <div className="product-review-stars" aria-label="Rated {{ review.rating }} out of 5">
                                           
                                            <svg className="product-review-star {% if i <= review.rating %}product-review-star--filled{% endif %}" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                                <path 
                                                    d="M10 1.5L12.5 7L18.5 7.5L14 11.5L15.5 17.5L10 14L4.5 17.5L6 11.5L1.5 7.5L7.5 7L10 1.5Z"
                                                    fill="#f9af58" stroke="#f9af58"
                                                    strokeWidth="1"
                                                />
                                            </svg>
                                          
                                        </div>
                                        <div className="product-review-content">
                                            <h4 className="product-review-title">
                                                Great Quality & Stylish Design
                                            </h4>
                                            <p className="product-review-body">
                                                “The bag feels premium and well-made. The material is durable, the zipper is smooth, and the size is perfect for daily use. Totally worth the price. Highly recommended!”
                                            </p>
                                        </div>
                                        <span className="product-review-author">
                                            — Arif H.
                                        </span>
                                    </div>
                            
                                    <div className="product-review">
                                        <div className="product-review-stars" aria-label="Rated 5 out of 5">
                                            <svg className="product-review-star product-review-star--filled" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                                <path d="M10 1.5L12.5 7L18.5 7.5L14 11.5L15.5 17.5L10 14L4.5 17.5L6 11.5L1.5 7.5L7.5 7L10 1.5Z" fill="#f9af58" stroke="#f9af58" stroke-width="1"/>
                                            </svg>
                                        </div>
                                        <div className="product-review-content">
                                            <h4 className="product-review-title">Great Quality & Stylish Design</h4>
                                            <p className="product-review-body">"The bag feels premium and well-made. The material is durable, the zipper is smooth, and the size is perfect for daily use. Totally worth the price. Highly recommended!"</p>
                                        </div>
                                        <span className="product-review-author">— Arif H.</span>
                                    </div>
                                </div>

                                <div className="product-review-form-wrapper">
                                    <h3 className="product-review-form-heading">BE THE FIRST TO REVIEW { product.title }</h3>

                                    <form className="product-review-form" action="/apps/reviews" method="post">
                                        <input type="hidden" name="product_id" value="{{ product.id }}">

                                        <div className="product-review-form-rating">
                                            <label className="product-review-form-label">Your Rating <span aria-hidden="true">*</span></label>
                                            <fieldset className="product-review-form-stars" aria-label="Select a rating">
                                                <legend className="visually-hidden">Rating</legend>
                                               
                                                <input
                                                    className="product-review-form-star-input visually-hidden"
                                                    type="radio"
                                                    name="rating"
                                                    id="rating-star-{{ i }}"
                                                    value="{{ i }}"
                                                    required
                                                />
                                                <label className="product-review-form-star-label" for="rating-star-{{ i }}" aria-label="{{ i }} star{{ i | pluralize: '', 's' }}">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                                    <path d="M10 1.5L12.5 7L18.5 7.5L14 11.5L15.5 17.5L10 14L4.5 17.5L6 11.5L1.5 7.5L7.5 7L10 1.5Z" stroke="#d1d1d1" stroke-width="1" fill="none"/>
                                                    </svg>
                                                </label>
                                               
                                            </fieldset>
                                        </div>
                        
                                        <div className="product-review-form-row">
                                            <div className="product-review-form-field">
                                                <label for="review-name" className="visually-hidden">Your Name</label>
                                                <input
                                                className="product-review-form-input"
                                                type="text"
                                                id="review-name"
                                                name="author"
                                                placeholder="Your Name Here"
                                                required
                                                />
                                            </div>
                                            <div className="product-review-form-field">
                                                <label for="review-email" className="visually-hidden">Your Email</label>
                                                <input
                                                className="product-review-form-input"
                                                type="email"
                                                id="review-email"
                                                name="email"
                                                placeholder="Your Email Here"
                                                required
                                                />
                                            </div>
                                        </div>

                                        
                                        <div className="product-review-form-field product-review-form-field--full">
                                            <label for="review-body" className="visually-hidden">Your Review</label>
                                            <textarea
                                                className="product-review-form-textarea"
                                                id="review-body"
                                                name="body"
                                                rows="6"
                                                placeholder="Your Review Here"
                                                required
                                            ></textarea>
                                        </div>
                                    
                                        <button className="product-review-form-submit" type="submit">Submit Now</button>
                                    </form>
                                </div>
                            </div>
                        </details>
                    </div> */}
                </div>
            </div> 
        </section>
    </main>
    
  );
}