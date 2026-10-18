import { fetchLagunaHeights } from '@/lib/clickplat';
import { catalogImageUrl } from '@/lib/portal/store';
import type { Catalog, Lang, MapPin, Rate } from '@/lib/portal/types';
import { area, t } from './i18n';

export interface AppImage {
  src: string;
  caption: string | null;
}

export interface AppLot {
  key: string;
  n: string;
  address: string | null;
  sqft: number | null;
  area: string | null;
  retail: number | null;
  price: number | null;
  rate: Rate | null;
  preliminary: boolean;
  map: string | null;
}

export interface AppHome {
  id: string;
  name: string;
  sub: string | null;
  specs: string | null;
  images: AppImage[];
  sqft: number | null;
  totalSqft: number | null;
  retail: number | null;
  price: number | null;
  rate: Rate | null;
  /** Area the rate is priced on; total (under roof) unless set. */
  rateBasis?: 'living' | 'total';
  preliminary: boolean;
}

export interface AppProject {
  slug: string;
  name: string;
  place: string;
  image: AppImage;
  lotImage: AppImage | null;
  map: string | null;
  appraisal: { perSqft: number; note: string } | null;
  lots: AppLot[];
  homes: AppHome[];
}

/** Apple Maps link that opens satellite view on the pin (web Apple Maps on non-Apple devices). */
export function appleMaps(pin: MapPin | undefined, label: string): string | null {
  if (!pin) return null;
  if (pin.lat != null && pin.lng != null) {
    return `https://maps.apple.com/?ll=${pin.lat},${pin.lng}&q=${encodeURIComponent(label)}&t=k`;
  }
  return pin.address ? `https://maps.apple.com/?q=${encodeURIComponent(pin.address)}&t=k` : null;
}

export async function buildAppProjects(catalog: Catalog, lang: Lang, shareToken?: string): Promise<AppProject[]> {
  const live = catalog.projects.some((p) => p.live === 'laguna-heights') ? await fetchLagunaHeights() : null;
  const img = (src: string) => catalogImageUrl(catalog.id, src, shareToken);

  return catalog.projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    place: p.place[lang],
    image: { src: img(p.image), caption: p.caption?.[lang] ?? null },
    lotImage: p.lotImage ? { src: img(p.lotImage), caption: p.lotCaption?.[lang] ?? null } : null,
    map: appleMaps(p.map, p.name),
    appraisal: p.appraisal ? { perSqft: p.appraisal.perSqft, note: p.appraisal.note[lang] } : null,
    lots: p.lots.flatMap((l, i) => {
      const n = l.lot != null ? String(l.lot).replace(/^\s*lote?\s*/i, '').replace(/[^0-9A-Za-z-]/g, '') || null : null;
      if (!n) return [];
      const liveLot = p.live && live ? live.lots.find((x) => x.n === parseInt(n, 10)) : undefined;
      const sqft = l.sqft ?? liveLot?.sqft ?? null;
      const fromRate = p.lotRate && sqft ? p.lotRate : null;
      // A sold lot's map price is its old sale price, so only open lots borrow the map price.
      const retail = l.retail != null && l.retail > 0 ? l.retail
        : fromRate ? Math.round(sqft! * fromRate.retail)
        : liveLot && liveLot.status === 'available' && liveLot.price > 0 ? Math.round(liveLot.price) : null;
      const price = l.price ?? (fromRate ? Math.round(sqft! * fromRate.price)
        : retail != null ? Math.round(retail * (1 - catalog.lotDiscount)) : null);
      const label = `${p.name} · ${t(lang, 'lot', { n })}`;
      return [{
        key: `${n}-${i}`,
        n,
        address: l.address ?? null,
        sqft,
        area: sqft ? area(sqft, lang) : null,
        retail,
        price,
        rate: l.retail == null && l.price == null ? fromRate : null,
        preliminary: !!l.preliminary,
        map: appleMaps(l.map ?? (l.address ? { address: l.address } : p.map), label),
      }];
    }),
    homes: p.homes.map((h) => {
      const sqft = h.sqft ?? null;
      const buildSqft = h.totalSqft ?? sqft;
      const fromRate = p.buildRate && buildSqft ? p.buildRate : null;
      const images: AppImage[] = [
        ...(h.image ? [{ src: img(h.image), caption: null }] : []),
        ...(h.gallery ?? []).map((g) => ({ src: img(g.src), caption: g.caption?.[lang] ?? null })),
      ];
      return {
        id: h.id,
        name: h.name,
        sub: h.type?.[lang] ?? h.note?.[lang] ?? null,
        specs: [
          [h.beds != null && h.baths != null ? t(lang, 'bedBath', { b: h.beds, ba: h.baths }) : null, h.garage?.[lang] ?? null].filter(Boolean).join(' · '),
          sqft && h.totalSqft ? t(lang, 'areas', { living: area(sqft, lang), total: area(h.totalSqft, lang) }) : sqft ? area(sqft, lang) : null,
        ].filter(Boolean).join('\n') || null,
        images: images.length ? images : [{ src: img(p.image), caption: p.caption?.[lang] ?? null }],
        sqft,
        totalSqft: h.totalSqft ?? null,
        retail: h.retail ?? (fromRate ? Math.round(buildSqft! * fromRate.retail) : null),
        price: h.price ?? (fromRate ? Math.round(buildSqft! * fromRate.price) : null),
        rate: h.retail == null && h.price == null ? fromRate : null,
        preliminary: !!h.preliminary,
      };
    }),
  }));
}
