import { getProducts } from '@/lib/shopify';
import { Product } from '@/types/shopify';
import bannerBg from '../img/banner-heading.svg';
import bannerFeatureBg from '../img/banner-feature.png';
import summerFeatureBg from '../img/summer-feature.png';
import winterFeatureBg from '../img/winter-feature.png';

export default async function Home() {
  let products: Product[] = [];
  try {
    const data = await getProducts(12);
    products = data.products.nodes;
  }catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <main className="banner px-8 max-[1024px]:px-4">
        <section className="flex items-start gap-8 py-25 max-w-[1856px] mx-auto max-[1024px]:flex-col"> 
          <div className="bg-primary-100 p-16 relative rounded-lg w-3/5 overflow-hidden h-[stretch] max-[1200px]:p-8 max-[1024px]:w-full">
            <div className="flex flex-col gap-8 justify-between h-full">
              <div className="relative z-10 max-w-[700px] mb-3">
                <span className="text-sm font-semibold uppercase text-primary-900 mb-6 block leading-[16.8px]">
                  LOUIS VUITTON
                </span> 
                <h1 className="text-[84px] font-semibold uppercase text-primary-900 mb-3 leading-[100px] max-[768px]:text-4xl max-[768px]:leading-[44px]">
                  Elevate Your Fashion
                </h1>
                <p className="text-primary-900 text-lg leading-[25.2px] font-normal">
                  All Limited Edition in One Place
                </p>
              </div>
              <div className="flex justify-center items-center">
                <img src={bannerBg.src} alt="Banner Background" className="h-auto" />
              </div>
              <div className="relative z-10 flex flex-col justify-between align-items-start gap-[18px] max-w-[480px]">
                <span className="text-[84px] font-semibold uppercase text-primary-900 leading-[100px] max-[768px]:text-4xl max-[768px]:leading-[44px]">
                  50%<span className="text-[28px] leading-[33.6px] font-semibold ml-3 max-[768px]:text-xl max-[768px]:leading-[28px]">off</span>
                </span>
                <span className="text-lg font-normal text-primary-900 leading-[25.2px]">
                  Discover quality fashion that reflects your style and makes everyday living more enjoyable.
                </span>
                <button className="bg-primary-900 text-neutral-50 px-13 py-4 rounded-sm uppercase font-bold transition inline-max border-2 border-primary-900 rounded-sm hover:bg-transparent hover:text-primary-900 max-[768px]:px-8 max-[768px]:py-2 whitespace-nowrap max-[768px]:text-sm">
                  SHOP NOW
                </button>
              </div>
            </div>
            <div className="absolute right-0 bottom-0">
              <img src={bannerFeatureBg.src} alt="Banner Feature" className="h-full cover" />
            </div>
          </div>
          <div className="flex flex-col gap-8 w-2/5 h-full max-[1024px]:w-full max-[1024px]:flex-row max-[768px]:flex-col">
            <div className="flex flex-col gap-8 rounded-lg overflow-hidden h-full w-full max-[1024px]:h-[stretch]">
              <div className="relative p-8 bg-tertiary-50 flex flex-col gap-[140px] justify-between align-items-start h-full  max-[800px]:gap-8 max-[768px]:gap-[140px]">
                <div className="w-[310px] relative z-10 max-[1024px]:w-full">
                  <span className="text-sm font-semibold uppercase text-tertiary-800 block leading-[16.8px]">Featured Collection</span>
                  <h2 className="mt-4 text-5xl font-semibold uppercase text-tertiary-900 leading-[57.6px] max-[768px]:text-3xl max-[768px]:leading-[38.6px]">Clearance Winter</h2>
                </div> 
                <div className="relative z-10 flex justify-between items-center gap-8 rounded-lg py-2 px-2 pl-4 bg-neutral max-[1560px]:flex-wrap max-[1560px]:p-4">
                  <span className="text-lg font-normal text-tertiary-950 leading-[25.2px] h-max">
                    welcome for new commerce, we have a special offer! claim now!
                  </span>
                  <button className="bg-tertiary-900 text-neutral-50 px-13 py-4 rounded-sm uppercase font-bold transition inline-max border-2 border-tertiary-900 rounded-sm hover:bg-transparent hover:text-tertiary-900 whitespace-nowrap max-[1560px]:w-full max-[768px]:px-8 max-[768px]:py-2 max-[768px]:text-sm">
                    SHOP NOW
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 top-0 h-full z-9">
                  <img src={winterFeatureBg.src} alt="Banner Feature" className="h-full object-cover" />
                </div> 
              </div>
            </div>
            <div className="flex flex-col gap-8 rounded-lg overflow-hidden h-full w-full max-[1024px]:h-[stretch]">
              <div className="relative p-8 bg-secondary-100 flex flex-col justify-between items-center h-full">
                <div className="bg-transparent w-max max-[1024px]:w-full">
                  <img src={summerFeatureBg.src} alt="Banner Feature" className="h-auto w-full object-cover" />
                </div> 
                
                <div className="relative flex justify-between items-end gap-8 w-full max-[1560px]:flex-wrap">
                  <div className="w-[310px] max-[1024px]:w-full">
                    <span className="text-sm font-semibold uppercase text-secondary-800 block leading-[16.8px]">Featured Collection</span>
                    <h2 className="mt-4 text-5xl font-semibold uppercase text-secondary-900 leading-[57.6px] max-[768px]:text-3xl max-[768px]:leading-[38.6px]">Clearance Summer</h2>
                  </div> 
                  <button className="text-secondary-900 px-13 py-4 rounded-sm uppercase font-bold transition inline-max border-2 border-secondary-900 rounded-sm hover:bg-secondary-900 hover:text-neutral whitespace-nowrap max-[768px]:px-8 max-[768px]:py-2 max-[768px]:text-sm">
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}