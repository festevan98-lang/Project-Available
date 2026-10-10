import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const PORTAL_COOKIE = 'ferest_portal';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// No dedicated secret needed: derive one from the Blob store token, which is
// already a server-only credential in every environment.
function secret(): string {
  const base = process.env.PORTAL_SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!base) throw new Error('Portal session secret unavailable');
  return createHash('sha256').update('ferest-portal-session-v1:' + base).digest('hex');
}

/** Must match hashCode() in portal-private/sync.mjs. */
export function hashAccessCode(code: string): string {
  return createHash('sha256')
    .update('ferest-portal-v1:' + code.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .digest('hex');
}

export function signSession(investorId: string): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ i: investorId, e: exp })).toString('base64url');
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return { value: `${payload}.${sig}`, maxAge: MAX_AGE_SECONDS };
}

/** Returns the investor id for a valid, unexpired session cookie. */
export function verifySession(value: string | undefined): string | null {
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { i, e } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof i !== 'string' || typeof e !== 'number' || e < Date.now() / 1000) return null;
    return i;
  } catch {
    return null;
  }
}
