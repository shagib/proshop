import Link from 'next/link';
import CartWidget from './CartWidget';
import WishlistBadge from './Wishlistbadge';

// NOTE: this is a placeholder header — full header/footer design & nav is not
// built yet. It only exists right now to host the cart + wishlist icons.
export default function Header() {
  return (
    <header className="site-header sticky top-0 z-40 bg-white border-b border-neutral-100">
      <div className="max-w-[1856px] mx-auto px-8 max-[1024px]:px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-wide">
          PROSHOP
        </Link>

        <div className="flex items-center gap-2">
          <WishlistBadge />
          <CartWidget />
        </div>
      </div>
    </header>
  );
}