import { NextResponse } from 'next/server';
import { currentAccount, getMarket, getPartner, saveMarket } from '@/lib/lab/store';
import { parseCompsCsv } from '@/lib/lab/market';

export const dynamic = 'force-dynamic';

const MAX_CSV = 2_000_000;

/**
 * Owner uploads comparables (an MLS export from a licensed agent, or a listing-site export)
 * for one subdivision. Mode "replace" swaps that subdivision's comps; "add" appends.
 */
export async function POST(request: Request) {
  const account = await currentAccount();
  const b = await request.json().catch(() => ({}));
  const partner = typeof b.partner === 'string' ? b.partner : '';
  if (account?.role !== 'owner' || !(await getPartner(partner))) return NextResponse.json({ ok: false }, { status: 403 });
  const community = typeof b.community === 'string' && /^[a-z0-9-]{1,40}$/.test(b.community) ? b.community : '';
  const csv = typeof b.csv === 'string' ? b.csv : '';
  const city = typeof b.city === 'string' ? b.city.slice(0, 60) : '';
  const source = typeof b.source === 'string' ? b.source.trim().slice(0, 160) : '';
  if (!community || !csv || csv.length > MAX_CSV) return NextResponse.json({ ok: false }, { status: 400 });

  const { comps, skipped, columns } = parseCompsCsv(csv, community, city);
  if (!comps.length) return NextResponse.json({ ok: false, skipped, columns }, { status: 422 });
  const prev = await getMarket(partner);
  const kept = (prev?.comps ?? []).filter((c) => b.mode === 'add' || c.community !== community);
  await saveMarket(partner, {
    notes: prev?.notes,
    updatedAt: new Date().toISOString(),
    source: source || prev?.source || '',
    comps: [...kept, ...comps],
  });
  return NextResponse.json({ ok: true, added: comps.length, skipped });
}
