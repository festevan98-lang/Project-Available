import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { currentInvestor } from '@/lib/portal/store';

export const dynamic = 'force-dynamic';

// Only project media and documents are servable; investors.json and
// project.json are never exposed through this route.
const ALLOWED = /^projects\/([a-z0-9-]+)\/(media|docs)\/([A-Za-z0-9._-]+)$/;

export async function GET(request: NextRequest) {
  const investor = await currentInvestor();
  if (!investor) return new NextResponse('Unauthorized', { status: 401 });

  const path = request.nextUrl.searchParams.get('p') ?? '';
  const match = path.match(ALLOWED);
  if (!match) return new NextResponse('Bad request', { status: 400 });
  if (!investor.projects[match[1]]) return new NextResponse('Forbidden', { status: 403 });

  const blob = await get(`portal/${path}`, { access: 'private' });
  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': blob.blob.contentType ?? 'application/octet-stream',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  };
  if (request.nextUrl.searchParams.get('dl') === '1') {
    headers['Content-Disposition'] = `attachment; filename="${match[3]}"`;
  }
  return new NextResponse(blob.stream, { headers });
}
