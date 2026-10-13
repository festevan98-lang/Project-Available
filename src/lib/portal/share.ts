import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** What a share link opens: the whole catalog, or one project / option inside it. */
export interface ShareTarget {
  p?: string;
  k?: 'home' | 'lot';
  id?: string;
}

interface SharePayload {
  /** Investor id who shared. */
  i: string;
  v?: ShareTarget;
}

function secret(): string {
  const base = process.env.PORTAL_SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!base) throw new Error('Portal share secret unavailable');
  return createHash('sha256').update('ferest-portal-share-v1:' + base).digest('hex');
}

const SLUG = /^[a-z0-9-]{1,60}$/;

export function signShare(investorId: string, target?: ShareTarget): string {
  const v = target && SLUG.test(target.p ?? '') ? {
    p: target.p,
    ...(target.k === 'home' || target.k === 'lot' ? { k: target.k } : {}),
    ...(target.id && /^[A-Za-z0-9-]{1,60}$/.test(target.id) ? { id: target.id } : {}),
  } : undefined;
  const payload = Buffer.from(JSON.stringify(v ? { i: investorId, v } : { i: investorId })).toString('base64url');
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url').slice(0, 32);
  return `${payload}.${sig}`;
}

/** Returns the sharing investor id and target for a genuine share token. */
export function verifyShare(token: string | undefined | null): { investorId: string; target?: ShareTarget } | null {
  if (!token || token.length > 400) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url').slice(0, 32);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { i, v } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SharePayload;
    if (typeof i !== 'string') return null;
    return { investorId: i, target: v };
  } catch {
    return null;
  }
}
