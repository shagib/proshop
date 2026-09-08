import { refreshAdminSession } from '@/lib/admin-auth';

export async function POST() {
  const refreshed = await refreshAdminSession();

  return new Response(null, { status: refreshed ? 204 : 401 });
}