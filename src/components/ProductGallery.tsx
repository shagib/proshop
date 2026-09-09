'use client';

import { useState } from 'react';
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

  return (
    <div className="product-gallery flex flex-col gap-5 w-1/2">
        <div className="product-gallery-main p-30 bg-neutral-50 border rounded-lg border-neutral-100">
            {activeImage && (
                <img
                    src={activeImage.url}
                    alt={activeImage.altText ?? productTitle}
                    className="product-gallery-main-img rounded-lg"
                />
            )}
        </div>

        <div className="product-gallery-thumbs flex gap-5 justify-start h-[160px]">
            {images.slice(0, 5).map((image, index) => (
                <button
                    key={index}
                    type="button"
                    className={`product-gallery-thumb ${
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
                    className="product-gallery-thumb-img h-full w-full p-2 bg-neutral-50 border rounded-lg border-neutral-100"
                    />
                </button>
            ))}
        </div>
    </div>
  );
}