import Link from 'next/link';
import { logoutAdmin } from '@/lib/admin-auth';

export default function AdminNav({ active }: { active: 'reviews' | 'wishlist' }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <nav className="flex gap-4">
        <Link
          href="/admin/reviews"
          className={`text-sm font-medium pb-1 border-b-2 ${
            active === 'reviews' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-500'
          }`}
        >
          Reviews
        </Link>
        <Link
          href="/admin/wishlist"
          className={`text-sm font-medium pb-1 border-b-2 ${
            active === 'wishlist' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-500'
          }`}
        >
          Wishlist
        </Link>
      </nav>
      <form action={logoutAdmin}>
        <button type="submit" className="text-sm text-neutral-600 hover:text-black">
          Log out
        </button>
      </form>
    </div>
  );
}