import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'proshop_admin_session';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: 0,
  });

  return new Response(null, { status: 204 });
}