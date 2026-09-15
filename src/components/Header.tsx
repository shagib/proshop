import Link from 'next/link';
import CartWidget from './CartWidget';
import WishlistBadge from './Wishlistbadge';
import Navigation from './Navigation';
import { getStorefrontNavigation } from '@/lib/shopify/navigation';

export default async function Header() {
  const { shop, menu } = await getStorefrontNavigation();
  const logo = shop.brand?.logo?.image;

  return (
    <header className="site-header sticky top-0 z-40 bg-white border-b border-neutral-100">
      <div className="max-w-[1856px] mx-auto px-8 max-[1024px]:px-4 min-h-16 flex items-center justify-between gap-8">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-wide">
          {logo ? (
            <img src={logo.url} alt={logo.altText || shop.name} className="max-h-10 w-auto" />
          ) : (
            shop.name
          )}
        </Link>

        <Navigation items={menu?.items || []} />

        <div className="flex items-center gap-2">
          <WishlistBadge />
          <CartWidget />
        </div>
      </div>
    </header>
  );
}