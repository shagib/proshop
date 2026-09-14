'use client';

import { useState, useRef } from 'react';
import { useProductVariant } from './ProductVariantcontext';

type GalleryImage = {
  url: string;
  altText: string | null;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  productTitle: string;
};

export default function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const { selectedVariant } = useProductVariant();
  const variantImage = selectedVariant?.image ?? null;

  return (
    <ProductGalleryView
      key={selectedVariant?.id ?? 'default-variant'}
      images={images}
      productTitle={productTitle}
      variantImage={variantImage}
    />
  );
}

type ProductGalleryViewProps = ProductGalleryProps & {
  variantImage: GalleryImage | null;
};

function ProductGalleryView({ images, productTitle, variantImage }: ProductGalleryViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(variantImage);
  const activeImage = selectedImage ?? images[activeIndex];
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollAmount = 128;

  const handleScrollTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        top: -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="product-gallery flex flex-row-reverse gap-5 w-1/2 h-[630px] flex-auto sticky top-[164px] overflow-hidden">
        <div className="product-gallery-main bg-neutral-50 border rounded-lg border-neutral-100 w-full flex justify-center overflow-hidden">
            {activeImage && (
                <img
                    src={activeImage.url}
                    alt={activeImage.altText ?? productTitle}
                    className="product-gallery-main-img object-cover w-full"
                />
            )}
        </div>

        <div className="relative flex flex-col items-center w-1/4">
            <button
              type="button"
              onClick={handleScrollTop}
              className="w-full py-1 bg-white/80 backdrop-blur border border-neutral-200 rounded-t-lg flex justify-center items-center hover:bg-neutral-100 cursor-pointer z-10"
              aria-label="Scroll up"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
              <div ref={containerRef} className="product-gallery-thumbs flex flex-col gap-2 justify-start w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-2">
                {images.slice(0, 10).map((image, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`product-gallery-thumb h-[120px] ${
                        image.url === activeImage?.url ? 'product-gallery-thumb--active' : ''}`}
                        aria-label={`View image ${index + 1}`}
                        aria-current={image.url === activeImage?.url}
                        onClick={() => {
                          setActiveIndex(index);
                          setSelectedImage(image);
                        }}
                    >
                        <img
                        src={image.url}
                        alt={image.altText ?? productTitle}
                        className="product-gallery-thumb-img object-cover h-full w-full border rounded-lg border-neutral-100"
                        />
                    </button>
                ))}
            </div>
            <button
              type="button"
              onClick={handleScrollBottom}
              className="w-full py-1 bg-white/80 backdrop-blur border border-neutral-200 rounded-b-lg flex justify-center items-center hover:bg-neutral-100 cursor-pointer z-10"
              aria-label="Scroll down"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
        </div>
        
    </div>
  );
}