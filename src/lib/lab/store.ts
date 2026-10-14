import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { get, list, put } from '@vercel/blob';
import type { ClientLink, LabAccount, LabLead, LabPartner, OwnerEconomics } from './types';
import { LAB_COOKIE, verifyLabSession } from './session';

const ROOT = 'portal/lab';
const SLUG = /^[a-z0-9-]{1,40}$/;
const LINK_ID = /^[A-Za-z0-9_-]{16,40}$/;

async function readJson<T>(pathname: string): Promise<T | null> {
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return JSON.parse(await new Response(res.stream).text()) as T;
}

async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json; charset=utf-8',
  });
}

async function readAll<T>(prefix: string): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    const items = await Promise.all(page.blobs.map((b) => readJson<T>(b.pathname)));
    out.push(...items.filter((x): x is Awaited<T> => x !== null) as T[]);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

export const newId = (bytes = 16) => randomBytes(bytes).toString('base64url');

export async function getPartner(slug: string): Promise<LabPartner | null> {
  return SLUG.test(slug) ? readJson<LabPartner>(`${ROOT}/partners/${slug}.json`) : null;
}

/** FEREST cost basis for a partner's offer. Callers must check the account is an owner. */
export async function getOwnerEconomics(slug: string): Promise<OwnerEconomics | null> {
  return SLUG.test(slug) ? readJson<OwnerEconomics>(`${ROOT}/owner/${slug}.json`) : null;
}

export async function getAccounts(): Promise<LabAccount[]> {
  return (await readJson<LabAccount[]>(`${ROOT}/accounts.json`)) ?? [];
}

/** Signed-in lab account, or null. Every panel page and API route checks this. */
export async function currentAccount(): Promise<LabAccount | null> {
  const id = verifyLabSession((await cookies()).get(LAB_COOKIE)?.value);
  if (!id) return null;
  return (await getAccounts()).find((a) => a.id === id) ?? null;
}

export const canManage = (account: LabAccount | null, partner: string) =>
  !!account && (account.role === 'owner' || account.partner === partner);

export async function getLink(id: string): Promise<ClientLink | null> {
  if (!LINK_ID.test(id)) return null;
  const index = await readJson<{ partner: string }>(`${ROOT}/link-index/${id}.json`);
  return index && SLUG.test(index.partner) ? readJson<ClientLink>(`${ROOT}/links/${index.partner}/${id}.json`) : null;
}

export async function saveLink(link: ClientLink): Promise<void> {
  await writeJson(`${ROOT}/links/${link.partner}/${link.id}.json`, link);
}

export async function createLink(partner: string, label: string, createdBy: string): Promise<ClientLink> {
  const link: ClientLink = { id: newId(), partner, label, createdAt: new Date().toISOString(), createdBy, opens: 0, events: [] };
  await writeJson(`${ROOT}/link-index/${link.id}.json`, { partner });
  await saveLink(link);
  return link;
}

export async function listLinks(partner: string): Promise<ClientLink[]> {
  const links = await readAll<ClientLink>(`${ROOT}/links/${partner}/`);
  return links.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Appends an event to a link, keeping the most recent 100. */
export async function recordEvent(link: ClientLink, type: string, detail?: string): Promise<ClientLink> {
  const t = new Date().toISOString();
  const next: ClientLink = {
    ...link,
    opens: link.opens + (type === 'open' ? 1 : 0),
    lastOpenedAt: type === 'open' ? t : link.lastOpenedAt,
    events: [...link.events, { t, type, ...(detail ? { detail } : {}) }].slice(-100),
  };
  await saveLink(next);
  return next;
}

export async function saveLead(lead: LabLead): Promise<void> {
  await writeJson(`${ROOT}/leads/${lead.partner}/${lead.createdAt.replace(/[:.]/g, '-')}-${lead.id}.json`, lead);
}

export async function listLeads(partner: string): Promise<LabLead[]> {
  const leads = await readAll<LabLead>(`${ROOT}/leads/${partner}/`);
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
