import { NextResponse } from 'next/server';
import { canManage, createLink, currentAccount, getLink, getPartner, saveLink } from '@/lib/lab/store';

export const dynamic = 'force-dynamic';

/** Partner creates a personal client link. */
export async function POST(request: Request) {
  const account = await currentAccount();
  const b = await request.json().catch(() => ({}));
  const partner = typeof b.partner === 'string' ? b.partner : '';
  if (!canManage(account, partner) || !(await getPartner(partner))) return NextResponse.json({ ok: false }, { status: 403 });
  const label = typeof b.label === 'string' ? b.label.trim().slice(0, 80) : '';
  if (!label) return NextResponse.json({ ok: false }, { status: 400 });
  const link = await createLink(partner, label, account!.id);
  return NextResponse.json({ ok: true, id: link.id, url: `${new URL(request.url).origin}/lab/i/${link.id}` });
}

/** Partner switches a link off (or back on). */
export async function PATCH(request: Request) {
  const account = await currentAccount();
  const b = await request.json().catch(() => ({}));
  const link = typeof b.id === 'string' ? await getLink(b.id) : null;
  if (!link || !canManage(account, link.partner)) return NextResponse.json({ ok: false }, { status: 403 });
  const next = b.active === true ? { ...link, revokedAt: undefined } : { ...link, revokedAt: new Date().toISOString() };
  await saveLink(next);
  return NextResponse.json({ ok: true, revokedAt: next.revokedAt ?? null });
}
