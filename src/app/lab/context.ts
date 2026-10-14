import { catalogImageUrl, getCatalog } from '@/lib/portal/store';
import { signShare } from '@/lib/portal/share';
import type { Lang } from '@/lib/portal/types';
import { getPartner } from '@/lib/lab/store';
import type { LabPartner, LabPlan } from '@/lib/lab/types';
import { buildAppProjects, type AppHome, type AppProject } from '../portal/catalogData';
import { area, t } from '../portal/i18n';

export interface PartnerContext {
  partner: LabPartner;
  brand: { name: string; logo: string | null };
  /** Projects with both list (retail) and partner (price) figures. */
  projects: AppProject[];
}

function planHome(plan: LabPlan, project: AppProject, lang: Lang, img: (src: string) => string): AppHome {
  const rate = project.homes.find((h) => h.rate)?.rate ?? null;
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
    retail: rate ? Math.round(plan.total * rate.retail) : null,
    price: rate ? Math.round(plan.total * rate.price) : null,
    rate,
    preliminary: !!plan.review,
  };
}

/**
 * Loads a partner and its catalog for display. Catalog photos are served through a
 * share token signed for the partner's portal investor, so nobody needs a login to see them.
 * Where the partner has lab floor plans for a subdivision, they replace the catalog homes.
 */
export async function loadPartner(slug: string, lang: Lang, withProjects = true): Promise<PartnerContext | null> {
  const partner = await getPartner(slug);
  if (!partner) return null;
  const token = signShare(partner.investorId);
  const img = (src: string) => catalogImageUrl(partner.catalogId, src, token);
  const brand = { name: partner.name, logo: partner.logo ? img(partner.logo) : null };
  if (!withProjects) return { partner, brand, projects: [] };
  const catalog = await getCatalog(partner.catalogId);
  const base = catalog ? await buildAppProjects(catalog, lang, token) : [];
  const plans = partner.numbers?.plans ?? [];
  const projects = base.map((p) => {
    const here = plans.filter((x) => x.communities.includes(p.slug));
    return here.length ? { ...p, homes: here.map((x) => planHome(x, p, lang, img)) } : p;
  });
  return { partner, brand, projects };
}

/** What a client link shows: list prices by default, or the partner's own prices. */
export function clientProjects(projects: AppProject[], mode: 'list' | 'partner'): AppProject[] {
  if (mode === 'partner') return projects;
  const list = <X extends { retail: number | null; price: number | null; rate: { retail: number; price: number } | null }>(x: X): X =>
    ({ ...x, price: x.retail ?? x.price, rate: x.rate ? { ...x.rate, price: x.rate.retail } : null });
  return projects.map((p) => ({ ...p, lots: p.lots.map(list), homes: p.homes.map(list) }));
}

const BOTS = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|embedly|vercel/i;
export const isBot = (ua: string | null) => !ua || BOTS.test(ua);
