import { NextResponse, NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, expectedSessionValue } from '@/lib/admin/session';

// On a partner-site deployment only the partner site, its APIs, catalog photos and static files are served.
const PARTNER_SITE_PATHS = /^\/(lab(\/|$)|api\/lab\/|api\/portal\/file$)|\.[a-z0-9]{2,5}$/i;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Partner-site deployment: LAB_HOME is /lab/<partner-slug> and the root shows that site. Unset everywhere else.
  const home = process.env.LAB_HOME;
  if (home && /^\/lab\/[a-z0-9-]+$/.test(home)) {
    if (path === '/') return NextResponse.rewrite(new URL(home, request.url));
    return PARTNER_SITE_PATHS.test(path) ? NextResponse.next() : NextResponse.redirect(new URL('/', request.url));
  }

  // Portal: redirect when no session cookie is present. Real verification
  // (signature, expiry, project access) happens server-side on every page/route.
  if (path.startsWith('/portal')) {
    if (path !== '/portal/login' && !request.cookies.get('ferest_portal')) {
      return NextResponse.redirect(new URL('/portal/login' + request.nextUrl.search, request.url));
    }
    return NextResponse.next();
  }

  if (!path.startsWith('/admin') && !path.startsWith('/api/admin')) return NextResponse.next();

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
  // Every route except Next's own build assets, so a partner-site deployment can fence off the rest of the app.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
