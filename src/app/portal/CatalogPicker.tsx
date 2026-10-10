'use client';

import { useState } from 'react';
import type { CatalogHome, Lang } from '@/lib/portal/types';
import { area, money, t } from './i18n';

const C = {
  paper: '#F4F1E8', paperDeep: '#ECE8DC', ink: '#121310', inkSoft: '#4A4C46',
  gold: '#E0B64A', goldDeep: '#B08228', goldHi: '#F0D076', card: '#FFFFFF', border: 'rgba(18,19,16,0.13)',
  wa: '#25D366', waText: '#06301A', waBorder: '#128C4A',
};

export interface PickerLot {
  key: string;
  n: string | null;
  sqft: number | null;
  retail: number | null;
  price: number | null;
  preliminary?: boolean;
}

const StepTitle = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 10 }}>
    <span className="num" style={{ width: 28, height: 28, borderRadius: 999, background: C.ink, color: C.goldHi, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{n}</span>
    <span style={{ fontSize: 18, fontWeight: 700 }}>{children}</span>
  </div>
);

const Prelim = ({ lang }: { lang: Lang }) => (
  <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.inkSoft, background: C.paperDeep, border: `1px dashed ${C.inkSoft}`, borderRadius: 999, padding: '2px 8px' }}>
    {t(lang, 'prelim')}
  </span>
);

const pick = (on: boolean): React.CSSProperties => ({
  textAlign: 'left', fontFamily: 'inherit', color: C.ink, cursor: 'pointer', borderRadius: 14, padding: '14px 16px',
  background: on ? '#FBF4DF' : C.card, border: `2px solid ${on ? C.goldDeep : C.border}`,
  boxShadow: on ? `0 0 0 2px ${C.gold}` : 'none', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 44,
});

function PriceLine({ lang, retail, price }: { lang: Lang; retail: number | null; price: number | null }) {
  if (price == null) {
    return (
      <div style={{ display: 'grid', gap: 2 }}>
        {retail != null && <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>{t(lang, 'retail')} {money(retail)}</span>}
        <span style={{ fontSize: 14, fontWeight: 700, color: C.inkSoft }}>{t(lang, 'yours')}: {t(lang, 'pending')}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '2px 10px' }}>
      {retail != null && retail !== price && (
        <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
          {t(lang, 'retail')} <s>{money(retail)}</s>
        </span>
      )}
      <span style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft }}>{t(lang, 'yours')}</span>
      <span className="num" style={{ fontSize: 24, lineHeight: 1, color: C.goldDeep }}>{money(price)}</span>
    </div>
  );
}

