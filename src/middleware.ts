import { NextResponse, NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, expectedSessionValue } from '@/lib/admin/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Lab test deployment: the root shows the partner site (set LAB_HOME to /lab/<partner-slug>). Unset everywhere else.
  if (path === '/') {
    const home = process.env.LAB_HOME;
    return home && /^\/lab\/[a-z0-9-]+$/.test(home) ? NextResponse.rewrite(new URL(home, request.url)) : NextResponse.next();
  }

  // Portal: redirect when no session cookie is present. Real verification
  // (signature, expiry, project access) happens server-side on every page/route.
  if (path.startsWith('/portal')) {
    if (path !== '/portal/login' && !request.cookies.get('ferest_portal')) {
      return NextResponse.redirect(new URL('/portal/login' + request.nextUrl.search, request.url));
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
  matcher: ['/', '/admin/:path*', '/api/admin/:path*', '/portal/:path*'],
};
