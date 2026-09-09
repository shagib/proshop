import { getWishlistedProducts } from '@/actions/admin-wishlist';
import AdminSessionTimeout from '@/components/admin/AdminSessionTimeout';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminWishlistPage() {
  const products = await getWishlistedProducts();

  return (
    <main className="p-8 max-w-[1200px] mx-auto">
      <AdminSessionTimeout />
      <AdminNav active="wishlist" />
      <h1 className="text-2xl font-semibold mb-2">Wishlist Dashboard</h1>
      <p className="text-neutral-600 mb-6">Products customers are saving for later.</p>

      {products.length === 0 ? (
        <p className="text-neutral-500">No wishlist activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Handle</th>
                <th className="py-3 pr-4">Saves</th>
                <th className="py-3 pr-4">Last added</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id} className="border-b border-neutral-100">
                  <td className="py-3 pr-4 font-medium">{product.product_title}</td>
                  <td className="py-3 pr-4 text-neutral-600">{product.product_handle}</td>
                  <td className="py-3 pr-4">{product.wishlist_count}</td>
                  <td className="py-3 pr-4 text-sm text-neutral-500">
                    {new Date(product.last_added).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}