import { NextResponse } from 'next/server';
import { PORTAL_COOKIE } from '@/lib/portal/session';

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL('/portal/login', request.url), 303);
  res.cookies.set(PORTAL_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
