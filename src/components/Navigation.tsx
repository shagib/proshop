'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStorefrontPath, ShopifyMenuItem } from '@/lib/shopify/navigation';
import { requestCartOpen } from '@/lib/cart-events';

function isCartItem(item: ShopifyMenuItem) {
  const title = item.title.trim().toLowerCase();
  const url = item.url.trim().toLowerCase();
  return title === 'cart' || title === 'my cart' || /\/cart(?:[/?#]|$)/.test(url);
}

function CartMenuTrigger({ title }: { title: string }) {
  return (
    <button
      type="button"
      onClick={requestCartOpen}
      className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L20.5 9H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1" fill="currentColor" />
        <circle cx="18" cy="20" r="1" fill="currentColor" />
      </svg>
      {title}
    </button>
  );
}

function NavigationItems({ items }: { items: ShopifyMenuItem[] }) {
  return (
    <ul className="flex items-center gap-6">
      {items.map((item) => (
        <li key={item.id} className="group relative">
          {isCartItem(item) ? <CartMenuTrigger title={item.title} /> : (
            <Link href={getStorefrontPath(item.url)} className="text-sm font-medium hover:underline">
              {item.title}
            </Link>
          )}
          {item.items.length > 0 && (
            <div className="invisible absolute left-0 top-full z-50 min-w-48 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <ul className="border border-neutral-200 bg-white p-3 shadow-lg">
                {item.items.map((child) => (
                  <li key={child.id} className="py-1">
                    {isCartItem(child) ? <CartMenuTrigger title={child.title} /> : (
                      <Link href={getStorefrontPath(child.url)} className="text-sm hover:underline">
                        {child.title}
                      </Link>
                    )}
                    {child.items.length > 0 && (
                      <ul className="pl-3 pt-1">
                        {child.items.map((grandchild) => (
                          <li key={grandchild.id} className="py-1">
                            {isCartItem(grandchild) ? <CartMenuTrigger title={grandchild.title} /> : (
                              <Link href={getStorefrontPath(grandchild.url)} className="text-sm hover:underline">
                                {grandchild.title}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function BottomNavIcon({ item }: { item: ShopifyMenuItem }) {
  const title = item.title.trim().toLowerCase();
  const path = getStorefrontPath(item.url);

  if (isCartItem(item)) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L20.5 9H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1" fill="currentColor" />
        <circle cx="18" cy="20" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (title === 'home' || path === '/') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title.includes('shop') || title.includes('collection') || path.startsWith('/collections')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 8h16l-1 12H5L4 8Zm3 0a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BottomNavigation({ items }: { items: ShopifyMenuItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 shadow-[0_-5px_18px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <ul className="grid auto-cols-fr grid-flow-col overflow-x-auto px-1 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((item) => {
          const href = getStorefrontPath(item.url);
          const active = !isCartItem(item) && (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
          const className = `flex min-w-16 flex-col items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${active ? 'text-neutral-950' : 'text-neutral-500 hover:text-neutral-950'}`;

          return (
            <li key={item.id}>
              {isCartItem(item) ? (
                <button type="button" onClick={requestCartOpen} className={className}>
                  <span className="h-5 w-5"><BottomNavIcon item={item} /></span>
                  <span className="max-w-20 truncate">{item.title}</span>
                </button>
              ) : (
                <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
                  <span className="h-5 w-5"><BottomNavIcon item={item} /></span>
                  <span className="max-w-20 truncate">{item.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Navigation({ items }: { items: ShopifyMenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <nav aria-label="Main navigation" className="hidden md:block">
        <NavigationItems items={items} />
      </nav>
      <BottomNavigation items={items} />
    </>
  );
}
