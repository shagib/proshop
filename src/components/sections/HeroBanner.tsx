'use client';

import { HeroBannerItem } from '@/lib/shopify/banner';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection({ banners = [] }: { banners: HeroBannerItem[] }) {

  const mainBanner = banners.find((b) => b.banner_position === 'main') || banners[0];
  const rightTopBanner = banners.find((b) => b.banner_position === 'right_top') || banners[1];
  const rightBottomBanner = banners.find((b) => b.banner_position === 'right_bottom') || banners[2];

    return(
    
        <section className="flex items-start gap-8 py-25 max-w-[1856px] mx-auto max-[1024px]:flex-col max-[768px]:py-15">
      
            {/* ================= 1. LEFT MAIN BANNER ================= */}
            <div className="bg-primary-100 p-16 relative rounded-lg w-3/5 overflow-hidden h-[stretch] max-[1200px]:p-8 max-[1024px]:w-full">
                <div className="flex flex-col gap-8 justify-between h-full">
                
                    <div className="relative z-10 max-w-[700px] mb-3">
                        {mainBanner?.brand_tag && (
                            <span className="text-sm font-semibold uppercase text-primary-900 mb-6 block leading-[16.8px]">
                                {mainBanner.brand_tag}
                            </span>
                        )}
                        <h1 className="text-[84px] font-semibold uppercase text-primary-900 mb-3 leading-[100px] max-[768px]:text-4xl max-[768px]:leading-[44px]">
                            {mainBanner?.banner_title || 'Elevate Your Fashion'}
                        </h1>
                        {mainBanner?.subtitle && (
                            <p className="text-primary-900 text-lg leading-[25.2px] font-normal">
                                {mainBanner.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Background Vector Graphic Image (If exists) */}
                    {mainBanner?.bg_img && (
                        <div className="flex justify-center items-center">
                            <img
                                src={mainBanner.bg_img} 
                                alt="Banner Background" 
                                className="h-auto" 
                            />
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col justify-between align-items-start gap-[18px] max-w-[480px]">
                        {mainBanner?.discount_text && (
                            <span className="text-[84px] font-semibold uppercase text-primary-900 leading-[100px] max-[768px]:text-4xl max-[768px]:leading-[44px]">
                                {mainBanner.discount_text}
                            </span>
                        )}
                        {mainBanner?.description && (
                            <span className="text-lg font-normal text-primary-900 leading-[25.2px]">
                                {mainBanner.description}
                            </span>
                        )}
                        <Link
                        href={mainBanner?.button_url || '/collections/all'}
                        className="bg-primary-900 text-neutral-50 px-13 py-4 rounded-sm uppercase font-bold transition inline-max border-2 border-primary-900 hover:bg-transparent hover:text-primary-900 max-[768px]:px-8 max-[768px]:py-2 whitespace-nowrap max-[768px]:text-sm text-center"
                        >
                            {mainBanner?.button_text || 'SHOP NOW'}
                        </Link>
                    </div>
                </div>

                {/* Banner Feature Model Image */}
                {mainBanner?.banner_image && (
                    <div className="absolute right-0 bottom-0">
                        <img
                            src={mainBanner.banner_image}
                            alt="Banner Feature"
                            className="h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* ================= 2. RIGHT SIDE CARDS ================= */}
            <div className="flex flex-col gap-8 w-2/5 h-full max-[1024px]:w-full max-[1024px]:flex-row max-[768px]:flex-col">
                
                {/* Right Top Banner: Clearance Winter */}
                <div className="flex flex-col gap-8 rounded-lg overflow-hidden h-full w-full max-[1024px]:h-[stretch]">
                    <div className="relative p-8 bg-tertiary-50 flex flex-col gap-[140px] justify-between align-items-start h-full max-[800px]:gap-8 max-[768px]:gap-[140px]">
                        <div className="w-[310px] relative z-10 max-[1024px]:w-full">
                            {rightTopBanner?.subtitle && (
                                <span className="text-sm font-semibold uppercase text-tertiary-800 block leading-[16.8px]">
                                    {rightTopBanner.subtitle}
                                </span>
                            )}
                            <h2 className="mt-4 text-5xl font-semibold uppercase text-tertiary-900 leading-[57.6px] max-[768px]:text-3xl max-[768px]:leading-[38.6px]">
                                {rightTopBanner?.banner_title || 'Clearance Winter'}
                            </h2>
                        </div>

                        <div className="relative z-10 flex justify-between items-center gap-8 rounded-lg py-2 px-2 pl-4 bg-neutral max-[1560px]:flex-wrap max-[1560px]:p-4">
                            {rightTopBanner?.description && (
                                <span className="text-lg font-normal text-tertiary-950 leading-[25.2px] h-max">
                                    {rightTopBanner.description}
                                </span>
                            )}
                            <Link
                                href={rightTopBanner?.button_url || '/collections/winter'}
                                className="bg-tertiary-900 text-neutral-50 px-13 py-4 rounded-sm uppercase font-bold transition inline-max border-2 border-tertiary-900 hover:bg-transparent hover:text-tertiary-900 whitespace-nowrap max-[1560px]:w-full max-[768px]:px-8 max-[768px]:py-2 max-[768px]:text-sm text-center"
                            >
                                {rightTopBanner?.button_text || 'SHOP NOW'}
                            </Link>
                        </div>

                        {rightTopBanner?.banner_image && (
                            <div className="absolute right-0 bottom-0 top-0 h-full z-9">
                                <img
                                    src={rightTopBanner.banner_image}
                                    alt="Winter Feature"
                                    className="h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Bottom Banner: Clearance Summer */}
                <div className="flex flex-col gap-8 rounded-lg overflow-hidden h-full w-full max-[1024px]:h-[stretch]">
                    <div className="relative p-8 bg-secondary-100 flex flex-col justify-between items-center h-full">
                        {rightBottomBanner?.banner_image && (
                            <div className="bg-transparent w-max max-[1024px]:w-full">
                                <img
                                    src={rightBottomBanner.banner_image}
                                    alt="Summer Feature"
                                    className="h-auto w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="relative flex justify-between items-end gap-8 w-full max-[1560px]:flex-wrap">
                            <div className="w-[310px] max-[1024px]:w-full">
                                {rightBottomBanner?.subtitle && (
                                    <span className="text-sm font-semibold uppercase text-secondary-800 block leading-[16.8px]">
                                        {rightBottomBanner.subtitle}
                                    </span>
                                )}
                                <h2 className="mt-4 text-5xl font-semibold uppercase text-secondary-900 leading-[57.6px] max-[768px]:text-3xl max-[768px]:leading-[38.6px]">
                                    {rightBottomBanner?.banner_title || 'Clearance Summer'}
                                </h2>
                            </div>
                            <Link
                                href={rightBottomBanner?.button_url || '/collections/summer'}
                                className="text-secondary-900 px-13 py-4 rounded-sm uppercase font-bold transition inline-max border-2 border-secondary-900 hover:bg-secondary-900 hover:text-neutral whitespace-nowrap max-[768px]:px-8 max-[768px]:py-2 max-[768px]:text-sm text-center"
                            >
                                {rightBottomBanner?.button_text || 'SHOP NOW'}
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
            </section>
    );

    
}