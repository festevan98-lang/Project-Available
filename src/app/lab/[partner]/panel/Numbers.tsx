'use client';

import { useMemo, useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import { FACTS } from '@/lib/lab/facts';
import { DEFAULTS, SELLING_DEFAULT, ferestMargin, proforma, type Assumptions, type Exit, type LineKey, type Unit } from '@/lib/lab/proforma';
import type { AppProject } from '../../../portal/catalogData';
import { money } from '../../../portal/i18n';
import { P, type PanelKey } from '../../panelCopy';
import { T } from '../../ui';

const GOLD_BG = '#FBF5E8';
const GOLD_LINE = 'rgba(156,122,60,0.45)';
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const n = (v: number) => v.toLocaleString('en-US');
const rate = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`;

export interface OwnerView { buildCost: number; buildCostNote: string; lotCost: Record<string, number> }

function Cell({ value, onChange, prefix, suffix, step = 1, label, wide }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number; label: string; wide?: boolean;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: GOLD_BG, border: `1px solid ${GOLD_LINE}`, borderRadius: 8, padding: '0 8px', height: 34 }}>
      {prefix && <span style={{ color: T.gold, fontSize: 14 }}>{prefix}</span>}
      <input type="number" inputMode="decimal" aria-label={label} value={Number.isFinite(value) ? value : 0} step={step} min={0}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        style={{ width: wide ? 96 : 58, border: 'none', background: 'transparent', padding: 0, fontSize: 15, fontWeight: 600, textAlign: 'right', color: T.ink, outline: 'none' }} />
      {suffix && <span style={{ color: T.gold, fontSize: 14 }}>{suffix}</span>}
    </span>
  );
}

export default function Numbers({ lang, projects, volumeMin, owner }: {
  lang: Lang;
  projects: AppProject[];
  volumeMin: number;
  owner: OwnerView | null;
}) {
  const usable = projects.filter((p) => p.lots.some((l) => l.price != null && l.retail != null) && p.homes.some((h) => h.price != null && h.retail != null));
  const [slug, setSlug] = useState(usable[0]?.slug ?? '');
  const project = usable.find((p) => p.slug === slug) ?? usable[0];
  const lots = project?.lots.filter((l) => l.price != null && l.retail != null) ?? [];
  const homes = project?.homes.filter((h) => h.price != null && h.retail != null) ?? [];
  const [lotKey, setLotKey] = useState(lots[0]?.key ?? '');
  const [homeId, setHomeId] = useState(homes[0]?.id ?? '');
  const lot = lots.find((l) => l.key === lotKey) ?? lots[0];
  const home = homes.find((h) => h.id === homeId) ?? homes[0];
  const facts = project ? FACTS[project.slug] ?? FACTS['laguna-heights'] : FACTS['laguna-heights'];

  const [a, setA] = useState<Omit<Assumptions, 'salePrice' | 'rent'>>({ ...DEFAULTS, units: Math.max(DEFAULTS.units, volumeMin) });
  const [saleOverride, setSaleOverride] = useState<Record<string, number>>({});
  const [rentOverride, setRentOverride] = useState<number | null>(null);
  const [ownerCost, setOwnerCost] = useState(owner?.buildCost ?? 0);
  const [ownerLot, setOwnerLot] = useState<Record<string, number>>(owner?.lotCost ?? {});
  const [tryRate, setTryRate] = useState<number | null>(null);
  const [showIncl, setShowIncl] = useState(false);

  const unit: Unit | null = useMemo(() => {
    if (!lot || !home) return null;
    const total = home.totalSqft ?? home.sqft ?? 0;
    const build = home.rate ?? { retail: total ? home.retail! / total : 0, price: total ? home.price! / total : 0 };
    return {
      living: home.sqft ?? total,
      total,
      lot: { retail: lot.retail!, partner: lot.price! },
      build: { retail: build.retail, partner: tryRate ?? build.price },
    };
  }, [lot, home, tryRate]);

  if (!project || !unit || !lot || !home) return null;

  const listPrice = unit.lot.retail + Math.round(unit.total * unit.build.retail);
  const marketPer = project.appraisal?.perSqft ?? null;
  const marketPrice = marketPer ? Math.round(marketPer * unit.living) : null;
  const saleKey = `${a.exit}:${project.slug}:${lot.key}:${home.id}`;
  const defaultSale = a.exit === 'market' ? marketPrice ?? listPrice : listPrice;
  const salePrice = saleOverride[saleKey] ?? defaultSale;
  const rent = rentOverride ?? facts.rentBase;
  const res = proforma(unit, { ...a, salePrice, rent }, facts, volumeMin);
  const fm = owner ? ferestMargin(unit, res, ownerCost, ownerLot[project.slug] || null) : null;

  const set = <K extends keyof typeof a>(k: K) => (v: (typeof a)[K]) => setA((s) => ({ ...s, [k]: v }));
  const setExit = (exit: Exit) => setA((s) => ({ ...s, exit, sellingPct: SELLING_DEFAULT[exit] }));

  const label = (k: LineKey) => {
    if (k === 'build') return P(lang, 'l_build', { sqft: n(unit.total), rate: rate(res.partnerTier ? unit.build.partner : unit.build.retail) });
    return P(lang, `l_${k}` as PanelKey);
  };
  const inline: Partial<Record<LineKey, React.ReactNode>> = {
    extras: <Cell label={P(lang, 'i_extras')} value={a.extras} onChange={set('extras')} prefix="$" step={500} wide />,
    contingency: <Cell label={P(lang, 'i_contingencyPct')} value={a.contingencyPct} onChange={set('contingencyPct')} suffix="%" step={0.5} />,
    closingBuy: <Cell label={P(lang, 'i_closingBuy')} value={a.closingBuy} onChange={set('closingBuy')} prefix="$" step={250} wide />,
    points: <Cell label={P(lang, 'i_pointsPct')} value={a.pointsPct} onChange={set('pointsPct')} suffix="%" step={0.25} />,
    interest: <Cell label={P(lang, 'i_ratePct')} value={a.ratePct} onChange={set('ratePct')} suffix="%" step={0.25} />,
    structure: <Cell label={P(lang, 'i_structure')} value={a.structure} onChange={set('structure')} prefix="$" step={500} wide />,
    selling: <Cell label={P(lang, 'i_sellingPct')} value={a.sellingPct} onChange={set('sellingPct')} suffix="%" step={0.5} />,
  };

  const exits: [Exit, PanelKey, PanelKey][] = [['list', 'exitList', 'exitListD'], ['market', 'exitMarket', 'exitMarketD'], ['rent', 'exitRent', 'exitRentD']];
  const select = { fontSize: 15, padding: '10px 12px' } as const;

  // A plain render helper (not a component) so inputs keep focus while typing.
  const group = (g: 'hard' | 'soft') => (
    <div style={{ marginTop: 18 }}>
      <div className="kicker">{P(lang, g === 'hard' ? 'hardTitle' : 'softTitle')}</div>
      <div className="card" style={{ marginTop: 8, padding: '2px 16px' }}>
        {res.lines.filter((l) => l.group === g).map((l, i) => (
          <div key={l.key} style={{ padding: '11px 0', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: T.muted, flex: '1 1 180px' }}>{label(l.key)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {inline[l.key]}
                <span style={{ fontWeight: 600, fontSize: 15, minWidth: 84, textAlign: 'right' }}>{money(l.value)}</span>
              </span>
            </div>
            {l.key === 'build' && (
              <>
                <button type="button" onClick={() => setShowIncl(!showIncl)} style={{ marginTop: 4, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, color: T.accent, cursor: 'pointer' }}>
                  {lang === 'es' ? '¿Qué incluye?' : 'What is included?'} {showIncl ? '−' : '+'}
                </button>
                {showIncl && <div className="fade" style={{ marginTop: 6, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'buildIncludes')}</div>}
              </>
            )}
            {l.key === 'interest' && a.financePct > 0 && <div style={{ marginTop: 4, fontSize: 12, color: T.muted }}>{P(lang, 'interestNote')}</div>}
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${T.line}`, fontWeight: 600 }}>
          <span>{lang === 'es' ? 'Subtotal' : 'Subtotal'}</span><span>{money(g === 'hard' ? res.hard : res.soft)}</span>
        </div>
      </div>
    </div>
  );

  const big = (k: PanelKey, v: string, tone?: 'good' | 'bad') => (
    <div style={{ background: T.soft, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 12, color: T.muted }}>{P(lang, k)}</div>
      <div className="serif" style={{ fontSize: 22, color: tone === 'bad' ? '#B42318' : tone === 'good' ? T.accent : T.ink }}>{v}</div>
    </div>
  );

  return (
    <div className="fade">
      <h2 className="serif" style={{ fontSize: 30, margin: '24px 0 6px' }}>{P(lang, 'nTitle')}</h2>
      <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: 0 }}>{P(lang, 'nLead')}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: T.gold, fontWeight: 600 }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: GOLD_BG, border: `1px solid ${GOLD_LINE}` }} />{P(lang, 'legend')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, fontWeight: 600, color: T.muted }}>{P(lang, 'community')}
          <select style={select} value={project.slug} onChange={(e) => { setSlug(e.target.value); setLotKey(''); setHomeId(''); }}>
            {usable.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, fontWeight: 600, color: T.muted }}>{P(lang, 'lot')}
          <select style={select} value={lot.key} onChange={(e) => setLotKey(e.target.value)}>
            {lots.map((l) => <option key={l.key} value={l.key}>{`${l.n}${l.sqft ? ` · ${n(l.sqft)} ft²` : ''}${l.address ? ` · ${l.address}` : ''}`}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, fontWeight: 600, color: T.muted }}>{P(lang, 'units')}
          <span><Cell label={P(lang, 'i_units')} value={a.units} onChange={(v) => set('units')(Math.max(1, Math.round(v)))} wide /></span>
        </label>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: res.partnerTier ? T.accent : '#B54708' }}>
        {res.partnerTier ? `✓ ${P(lang, 'tierPartner', { min: volumeMin })}` : P(lang, 'tierList', { min: volumeMin })}
      </div>

      <div className="kicker" style={{ marginTop: 20 }}>{P(lang, 'plan')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 8 }}>
        {homes.map((h) => {
          const on = h.id === home.id;
          return (
            <button key={h.id} type="button" onClick={() => setHomeId(h.id)} aria-pressed={on}
              style={{ textAlign: 'left', fontFamily: 'inherit', color: T.ink, cursor: 'pointer', borderRadius: 14, padding: 0, overflow: 'hidden', background: '#fff', border: `2px solid ${on ? T.accent : T.line}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.images[0]?.src} alt="" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
              <span style={{ display: 'block', padding: '8px 10px 10px' }}>
                <span className="serif" style={{ display: 'block', fontSize: 19 }}>{h.name}</span>
                <span style={{ display: 'block', fontSize: 12, color: T.muted }}>{h.sqft ? `${n(h.sqft)} ft² ${lang === 'es' ? 'habitables' : 'living'}` : ''}</span>
                <span style={{ display: 'block', fontSize: 12, color: h.preliminary ? '#B54708' : T.accent, marginTop: 2 }}>{h.preliminary ? P(lang, 'review') : P(lang, 'realBuilt')}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="kicker" style={{ marginTop: 22 }}>{P(lang, 'exitTitle')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
        {exits.map(([k, t, d]) => {
          const on = a.exit === k;
          return (
            <button key={k} type="button" onClick={() => setExit(k)} aria-pressed={on}
              style={{ fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', borderRadius: 12, padding: '10px 10px', border: `1px solid ${on ? T.accent : T.line}`, background: on ? T.accent : '#fff', color: on ? '#fff' : T.ink }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{P(lang, t)}</span>
              <span style={{ display: 'block', fontSize: 12, opacity: 0.8, marginTop: 2 }}>{P(lang, d)}</span>
            </button>
          );
        })}
      </div>
      <div className="card" style={{ marginTop: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{P(lang, a.exit === 'rent' ? 'i_rent' : 'i_salePrice')}</span>
        {a.exit === 'rent'
          ? <Cell label={P(lang, 'i_rent')} value={rent} onChange={(v) => setRentOverride(v)} prefix="$" step={50} wide />
          : <Cell label={P(lang, 'i_salePrice')} value={salePrice} onChange={(v) => setSaleOverride((s) => ({ ...s, [saleKey]: v }))} prefix="$" step={1000} wide />}
        <span style={{ flexBasis: '100%', fontSize: 12, color: T.muted }}>
          {a.exit === 'list' && P(lang, 'listHint', { v: money(listPrice) })}
          {a.exit === 'market' && (marketPer && marketPrice ? P(lang, 'marketHint', { rate: rate(marketPer), living: n(unit.living), v: money(marketPrice) }) : P(lang, 'noMarket'))}
          {a.exit === 'rent' && `${money(facts.rentLow)}-${money(facts.rentHigh)} · ${P(lang, 'rentNetHow')}`}
        </span>
      </div>

      {group('hard')}

      <div style={{ marginTop: 18 }}>
        <div className="kicker">{P(lang, 'financeTitle')}</div>
        <div className="card" style={{ marginTop: 8, padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'i_financePct')}<Cell label={P(lang, 'i_financePct')} value={a.financePct} onChange={(v) => set('financePct')(Math.min(90, v))} suffix="%" step={5} /></label>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'i_months')}<Cell label={P(lang, 'i_months')} value={a.months} onChange={(v) => set('months')(Math.max(1, Math.round(v)))} /></label>
          <div style={{ flexBasis: '100%', fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'financeHint')}</div>
        </div>
      </div>

      {group('soft')}

      <div className="card" style={{ marginTop: 18, padding: 16, borderColor: T.accent }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontWeight: 600 }}>{P(lang, 'totalCost')}</span>
          <span className="serif" style={{ fontSize: 28 }}>{money(res.cost)}</span>
        </div>
        {res.rent ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
            {big('rentNet', money(res.rent.net), res.rent.net >= 0 ? 'good' : 'bad')}
            {big('yieldOnCost', pct(res.rent.yieldOnCost))}
            {a.financePct > 0 && big('cashFlow', money(res.rent.cashFlow), res.rent.cashFlow >= 0 ? undefined : 'bad')}
            {big('coc', pct(a.financePct > 0 ? res.rent.cashOnCash : res.rent.yieldOnCost))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
            {big('sale', money(res.sale))}
            {big('profit', money(res.profit), res.profit >= 0 ? 'good' : 'bad')}
            {big('margin', pct(res.margin))}
            {big('roi', `${pct(res.roi)} · ${pct(res.annualRoi)} ${P(lang, 'annual')}`)}
          </div>
        )}
        <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>{P(lang, 'cash')}: {money(res.cash)}{res.loan ? ` · ${lang === 'es' ? 'Préstamo' : 'Loan'}: ${money(res.loan)}` : ''}</div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: 16, background: T.accent, color: '#fff', border: 'none' }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{P(lang, 'orderTitle', { n: res.order.units })}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 8 }}>
          <div><div style={{ fontSize: 12, opacity: 0.8 }}>{P(lang, 'orderCost')}</div><div className="serif" style={{ fontSize: 24 }}>{money(res.order.cost)}</div></div>
          <div><div style={{ fontSize: 12, opacity: 0.8 }}>{P(lang, 'orderCash')}</div><div className="serif" style={{ fontSize: 24 }}>{money(res.order.cash)}</div></div>
          {res.rent
            ? <div><div style={{ fontSize: 12, opacity: 0.8 }}>{P(lang, 'orderRent')}</div><div className="serif" style={{ fontSize: 24 }}>{money(res.order.rentNet)}</div></div>
            : <div><div style={{ fontSize: 12, opacity: 0.8 }}>{P(lang, 'orderProfit')}</div><div className="serif" style={{ fontSize: 24 }}>{money(res.order.profit)}</div></div>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: '14px 16px' }}>
        <div className="serif" style={{ fontSize: 20 }}>{P(lang, 'whereTitle')}</div>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
          <li>{P(lang, 'where1', { spread: money(res.spread), total: money(res.spread * res.order.units), n: res.order.units })}</li>
          <li>{P(lang, 'where2')}</li>
          <li style={{ color: T.muted }}>{P(lang, 'where3')}</li>
        </ul>
      </div>

      {owner && fm && (
        <div style={{ marginTop: 18, borderRadius: 16, border: '1px dashed #B42318', padding: 16, background: '#FFF8F6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B42318' }}>{P(lang, 'ownerTitle')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'ownerCost')}<Cell label={P(lang, 'ownerCost')} value={ownerCost} onChange={setOwnerCost} prefix="$" step={0.5} /></label>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'ownerLot')}<Cell label={P(lang, 'ownerLot')} value={ownerLot[project.slug] ?? 0} onChange={(v) => setOwnerLot((s) => ({ ...s, [project.slug]: v }))} prefix="$" step={500} wide /></label>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'ownerRate')}<Cell label={P(lang, 'ownerRate')} value={tryRate ?? (home.rate?.price ?? 0)} onChange={(v) => setTryRate(v)} prefix="$" step={1} /></label>
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{owner.buildCostNote}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 10 }}>
            {big('ownerMargin', money(fm.unit), fm.unit >= 0 ? 'good' : 'bad')}
            {big('ownerOrder', money(fm.order), fm.order >= 0 ? 'good' : 'bad')}
          </div>
          {(fm.build < 0 || (fm.lot != null && fm.lot < 0)) && <div style={{ marginTop: 8, color: '#B42318', fontWeight: 600, fontSize: 14 }}>{P(lang, 'ownerLoss')}</div>}
          {fm.lot == null && <div style={{ marginTop: 8, color: T.muted, fontSize: 13 }}>{P(lang, 'ownerNoLot')}</div>}
        </div>
      )}

      <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 16 }}>{P(lang, 'disclaimer')}</p>
    </div>
  );
}
