import { NextResponse } from 'next/server';
import { getAccounts } from '@/lib/lab/store';
import { LAB_COOKIE, hashLabCode, signLabSession } from '@/lib/lab/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code : '';
  if (!code || code.length > 40) return NextResponse.json({ ok: false }, { status: 400 });

  const hash = hashLabCode(code);
  const account = (await getAccounts()).find((a) => a.codeHash === hash);
  if (!account) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { value, maxAge } = signLabSession(account.id);
  const res = NextResponse.json({ ok: true, partner: account.partner });
  res.cookies.set(LAB_COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge });
  return res;
}
