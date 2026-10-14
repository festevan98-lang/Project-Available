import { NextResponse } from 'next/server';
import { LAB_COOKIE } from '@/lib/lab/session';

export async function POST(request: Request) {
  const back = new URL(request.headers.get('referer') ?? '/', request.url);
  const partner = back.pathname.match(/^\/lab\/([a-z0-9-]+)/)?.[1];
  const res = NextResponse.redirect(new URL(partner ? `/lab/${partner}/acceso` : '/', request.url), 303);
  res.cookies.set(LAB_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
