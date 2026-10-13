import { cache } from 'react';
import { cookies } from 'next/headers';
import { get } from '@vercel/blob';
import type { Catalog, Investor, PortalProject } from './types';
import { PORTAL_COOKIE, verifySession } from './session';
import { type ShareTarget, verifyShare } from './share';

const SLUG = /^[a-z0-9-]+$/;

// Bypass the CDN cache: removing an investor from investors.json must revoke
// access immediately, and content edits should show on the next page load.
async function readText(pathname: string): Promise<string | null> {
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return new Response(res.stream).text();
}

export const getInvestors = cache(async (): Promise<Investor[]> => {
  const text = await readText('portal/investors.json');
  return text ? (JSON.parse(text) as Investor[]) : [];
});

export const getProject = cache(async (slug: string): Promise<PortalProject | null> => {
  if (!SLUG.test(slug)) return null;
  const text = await readText(`portal/projects/${slug}/project.json`);
  return text ? (JSON.parse(text) as PortalProject) : null;
});

export const getCatalog = cache(async (id: string): Promise<Catalog | null> => {
  if (!SLUG.test(id)) return null;
  const text = await readText(`portal/catalogs/${id}/catalog.json`);
  return text ? { ...(JSON.parse(text) as Catalog), id } : null;
});

/** The signed-in investor, or null. Every portal page and route checks this. */
export async function currentInvestor(): Promise<Investor | null> {
  const id = verifySession((await cookies()).get(PORTAL_COOKIE)?.value);
  if (!id) return null;
  return (await getInvestors()).find((inv) => inv.id === id) ?? null;
}

/** The investor behind a share link, if the link is genuine and sharing is still on for them. */
export async function sharingInvestor(token: string | null | undefined): Promise<{ investor: Investor; target?: ShareTarget } | null> {
  const share = verifyShare(token);
  if (!share) return null;
  const investor = (await getInvestors()).find((inv) => inv.id === share.investorId);
  if (!investor || !investor.catalog || investor.share === false) return null;
  return { investor, target: share.target };
}

/** Same-origin URL that streams a private project file to an authorized investor. */
export function fileUrl(slug: string, file: string, download = false): string {
  return `/api/portal/file?p=${encodeURIComponent(`projects/${slug}/${file}`)}${download ? '&dl=1' : ''}`;
}

/**
 * Public paths pass through; "media/<file>" resolves inside the investor's private
 * catalog folder. Pages opened from a share link carry its token so guests can load photos.
 */
export function catalogImageUrl(catalogId: string, image: string, shareToken?: string): string {
  if (image.startsWith('/')) return image;
  const url = `/api/portal/file?p=${encodeURIComponent(`catalogs/${catalogId}/${image}`)}`;
  return shareToken ? `${url}&s=${encodeURIComponent(shareToken)}` : url;
}
