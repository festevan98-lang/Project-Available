import { NextResponse } from 'next/server';
import { currentAccount, getPartner, listBuilds, newId, saveBuilds } from '@/lib/lab/store';
import { STAGE_ORDER, type StageKey } from '@/lib/lab/permits';
import type { Build, StageStatus } from '@/lib/lab/types';

export const dynamic = 'force-dynamic';

const STATUSES: StageStatus[] = ['pending', 'scheduled', 'passed', 'failed'];
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Owner adds homes and records inspection results; the partner sees them in the panel. */
export async function POST(request: Request) {
  const account = await currentAccount();
  const b = await request.json().catch(() => ({}));
  const partner = str(b.partner, 40);
  if (account?.role !== 'owner' || !(await getPartner(partner))) return NextResponse.json({ ok: false }, { status: 403 });
  const builds = await listBuilds(partner);
  const now = new Date().toISOString();

  if (b.action === 'create') {
    const label = str(b.label, 120);
    const community = str(b.community, 40);
    if (!label || !/^[a-z0-9-]+$/.test(community)) return NextResponse.json({ ok: false }, { status: 400 });
    const build: Build = { id: newId(9), partner, label, community, stages: {}, createdAt: now, updatedAt: now };
    await saveBuilds(partner, [...builds, build]);
    return NextResponse.json({ ok: true, build });
  }

  const build = builds.find((x) => x.id === b.id);
  if (!build) return NextResponse.json({ ok: false }, { status: 404 });

  if (b.action === 'stage') {
    const stage = b.stage as StageKey;
    const status = b.status as StageStatus;
    if (!STAGE_ORDER.includes(stage) || !STATUSES.includes(status)) return NextResponse.json({ ok: false }, { status: 400 });
    const date = /^\d{4}-\d{2}-\d{2}$/.test(str(b.date, 10)) ? str(b.date, 10) : now.slice(0, 10);
    const next: Build = { ...build, stages: { ...build.stages, [stage]: { status, date, note: str(b.note, 300) || undefined } }, updatedAt: now };
    await saveBuilds(partner, builds.map((x) => (x.id === build.id ? next : x)));
    return NextResponse.json({ ok: true, build: next });
  }

  if (b.action === 'delete') {
    await saveBuilds(partner, builds.filter((x) => x.id !== build.id));
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
