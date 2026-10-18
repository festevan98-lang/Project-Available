import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { getPartner } from '@/lib/lab/store';

export const dynamic = 'force-dynamic';

const MEDIA = /^media\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Photos for a partner's public site: only files under that partner's catalog media folder.
 * No token is involved, so nothing on a lab page can open the partner's priced catalog.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('partner') ?? '';
  const file = request.nextUrl.searchParams.get('f') ?? '';
  if (!MEDIA.test(file)) return new NextResponse('Bad request', { status: 400 });
  const partner = await getPartner(slug);
  if (!partner) return new NextResponse('Not found', { status: 404 });

  const blob = await get(`portal/catalogs/${partner.catalogId}/${file}`, { access: 'private' });
  if (!blob || blob.statusCode !== 200 || !blob.stream) return new NextResponse('Not found', { status: 404 });
  const type = blob.blob.contentType ?? '';
  if (!type.startsWith('image/')) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(blob.stream, {
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' },
  });
}
