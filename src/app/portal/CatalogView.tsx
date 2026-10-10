import { fetchLagunaHeights } from '@/lib/clickplat';
import { catalogImageUrl } from '@/lib/portal/store';
import type { Catalog, Investor, Lang } from '@/lib/portal/types';
import { C, WHATSAPP } from './ui';
import { t } from './i18n';
import CatalogPicker, { type PickerLot } from './CatalogPicker';

export default async function CatalogView({ catalog, investor, lang }: { catalog: Catalog; investor: Investor; lang: Lang }) {
  const live = catalog.projects.some((p) => p.live === 'laguna-heights') ? await fetchLagunaHeights() : null;
  const pct = Math.round(catalog.lotDiscount * 100);

  return (
    <>
      <section style={{ padding: '36px 0 4px' }}>
        <span className="label">{t(lang, 'catLabel')}</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 8vw, 3.8rem)', marginTop: 8 }}>
          {t(lang, 'catHello', { first: investor.name.split(' ')[0] })}
        </h1>
        <p style={{ marginTop: 10, fontSize: 16, color: C.inkSoft, fontWeight: 500, lineHeight: 1.55, maxWidth: 640 }}>{catalog.intro[lang]}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <span style={{ background: C.gold, color: '#1A160A', border: `2px solid ${C.goldDeep}`, borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700 }}>
            {t(lang, 'catDiscount', { pct })}
          </span>
          <span style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700, color: C.inkSoft }}>
            {t(lang, 'usd')}
          </span>
        </div>
      </section>

      {catalog.projects.map((p) => {
        const lots: PickerLot[] = p.lots.map((l, i) => {
          const n = l.lot != null ? String(l.lot).replace(/^\s*lote?\s*/i, '').replace(/[^0-9A-Za-z-]/g, '') || null : null;
          const liveLot = p.live && n && live ? live.lots.find((x) => x.n === parseInt(n, 10)) : undefined;
          // A sold lot's map price is its old sale price, so only open lots borrow the map price.
          const retail = l.retail != null && l.retail > 0
            ? l.retail
            : liveLot && liveLot.status === 'available' && liveLot.price > 0 ? Math.round(liveLot.price) : null;
          return {
            key: n ?? `pending-${i}`,
            n,
            sqft: l.sqft ?? liveLot?.sqft ?? null,
            retail,
            price: retail != null ? Math.round(retail * (1 - catalog.lotDiscount)) : null,
            preliminary: l.preliminary,
          };
        });
        return (
          <section key={p.slug} style={{ marginTop: 40 }}>
            <figure style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.ink, minHeight: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={catalogImageUrl(catalog.id, p.image)} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,19,16,0) 30%, rgba(18,19,16,0.85) 100%)' }} />
              <figcaption style={{ position: 'relative', padding: '120px 20px 18px', color: C.paper }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.goldHi }}>{p.place[lang]}</div>
                <div className="display" style={{ fontSize: 'clamp(2rem, 7vw, 3rem)', marginTop: 4 }}>{p.name}</div>
                {p.caption && <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.75, marginTop: 6 }}>{p.caption[lang]}</div>}
              </figcaption>
            </figure>
            <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, lineHeight: 1.55 }}>{p.blurb[lang]}</p>
            <CatalogPicker lang={lang} project={p.name} lots={lots} homes={p.homes} discountPct={pct} wa={WHATSAPP} />
          </section>
        );
      })}

      <section style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{t(lang, 'questions')}</div>
          <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>
            Fernando Estevan, P.E. · <a href="tel:+19562030003" style={{ color: C.goldDeep, fontWeight: 700 }}>+1 956-203-0003</a> ·{' '}
            <a href="mailto:fernando@ferest.dev" style={{ color: C.goldDeep, fontWeight: 700 }}>fernando@ferest.dev</a>
          </div>
        </div>
      </section>
    </>
  );
}
