import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { currentInvestor, sharingInvestor } from '@/lib/portal/store';

export const dynamic = 'force-dynamic';

// Only project media/documents and catalog media are servable; investors.json,
// project.json and catalog.json are never exposed through this route.
const PROJECT_FILE = /^projects\/([a-z0-9-]+)\/(media|docs)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/;
const CATALOG_FILE = /^catalogs\/([a-z0-9-]+)\/media\/([A-Za-z0-9][A-Za-z0-9._-]*)$/;

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('p') ?? '';
  const project = path.match(PROJECT_FILE);
  const catalog = path.match(CATALOG_FILE);
  if (!project && !catalog) return new NextResponse('Bad request', { status: 400 });

  const investor = await currentInvestor();
  if (investor) {
    if (project && !Object.hasOwn(investor.projects, project[1])) return new NextResponse('Forbidden', { status: 403 });
    if (catalog && investor.catalog !== catalog[1]) return new NextResponse('Forbidden', { status: 403 });
  } else {
    // People an investor shared with: catalog photos of that investor only, never project files.
    const shared = catalog ? await sharingInvestor(request.nextUrl.searchParams.get('s')) : null;
    if (!shared) return new NextResponse('Unauthorized', { status: 401 });
    if (shared.investor.catalog !== catalog![1]) return new NextResponse('Forbidden', { status: 403 });
  }

  const blob = await get(`portal/${path}`, { access: 'private' });
  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': blob.blob.contentType ?? 'application/octet-stream',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  };
  if (project && request.nextUrl.searchParams.get('dl') === '1') {
    headers['Content-Disposition'] = `attachment; filename="${project[3]}"`;
  }
  return new NextResponse(blob.stream, { headers });
}
