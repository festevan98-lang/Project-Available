import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, expectedSessionValue, verifyPassword } from '@/lib/admin/session';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }
  if (!(await verifyPassword(password))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const value = await expectedSessionValue();
  if (!value) {
    return NextResponse.json({ error: 'Server is missing ADMIN_PASSWORD' }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
