import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const LAB_COOKIE = 'ferest_lab';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const base = process.env.PORTAL_SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!base) throw new Error('Lab session secret unavailable');
  return createHash('sha256').update('ferest-lab-session-v1:' + base).digest('hex');
}

/** Must match hashLabCode() in portal-private/lab-sync.mjs. */
export function hashLabCode(code: string): string {
  return createHash('sha256').update('ferest-lab-v1:' + code.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');
}

export function signLabSession(accountId: string): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ a: accountId, e: exp })).toString('base64url');
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return { value: `${payload}.${sig}`, maxAge: MAX_AGE_SECONDS };
}

export function verifyLabSession(value: string | undefined): string | null {
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { a: id, e } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof id === 'string' && typeof e === 'number' && e > Date.now() / 1000 ? id : null;
  } catch {
    return null;
  }
}
