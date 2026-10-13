import { NextResponse } from 'next/server';
import { currentInvestor } from '@/lib/portal/store';
import { signShare, type ShareTarget } from '@/lib/portal/share';

export const dynamic = 'force-dynamic';

/** Creates a link the signed-in investor can send to clients (no login needed to open it). */
export async function POST(request: Request) {
  const investor = await currentInvestor();
  if (!investor) return NextResponse.json({ ok: false }, { status: 401 });
  if (!investor.catalog || investor.share === false) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const target: ShareTarget | undefined = body && typeof body.target === 'object' && body.target ? body.target : undefined;
  const token = signShare(investor.id, target);
  return NextResponse.json({ ok: true, url: `${new URL(request.url).origin}/oferta/${token}` });
}
