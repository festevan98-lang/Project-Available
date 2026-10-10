import { fetchLagunaHeights } from '@/lib/clickplat';
import { catalogImageUrl } from '@/lib/portal/store';
import type { Catalog, Investor, Lang } from '@/lib/portal/types';
import { C, WHATSAPP } from './ui';
import { area, t } from './i18n';
import InvestorApp, { type AppProject } from './InvestorApp';

export default async function CatalogView({ catalog, investor, lang }: { catalog: Catalog; investor: Investor; lang: Lang }) {
  const live = catalog.projects.some((p) => p.live === 'laguna-heights') ? await fetchLagunaHeights() : null;

  const projects: AppProject[] = catalog.projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    place: p.place[lang],
    image: catalogImageUrl(catalog.id, p.image),
    caption: p.caption?.[lang] ?? null,
    lotImage: p.lotImage ? catalogImageUrl(catalog.id, p.lotImage) : null,
    lotCaption: p.lotCaption?.[lang] ?? null,
    lots: p.lots.flatMap((l, i) => {
      const n = l.lot != null ? String(l.lot).replace(/^\s*lote?\s*/i, '').replace(/[^0-9A-Za-z-]/g, '') || null : null;
      if (!n) return [];
      const liveLot = p.live && live ? live.lots.find((x) => x.n === parseInt(n, 10)) : undefined;
      // A sold lot's map price is its old sale price, so only open lots borrow the map price.
      const retail = l.retail != null && l.retail > 0
        ? l.retail
        : liveLot && liveLot.status === 'available' && liveLot.price > 0 ? Math.round(liveLot.price) : null;
      const sqft = l.sqft ?? liveLot?.sqft ?? null;
      return [{
        key: `${n}-${i}`,
        n,
        area: sqft ? area(sqft, lang) : null,
        retail,
        price: l.price ?? (retail != null ? Math.round(retail * (1 - catalog.lotDiscount)) : null),
        preliminary: !!l.preliminary,
      }];
    }),
    homes: p.homes.map((h) => ({
      id: h.id,
      name: h.name,
      sub: h.type?.[lang] ?? h.note?.[lang] ?? null,
      specs: [
        h.beds != null && h.baths != null ? t(lang, 'bedBath', { b: h.beds, ba: h.baths }) : null,
        h.sqft ? area(h.sqft, lang) : null,
        h.garage?.[lang] ?? null,
      ].filter(Boolean).join(' · ') || (h.type && h.note ? h.note[lang] : null),
      image: h.image ? catalogImageUrl(catalog.id, h.image) : null,
      retail: h.retail,
      price: h.price,
      preliminary: !!h.preliminary,
    })),
  }));

  return (
    <>
      <InvestorApp lang={lang} first={investor.name.split(' ')[0]} projects={projects} wa={WHATSAPP} />
      <section style={{ maxWidth: 560, margin: '36px auto 0', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{t(lang, 'questions')}</div>
        <div style={{ fontSize: 14, color: C.inkSoft, marginTop: 4 }}>
          <a href="tel:+19562030003" style={{ color: C.goldDeep, fontWeight: 600, textDecoration: 'none' }}>+1 956-203-0003</a>
          {' · '}
          <a href="mailto:fernando@ferest.dev" style={{ color: C.goldDeep, fontWeight: 600, textDecoration: 'none' }}>fernando@ferest.dev</a>
        </div>
      </section>
    </>
  );
}
