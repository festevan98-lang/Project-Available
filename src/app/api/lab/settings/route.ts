import { NextResponse } from 'next/server';
import { canManage, currentAccount, getPartner, getSettings, saveSettings } from '@/lib/lab/store';
import type { ClientPricing } from '@/lib/lab/types';

export const dynamic = 'force-dynamic';

const MODES: ClientPricing['mode'][] = ['partner', 'list', 'markup'];
const MAX_MARKUP = 50;

/** Partner sets the prices their clients see. */
export async function POST(request: Request) {
  const account = await currentAccount();
  const b = await request.json().catch(() => ({}));
  const partner = typeof b.partner === 'string' ? b.partner : '';
  if (!canManage(account, partner) || !(await getPartner(partner))) return NextResponse.json({ ok: false }, { status: 403 });
  const mode = MODES.includes(b.mode) ? (b.mode as ClientPricing['mode']) : null;
  const pct = Number(b.markupPct);
  if (!mode || !Number.isFinite(pct)) return NextResponse.json({ ok: false }, { status: 400 });
  const clientPricing: ClientPricing = { mode, markupPct: Math.round(Math.min(MAX_MARKUP, Math.max(0, pct)) * 10) / 10 };
  const prev = await getSettings(partner);
  await saveSettings(partner, { ...prev, clientPricing, updatedAt: new Date().toISOString(), updatedBy: account!.id });
  return NextResponse.json({ ok: true, clientPricing });
}
