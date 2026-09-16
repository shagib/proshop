import {
  deleteContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  type ContactMessageStatus,
} from '@/actions/admin-contact';
import AdminSessionTimeout from '@/components/admin/AdminSessionTimeout';
import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/admin-auth';

const statuses: ContactMessageStatus[] = ['new', 'read', 'replied', 'archived'];

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await getAllContactMessages();

  return (
    <main className="mx-auto w-full max-w-[1200px] p-8">
      <AdminSessionTimeout />
      <AdminNav active="messages" />
      <h1 className="mb-2 text-2xl font-semibold">Contact Messages</h1>
      <p className="mb-6 text-neutral-600">
        {messages.length} total message{messages.length === 1 ? '' : 's'}
      </p>

      {messages.length === 0 ? (
        <p className="text-neutral-500">No contact messages yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className="py-3 pr-4">Sender</th>
                <th className="py-3 pr-4">Subject</th>
                <th className="py-3 pr-4">Message</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{item.name}</div>
                    <a href={`mailto:${item.email}`} className="text-sm text-neutral-600 underline">
                      {item.email}
                    </a>
                  </td>
                  <td className="py-3 pr-4 font-medium">{item.subject}</td>
                  <td className="max-w-[360px] whitespace-pre-wrap py-3 pr-4 text-sm text-neutral-700">
                    {item.message}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded bg-neutral-100 px-2 py-1 text-xs capitalize">{item.status}</span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-neutral-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex min-w-36 flex-col items-start gap-2">
                      {statuses.map((status) => (
                        <form key={status} action={updateContactMessageStatus.bind(null, item.id, status)}>
                          <button type="submit" className="text-sm underline underline-offset-2">
                            Mark {status}
                          </button>
                        </form>
                      ))}
                      <form action={deleteContactMessage.bind(null, item.id)}>
                        <button type="submit" className="text-sm text-red-700 underline underline-offset-2">
                          Delete
                        </button>
                      </form>
                    </div>
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