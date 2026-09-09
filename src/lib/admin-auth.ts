'use server';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_COOKIE = 'proshop_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; startedAt: number }>();

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

function passwordsMatch(provided: string, expected: string) {
  const providedHash = createHash('sha256').update(provided).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
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
  const requestHeaders = await headers();
  const address = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(address);

  if (attempt && now - attempt.startedAt < LOGIN_WINDOW_MS && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    redirect('/admin/login?error=1');
  }

  if (attempt && now - attempt.startedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.delete(address);
  }

  if (
    typeof password !== 'string' ||
    !process.env.ADMIN_PASSWORD ||
    !passwordsMatch(password, process.env.ADMIN_PASSWORD)
  ) {
    const current = loginAttempts.get(address);
    loginAttempts.set(address, {
      count: current && now - current.startedAt < LOGIN_WINDOW_MS ? current.count + 1 : 1,
      startedAt: current && now - current.startedAt < LOGIN_WINDOW_MS ? current.startedAt : now,
    });
    redirect('/admin/login?error=1');
  }

  loginAttempts.delete(address);

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