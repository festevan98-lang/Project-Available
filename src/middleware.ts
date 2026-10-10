import { NextResponse, NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, expectedSessionValue } from '@/lib/admin/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Portal: redirect when no session cookie is present. Real verification
  // (signature, expiry, project access) happens server-side on every page/route.
  if (path.startsWith('/portal')) {
    if (path !== '/portal/login' && !request.cookies.get('ferest_portal')) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expected = await expectedSessionValue();
  const authed = !!cookie && !!expected && cookie === expected;

  if (path === '/admin/login') {
    if (authed) return NextResponse.redirect(new URL('/admin/lots/laguna-heights', request.url));
    return NextResponse.next();
  }

  if (path.startsWith('/admin') && !authed) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (path.startsWith('/api/admin') && path !== '/api/admin/login' && !authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/portal/:path*'],
};