export default function CatalogPicker({ lang, project, lots, homes, discountPct, wa }: {
  lang: Lang;
  project: string;
  lots: PickerLot[];
  homes: CatalogHome[];
  discountPct: number;
  wa: string;
}) {
  const ready = lots.filter((l) => l.n);
  const [lotKey, setLotKey] = useState<string | null>(ready[0]?.key ?? null);
  const [option, setOption] = useState<string>('lot');

  const lot = ready.find((l) => l.key === lotKey) ?? null;
  const home = homes.find((h) => h.id === option) ?? null;

  const retailTotal = lot?.retail != null && (!home || home.retail != null) ? lot.retail + (home?.retail ?? 0) : null;
  const yourTotal = lot?.price != null && (!home || home.price != null) ? lot.price + (home?.price ?? 0) : null;
  const preliminary = !!(lot?.preliminary || home?.preliminary);
  const saved = retailTotal != null && yourTotal != null && retailTotal > yourTotal ? retailTotal - yourTotal : null;

  const lotLabel = lot ? t(lang, 'lot', { n: lot.n ?? '' }) : t(lang, 'lotPending');
  const optionLabel = home ? `${home.name}${home.type ? ` · ${home.type[lang]}` : ''}` : t(lang, 'lotOnly');
  const message = t(lang, 'waMsg', { project, lot: lotLabel, option: optionLabel, price: yourTotal != null ? money(yourTotal) : t(lang, 'pending') });

  return (
    <div>
      <StepTitle n={1}>{t(lang, 'step1')}</StepTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {ready.length > 0 && lots.map((l) =>
          l.n ? (
            <button key={l.key} type="button" aria-pressed={l.key === lotKey} onClick={() => setLotKey(l.key)} style={pick(l.key === lotKey)}>
              <span className="display" style={{ fontSize: 22 }}>{t(lang, 'lot', { n: l.n })}</span>
              {l.preliminary && <Prelim lang={lang} />}
              {l.sqft ? <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>{area(l.sqft, lang)}</span> : null}
              <PriceLine lang={lang} retail={l.retail} price={l.price} />
            </button>
          ) : (
            <div key={l.key} style={{ ...pick(false), cursor: 'default', borderStyle: 'dashed', background: 'transparent', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.inkSoft }}>{t(lang, 'lotPending')}</span>
            </div>
          ),
        )}
      </div>
      {ready.length === 0 && (
        <p style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 8 }}>{t(lang, 'lotsPendingNote')}</p>
      )}
      {ready.length > 0 && discountPct > 0 && (
        <p style={{ fontSize: 13, color: C.goldDeep, fontWeight: 700, marginTop: 8 }}>{t(lang, 'catDiscount', { pct: discountPct })}</p>
      )}

      <StepTitle n={2}>{t(lang, 'step2')}</StepTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <button type="button" aria-pressed={option === 'lot'} onClick={() => setOption('lot')} style={pick(option === 'lot')}>
          <span className="display" style={{ fontSize: 22 }}>{t(lang, 'lotOnly')}</span>
          <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>{t(lang, 'lotOnlyDesc')}</span>
        </button>
        {homes.map((h) => (
          <button key={h.id} type="button" aria-pressed={option === h.id} onClick={() => setOption(h.id)} style={pick(option === h.id)}>
            <span className="display" style={{ fontSize: 22 }}>{h.name}</span>
            {h.preliminary && <Prelim lang={lang} />}
            {h.type && <span style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep }}>{h.type[lang]}</span>}
            <span style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, 'bedBath', { b: h.beds, ba: h.baths })}</span>
            <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>{area(h.sqft, lang)}{h.garage ? ` · ${h.garage[lang]}` : ''}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.inkSoft, marginTop: 2 }}>{t(lang, 'build')} {t(lang, 'plusLot')}</span>
            <PriceLine lang={lang} retail={h.retail} price={h.price} />
          </button>
        ))}
      </div>

      <StepTitle n={3}>{t(lang, 'step3')}</StepTitle>
      <div style={{ background: C.ink, color: C.paper, borderRadius: 16, padding: '18px 20px', display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.goldHi }}>{project} · {lotLabel} · {optionLabel}</div>
        {retailTotal != null && retailTotal !== yourTotal && (
          <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.85 }}>{t(lang, 'retailTotal')}: {saved != null ? <s>{money(retailTotal)}</s> : money(retailTotal)}</div>
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold }}>{t(lang, 'total')}</div>
          <div className="num" style={{ fontSize: 'clamp(2.2rem, 9vw, 3rem)', lineHeight: 1, color: yourTotal != null ? C.paper : C.goldHi }}>
            {yourTotal != null ? money(yourTotal) : t(lang, 'pending')}
          </div>
        </div>
        {saved != null && (
          <div style={{ fontSize: 15, fontWeight: 700, color: C.goldHi }}>{t(lang, 'save')}: {money(saved)}</div>
        )}
        {preliminary && <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>{t(lang, 'prelimNote')}</div>}
        <a href={`${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
          style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 8, background: C.wa, color: C.waText, border: `3px solid ${C.waBorder}`, borderRadius: 999, padding: '12px 22px', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', minHeight: 48, marginTop: 4 }}>
          {t(lang, 'cta')}
        </a>
      </div>
    </div>
  );
}
