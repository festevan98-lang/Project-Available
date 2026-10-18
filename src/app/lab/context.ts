import { getCatalog } from '@/lib/portal/store';
import type { Lang } from '@/lib/portal/types';
import { getPartner } from '@/lib/lab/store';
import type { LabNumbers, LabPartner, LabPlan } from '@/lib/lab/types';
import { buildAppProjects, type AppHome, type AppImage, type AppProject } from '../portal/catalogData';
import { area, t } from '../portal/i18n';

export interface PartnerContext {
  partner: LabPartner;
  brand: { name: string; logo: string | null };
  /** Photo of a finished home for the public page, if the partner has one. */
  hero: string | null;
  /** Projects with both list (retail) and partner (price) figures. */
  projects: AppProject[];
}

function planHome(plan: LabPlan, project: AppProject, lang: Lang, img: (src: string) => string, numbers?: LabNumbers): AppHome {
  const rate = numbers?.buildRate ?? project.homes.find((h) => h.rate)?.rate ?? null;
  const basis = numbers?.buildBasis ?? 'total';
  const priceArea = basis === 'living' ? plan.living : plan.total;
  return {
    id: plan.id,
    name: plan.name,
    sub: plan.style[lang],
    specs: [
      [t(lang, 'bedBath', { b: plan.beds, ba: plan.baths }), plan.garage?.[lang] ?? null].filter(Boolean).join(' · '),
      t(lang, 'areas', { living: area(plan.living, lang), total: area(plan.total, lang) }),
    ].join('\n'),
    images: plan.images?.length ? plan.images.map((src) => ({ src: img(src), caption: null })) : [project.image],
    sqft: plan.living,
    totalSqft: plan.total,
    retail: rate ? Math.round(priceArea * rate.retail) : null,
    price: rate ? Math.round(priceArea * rate.price) : null,
    rate,
    rateBasis: basis,
    preliminary: !!plan.review,
  };
}

/** Public photo URL for a file in the partner's catalog media folder (served by /api/lab/media). */
export const labMediaUrl = (partner: string, file: string) => `/api/lab/media?partner=${encodeURIComponent(partner)}&f=${encodeURIComponent(file)}`;

/**
 * Loads a partner and its catalog for display. Photos come from the lab media route, which
 * serves only this partner's catalog media and carries no token that could open the priced catalog.
 * Where the partner has lab floor plans for a subdivision, they replace the catalog homes.
 */
export async function loadPartner(slug: string, lang: Lang, withProjects = true): Promise<PartnerContext | null> {
  const partner = await getPartner(slug);
  if (!partner) return null;
  const img = (src: string) => (src.startsWith('/') ? src : labMediaUrl(partner.slug, src));
  const brand = { name: partner.name, logo: partner.logo ? img(partner.logo) : null };
  const heroSrc = partner.numbers?.plans?.find((x) => x.real)?.images?.[0];
  const hero = heroSrc ? img(heroSrc) : null;
  if (!withProjects) return { partner, brand, hero, projects: [] };
  const catalog = await getCatalog(partner.catalogId);
  // Catalog photo URLs point at the investor portal's file route; move them to the lab media route.
  const toLab = (i: AppImage): AppImage => {
    const m = i.src.match(/^\/api\/portal\/file\?p=([^&]+)/);
    const path = m ? decodeURIComponent(m[1]) : '';
    const prefix = `catalogs/${partner.catalogId}/`;
    return path.startsWith(prefix) ? { ...i, src: labMediaUrl(partner.slug, path.slice(prefix.length)) } : i;
  };
  const base = (catalog ? await buildAppProjects(catalog, lang) : []).map((p) => ({
    ...p,
    image: toLab(p.image),
    lotImage: p.lotImage ? toLab(p.lotImage) : null,
    homes: p.homes.map((h) => ({ ...h, images: h.images.map(toLab) })),
  }));
  const plans = partner.numbers?.plans ?? [];
  const projects = base.map((p) => {
    const here = plans.filter((x) => x.communities.includes(p.slug));
    return here.length ? { ...p, homes: here.map((x) => planHome(x, p, lang, img, partner.numbers)) } : p;
  });
  return { partner, brand, hero, projects };
}

export { clientPrice, clientProjects } from './pricing';

const BOTS = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|embedly|vercel/i;
export const isBot = (ua: string | null) => !ua || BOTS.test(ua);
