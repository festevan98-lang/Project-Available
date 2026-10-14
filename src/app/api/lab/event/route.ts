import { NextResponse } from 'next/server';
import { getLink, recordEvent } from '@/lib/lab/store';

export const dynamic = 'force-dynamic';

const TYPE = /^(view|cta|option):[a-z0-9-]{1,48}$/;

/** Client links report what was viewed and tapped, so the partner can see interest. */
export async function POST(request: Request) {
  const b = await request.json().catch(() => ({}));
  if (typeof b.type !== 'string' || !TYPE.test(b.type)) return NextResponse.json({ ok: false }, { status: 400 });
  const link = typeof b.id === 'string' ? await getLink(b.id) : null;
  if (!link || link.revokedAt) return NextResponse.json({ ok: false }, { status: 404 });
  const detail = typeof b.detail === 'string' ? b.detail.slice(0, 120) : undefined;
  await recordEvent(link, b.type, detail);
  return NextResponse.json({ ok: true });
}
