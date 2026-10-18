import { NextResponse } from 'next/server';
import { getAccounts, getLink, getPartner } from '@/lib/lab/store';
import type { LabAccount } from '@/lib/lab/types';
import { LAB_COOKIE, hashLabCode, signLabSession } from '@/lib/lab/session';
import { getInvestors } from '@/lib/portal/store';
import { hashAccessCode } from '@/lib/portal/session';

export const dynamic = 'force-dynamic';

/**
 * A partner's live-portal code also opens their lab panel, so they keep one code.
 * Portal owners map to the first lab owner account.
 */
async function fromPortalCode(code: string, accounts: LabAccount[]): Promise<LabAccount | null> {
  const hash = hashAccessCode(code);
  const investor = (await getInvestors()).find((inv) => inv.codeHash === hash);
  if (!investor) return null;
  if (investor.role === 'owner') return accounts.find((a) => a.role === 'owner') ?? null;
  for (const a of accounts.filter((x) => x.role === 'partner')) {
    if ((await getPartner(a.partner))?.investorId === investor.id) return a;
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code : '';
  if (!code || code.length > 40) return NextResponse.json({ ok: false }, { status: 400 });

  const accounts = await getAccounts();
  const hash = hashLabCode(code);
  const account = accounts.find((a) => a.codeHash === hash) ?? (await fromPortalCode(code, accounts));
  if (!account) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // A client code opens the partner's client view through its tracked link; no panel session.
  if (account.role === 'client') {
    const link = account.linkId ? await getLink(account.linkId) : null;
    if (!link || link.revokedAt || link.partner !== account.partner || !(await getPartner(account.partner))) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    return NextResponse.json({ ok: true, redirect: `/lab/i/${link.id}` });
  }
  const { value, maxAge } = signLabSession(account.id);
  const res = NextResponse.json({ ok: true, partner: account.partner });
  res.cookies.set(LAB_COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge });
  return res;
}
