import Link from 'next/link';
import { getStorefrontNavigation, getStorefrontPath } from '@/lib/shopify/navigation';

export default async function Footer() {
  const { shop, menu } = await getStorefrontNavigation('footer-menu');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto grid w-full max-w-[1856px] gap-10 px-8 py-12 md:grid-cols-[1fr_2fr] max-[1024px]:px-4">
        <div>
          <Link href="/" className="text-xl font-semibold">
            {shop.name}
          </Link>
          <p className="mt-3 max-w-sm text-sm text-neutral-300">
            Shop with confidence and discover products made for everyday life.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          {menu?.items.length ? (
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {menu.items.map((item) => (
                <li key={item.id}>
                  <Link href={getStorefrontPath(item.url)} className="text-sm text-neutral-200 hover:text-white hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              <li><Link href="/pages/contact" className="text-sm text-neutral-200 hover:text-white hover:underline">Contact</Link></li>
              <li><Link href="/pages/faq" className="text-sm text-neutral-200 hover:text-white hover:underline">FAQ</Link></li>
              <li><Link href="/pages/privacy-policy" className="text-sm text-neutral-200 hover:text-white hover:underline">Privacy policy</Link></li>
              <li><Link href="/pages/terms-of-service" className="text-sm text-neutral-200 hover:text-white hover:underline">Terms of service</Link></li>
            </ul>
          )}
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1856px] px-8 py-5 text-sm text-neutral-400 max-[1024px]:px-4">
          © {year} {shop.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}