import Link from 'next/link';
import { getStorefrontPath, ShopifyMenuItem } from '@/lib/shopify/navigation';

function NavigationItems({ items }: { items: ShopifyMenuItem[] }) {
  return (
    <ul className="flex items-center gap-6">
      {items.map((item) => (
        <li key={item.id} className="group relative">
          <Link href={getStorefrontPath(item.url)} className="text-sm font-medium hover:underline">
            {item.title}
          </Link>
          {item.items.length > 0 && (
            <div className="invisible absolute left-0 top-full z-50 min-w-48 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <ul className="border border-neutral-200 bg-white p-3 shadow-lg">
                {item.items.map((child) => (
                  <li key={child.id} className="py-1">
                    <Link href={getStorefrontPath(child.url)} className="text-sm hover:underline">
                      {child.title}
                    </Link>
                    {child.items.length > 0 && (
                      <ul className="pl-3 pt-1">
                        {child.items.map((grandchild) => (
                          <li key={grandchild.id} className="py-1">
                            <Link href={getStorefrontPath(grandchild.url)} className="text-sm hover:underline">
                              {grandchild.title}
                            </Link>
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

export default function Navigation({ items }: { items: ShopifyMenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Main navigation" className="hidden md:block">
      <NavigationItems items={items} />
    </nav>
  );
}