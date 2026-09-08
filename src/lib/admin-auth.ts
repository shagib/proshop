'use server';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_COOKIE = 'proshop_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error('ADMIN_PASSWORD must be configured');
  }

  return secret;
}

function createSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const signature = createHmac('sha256', getSessionSecret())
    .update(String(expiresAt))
    .digest('hex');

  return `${expiresAt}.${signature}`;
}

export async function refreshAdminSession() {
  if (!(await isAdminAuthenticated())) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: SESSION_MAX_AGE,
  });

  return true;
}

function isValidSessionToken(token: string | undefined) {
  if (!token) return false;

  const [expiresAt, signature] = token.split('.');
  const expiresAtNumber = Number(expiresAt);
  const expectedSignature = createHmac('sha256', getSessionSecret())
    .update(expiresAt || '')
    .digest('hex');

  if (
    !expiresAt ||
    !signature ||
    !Number.isFinite(expiresAtNumber) ||
    expiresAtNumber < Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(expectedSignature, 'hex');

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
}

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password');

  if (typeof password !== 'string' || !process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1');
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: SESSION_MAX_AGE,
  });

  redirect('/admin/reviews');
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: 0,
  });
  redirect('/admin/login');
}