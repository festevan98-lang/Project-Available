import { NextResponse } from 'next/server';
import { getLink, getPartner, newId, recordEvent, saveLead } from '@/lib/lab/store';
import type { LabLead } from '@/lib/lab/types';

export const dynamic = 'force-dynamic';

const KINDS = new Set(['access', 'visit', 'interest']);
const INTERESTS = new Set(['home', 'lot', 'business', 'info', 'attorney', 'visit']);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Public: access requests from the partner page, and visit/interest requests from client links. */
export async function POST(request: Request) {
  const b = await request.json().catch(() => ({}));
  if (str(b.website, 100)) return NextResponse.json({ ok: true }); // honeypot

  const partner = str(b.partner, 40);
  const kind = str(b.kind, 20) as LabLead['kind'];
  const name = str(b.name, 120);
  const phone = str(b.phone, 40);
  const email = str(b.email, 120);
  if (!KINDS.has(kind) || !(await getPartner(partner))) return NextResponse.json({ ok: false }, { status: 400 });
  if (kind === 'access' && (!name || (!phone && !email) || b.consent !== true)) return NextResponse.json({ ok: false }, { status: 400 });

  const link = typeof b.linkId === 'string' ? await getLink(b.linkId) : null;
  if (link && (link.partner !== partner || link.revokedAt)) return NextResponse.json({ ok: false }, { status: 400 });

  const lead: LabLead = {
    id: newId(9),
    partner,
    kind,
    name: name || link?.label || '',
    phone,
    email,
    interest: Array.isArray(b.interest) ? b.interest.filter((i: unknown) => typeof i === 'string' && INTERESTS.has(i)).slice(0, 6) : [],
    message: str(b.message, 1000),
    ...(link ? { linkId: link.id } : {}),
    createdAt: new Date().toISOString(),
  };
  await saveLead(lead);
  if (link) await recordEvent(link, `lead:${kind}`);
  return NextResponse.json({ ok: true });
}
