import { getAllReviews } from '@/actions/admin-review';
import AdminSessionTimeout from '@/components/admin/AdminSessionTimeout';
import ReviewActions from '@/components/admin/ReviewActions';
import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await getAllReviews();

  return (
    <main className="p-8 max-w-[1200px] mx-auto">
      <AdminSessionTimeout />
      <AdminNav active="reviews" />
      <h1 className="text-2xl font-semibold mb-2">Reviews Dashboard</h1>

      <p className="text-neutral-600 mb-6">
        Total {reviews.length} review — {reviews.filter((r) => !r.approved).length} waiting for approved
      </p>

      {reviews.length === 0 ? (
        <p>Do not get any review now</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Author</th>
                <th className="py-3 pr-4">Rating</th>
                <th className="py-3 pr-4">Review</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-neutral-100 align-top">
                  <td className="py-3 pr-4">{review.product_handle}</td>
                  <td className="py-3 pr-4">{review.author_name}</td>
                  <td className="py-3 pr-4">{review.rating}/5</td>
                  <td className="py-3 pr-4 max-w-[300px]">
                    {review.title && <div className="font-medium">{review.title}</div>}
                    <div className="text-neutral-600 text-sm">{review.body}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        review.approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-neutral-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <ReviewActions id={review.id} approved={review.approved} />
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