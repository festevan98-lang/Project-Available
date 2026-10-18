'use client';

import { useMemo, useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import { FACTS } from '@/lib/lab/facts';
import { SECTIONS, fullProforma, type Basis, type CostModel, type Exit, type Row, type Section } from '@/lib/lab/fullProforma';
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

/** Market reference for the sale price: median $/living sq ft of comparable new homes, per subdivision. */
export interface MarketRef { slug: string; perLiving: number; count: number; label: string }

const SECTION_KEY: Record<Section, PanelKey> = { acq: 's2', design: 's3', hard: 's4', finance: 's5', hold: 's6', sale: 's7' };

function Cell({ value, onChange, prefix, suffix, step = 1, label, wide }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number; label: string; wide?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  return (
    <span className="lx-cell" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: GOLD_BG, border: `1px solid ${GOLD_LINE}`, borderRadius: 8, padding: '0 8px', height: 34 }}>
      {prefix && <span style={{ color: T.gold, fontSize: 14 }}>{prefix}</span>}
      <input type="number" inputMode="decimal" aria-label={label} value={text ?? (Number.isFinite(value) ? value : 0)} step={step} min={0}
        onChange={(e) => { setText(e.target.value); const v = Number(e.target.value); if (e.target.value !== '' && Number.isFinite(v)) onChange(v); }}
        onBlur={() => setText(null)}
        style={{ width: wide ? 96 : 58, border: 'none', background: 'transparent', padding: 0, fontSize: 15, fontWeight: 600, textAlign: 'right', color: T.ink, outline: 'none' }} />
      {suffix && <span style={{ color: T.gold, fontSize: 14 }}>{suffix}</span>}
    </span>
  );
}

const unitFor = (b: Basis, lang: Lang): { prefix?: string; suffix?: string; step: number; wide?: boolean } =>
  b === 'pctSale' || b === 'pctLoan' ? { suffix: '%', step: 0.5 } : b === 'perMonth' ? { prefix: '$', suffix: lang === 'es' ? '/mes' : '/mo', step: 10 } : { prefix: '$', step: 50, wide: true };

export default function Numbers({ lang, projects, volumeMin, model, owner, market }: {
  lang: Lang;
  projects: AppProject[];
  volumeMin: number;
  model: CostModel;
  owner: OwnerView | null;
  market: MarketRef[];
}) {
  const usable = projects.filter((p) => p.lots.some((l) => l.price != null && l.retail != null) && p.homes.some((h) => h.rate || (h.price != null && h.retail != null)));
  const [slug, setSlug] = useState(usable[0]?.slug ?? '');
  const project = usable.find((p) => p.slug === slug) ?? usable[0];
  const lots = project?.lots.filter((l) => l.price != null && l.retail != null) ?? [];
  const homes = project?.homes.filter((h) => h.rate || (h.price != null && h.retail != null)) ?? [];
  const [lotKey, setLotKey] = useState(lots[0]?.key ?? '');
  const [homeId, setHomeId] = useState(homes[0]?.id ?? '');
  const lot = lots.find((l) => l.key === lotKey) ?? lots[0];
  const home = homes.find((h) => h.id === homeId) ?? homes[0];
  const facts = project ? FACTS[project.slug] ?? FACTS['laguna-heights'] : FACTS['laguna-heights'];

  const [units, setUnits] = useState(Math.max(15, volumeMin));
  const [exit, setExit] = useState<Exit>('clients');
  const [months, setMonths] = useState(10);
  const [buildMonths, setBuildMonths] = useState(8);
  const [loanPct, setLoanPct] = useState(0);
  const [ratePct, setRatePct] = useState(9.5);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [saleOverride, setSaleOverride] = useState<Record<string, number>>({});
  const [rentOverride, setRentOverride] = useState<Record<string, number>>({});
  const [closed, setClosed] = useState<Partial<Record<Section, boolean>>>({});
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [ownerCost, setOwnerCost] = useState(owner?.buildCost ?? 0);
  const [ownerLot, setOwnerLot] = useState<Record<string, number>>(owner?.lotCost ?? {});
  const [tryRate, setTryRate] = useState<number | null>(null);

  const homeIn = useMemo(() => {
    if (!lot || !home) return null;
    const total = home.totalSqft ?? home.sqft ?? 0;
    const r = home.rate ?? { retail: total ? home.retail! / total : 0, price: total ? home.price! / total : 0 };
    return {
      living: home.sqft ?? total,
      total,
      lot: { list: lot.retail!, partner: lot.price! },
      rate: { list: r.retail, partner: tryRate ?? r.price },
    };
  }, [lot, home, tryRate]);

  if (!project || !homeIn || !lot || !home) return null;

  const listPrice = homeIn.lot.list + Math.round(homeIn.total * homeIn.rate.list);
  const mkt = market.find((m) => m.slug === project.slug) ?? null;
  const marketPrice = mkt ? Math.round(mkt.perLiving * homeIn.living) : project.appraisal ? Math.round(project.appraisal.perSqft * homeIn.living) : null;
  const saleKey = `${exit}:${project.slug}:${lot.key}:${home.id}`;
  const salePrice = saleOverride[saleKey] ?? (exit === 'market' ? marketPrice ?? listPrice : listPrice);
  const rent = rentOverride[project.slug] ?? facts.rentBase;
  const exitOverrides = Object.fromEntries(Object.entries(overrides).filter(([k]) => k.startsWith(`${exit}:`)).map(([k, v]) => [k.slice(exit.length + 1), v]));
  const res = fullProforma(model, homeIn, { units, exit, salePrice, rent, months, buildMonths, loanPct, ratePct, overrides: exitOverrides }, facts, volumeMin);
  const lotCost = ownerLot[project.slug] || null;
  const ferest = owner ? { build: res.contract - Math.round(homeIn.total * ownerCost), lot: lotCost != null ? res.lotPrice - lotCost : null } : null;

  const contractRows = res.rows.filter((r) => r.inContract);
  const setOverride = (key: string, v: number) => setOverrides((s) => ({ ...s, [`${exit}:${key}`]: v }));

  const basisHint = (r: Row): string | null => {
    if (r.margin) return null;
    if (r.basis === 'perTotal') return `${n(homeIn.total)} ft² × ${rate(Math.round(r.value / homeIn.total * 100) / 100)}`;
    if (r.key === 'lot') return lot.sqft ? `${n(lot.sqft)} ft²${res.partnerTier ? ` · ${P(lang, 'partnerPrice')}` : ''}` : null;
    if (r.key === 'taxHold') return `${(r.amount).toFixed(2)}% · ${months} ${P(lang, 'monthsShort')}`;
    if (r.key === 'interest') return `${pct(loanPct / 100)} ${P(lang, 'financedShort')} · ${ratePct}%`;
    return null;
  };

  const row = (r: Row, i: number) => {
    const u = unitFor(r.basis, lang);
    const editable = r.editable && !r.margin;
    return (
      <div key={r.key} style={{ padding: '10px 0', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: r.margin ? T.ink : T.muted, fontWeight: r.margin ? 600 : 400, flex: '1 1 200px' }}>
            {r.label[lang]}
            {basisHint(r) && <span style={{ display: 'block', fontSize: 12, color: T.muted, opacity: 0.85 }}>{basisHint(r)}</span>}
            {r.note && (
              <button type="button" onClick={() => setOpenNote(openNote === r.key ? null : r.key)} aria-expanded={openNote === r.key}
                style={{ background: 'none', border: 'none', padding: 0, marginTop: 2, fontFamily: 'inherit', fontSize: 12, color: T.accent, cursor: 'pointer' }}>
                {openNote === r.key ? '−' : '+'} {P(lang, 'source')}
              </button>
            )}
            {openNote === r.key && r.note && <span className="fade" style={{ display: 'block', fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.45 }}>{r.note[lang]}</span>}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {editable && <Cell label={r.label[lang]} value={r.amount} onChange={(v) => setOverride(r.key, v)} {...u} />}
            <span style={{ fontWeight: 600, fontSize: 15, minWidth: 84, textAlign: 'right', color: r.margin ? T.accent : T.ink }}>{money(r.value)}</span>
          </span>
        </div>
      </div>
    );
  };

  // Plain render helper (not a component) so inputs keep focus while typing.
  const section = (s: Section) => {
    const rows = res.rows.filter((r) => r.section === s);
    const isClosed = !!closed[s];
    const empty = s === 'finance' && res.loan === 0;
    return (
      <div key={s} style={{ marginTop: 16 }}>
        <button type="button" onClick={() => setClosed((c) => ({ ...c, [s]: !c[s] }))} aria-expanded={!isClosed}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', cursor: 'pointer', color: T.ink }}>
          <span className="kicker" style={{ textAlign: 'left' }}>{P(lang, SECTION_KEY[s])} {isClosed ? '+' : '−'}</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{money(res.bySection[s])}</span>
        </button>
        {(s === 'design' || s === 'hard') && <div style={{ fontSize: 12, color: T.accent, marginTop: 4 }}>{P(lang, 'inContract')}</div>}
        {!isClosed && (
          <div className="card" style={{ marginTop: 8, padding: '2px 16px' }}>
            {empty ? <div style={{ padding: '12px 0', fontSize: 14, color: T.muted }}>{P(lang, 'cashNoLoan')}</div> : rows.map(row)}
          </div>
        )}
      </div>
    );
  };

  const big = (k: PanelKey, v: string, tone?: 'good' | 'bad', sub?: string) => (
    <div style={{ background: T.soft, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 12, color: T.muted }}>{P(lang, k)}</div>
      <div className="serif" style={{ fontSize: 22, color: tone === 'bad' ? '#B42318' : tone === 'good' ? T.accent : T.ink }}>{v}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>}
    </div>
  );

  function download() {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines: (string | number)[][] = [
      [P(lang, 'csvItem'), P(lang, 'csvSection'), P(lang, 'csvAmount')],
      [P(lang, 'community'), '', project!.name],
      [P(lang, 'lot'), '', `${lot!.n}${lot!.sqft ? ` (${lot!.sqft} ft²)` : ''}`],
      [P(lang, 'plan'), '', `${home!.name} (${homeIn!.living} / ${homeIn!.total} ft²)`],
      ...res.rows.map((r) => [r.label[lang], P(lang, SECTION_KEY[r.section]), r.value]),
      [P(lang, 'totalCost'), '', res.cost],
      [P(lang, 'sale'), '', res.sale],
      [P(lang, 'profit'), '', res.profit],
    ];
    const blob = new Blob(['﻿' + lines.map((l) => l.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `proforma-${project!.slug}-${home!.id}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const exits: [Exit, PanelKey, PanelKey][] = [['clients', 'exitList', 'exitListD'], ['market', 'exitMarket', 'exitMarketD'], ['rent', 'exitRent', 'exitRentD']];
  const select = { fontSize: 15, padding: '10px 12px' } as const;
  const discount = homeIn.lot.list ? 1 - homeIn.lot.partner / homeIn.lot.list : 0;

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', margin: '24px 0 6px' }}>
        <h2 className="serif" style={{ fontSize: 30, margin: 0 }}>{P(lang, 'nTitle')}</h2>
        <button type="button" className="btn btn-ghost" style={{ minHeight: 38, fontSize: 13, padding: '0 12px' }} onClick={download}>{P(lang, 'download')}</button>
      </div>
      <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: 0 }}>{P(lang, 'nLead')}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: T.gold, fontWeight: 600 }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: GOLD_BG, border: `1px solid ${GOLD_LINE}` }} />{P(lang, 'legend')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, fontWeight: 600, color: T.muted }}>{P(lang, 'community')}
          <select style={select} value={project.slug} onChange={(e) => { setSlug(e.target.value); setLotKey(''); setHomeId(''); setTryRate(null); }}>
            {usable.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, fontWeight: 600, color: T.muted }}>{P(lang, 'lot')}
          <select style={select} value={lot.key} onChange={(e) => setLotKey(e.target.value)}>
            {lots.map((l) => <option key={l.key} value={l.key}>{`${l.n}${l.sqft ? ` · ${n(l.sqft)} ft²` : ''}${l.address ? ` · ${l.address}` : ''}`}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, fontWeight: 600, color: T.muted }}>{P(lang, 'units')}
          <span><Cell label={P(lang, 'i_units')} value={units} onChange={(v) => setUnits(Math.max(1, Math.round(v)))} wide /></span>
        </label>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: res.partnerTier ? T.accent : '#B54708' }}>
        {res.partnerTier ? `✓ ${P(lang, 'tierPartner', { min: volumeMin })}` : P(lang, 'tierList', { min: volumeMin })}
      </div>

      {homes.length > 1 && (
        <>
          <div className="kicker" style={{ marginTop: 20 }}>{P(lang, 'plan')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 8 }}>
            {homes.map((h) => {
              const on = h.id === home.id;
              return (
                <button key={h.id} type="button" onClick={() => { setHomeId(h.id); setTryRate(null); }} aria-pressed={on}
                  style={{ textAlign: 'left', fontFamily: 'inherit', color: T.ink, cursor: 'pointer', borderRadius: 14, padding: 0, overflow: 'hidden', background: '#fff', border: `2px solid ${on ? T.accent : T.line}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.images[0]?.src} alt="" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
                  <span style={{ display: 'block', padding: '8px 10px 10px' }}>
                    <span className="serif" style={{ display: 'block', fontSize: 19 }}>{h.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: T.muted }}>{h.sqft ? `${n(h.sqft)} ft² ${lang === 'es' ? 'habitables' : 'living'}` : ''}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="kicker" style={{ marginTop: 22 }}>{P(lang, 's1')}</div>
      <div className="card" style={{ marginTop: 8, padding: '10px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, fontSize: 14 }}>
        <div><div style={{ color: T.muted, fontSize: 12 }}>{P(lang, 'plan')}</div><b>{home.name}</b></div>
        <div><div style={{ color: T.muted, fontSize: 12 }}>{P(lang, 'areaLiving')}</div><b>{n(homeIn.living)} ft²</b> <span style={{ color: T.muted }}>({n(Math.round(homeIn.living / 10.764))} m²)</span></div>
        <div><div style={{ color: T.muted, fontSize: 12 }}>{P(lang, 'areaTotal')}</div><b>{n(homeIn.total)} ft²</b></div>
        <div><div style={{ color: T.muted, fontSize: 12 }}>{P(lang, 'lotList')}</div><b>{money(homeIn.lot.list)}</b></div>
        <div><div style={{ color: T.muted, fontSize: 12 }}>{P(lang, 'volumeDiscount')}</div><b>{res.partnerTier ? pct(discount) : '0%'}</b></div>
        <div><div style={{ color: T.muted, fontSize: 12 }}>{P(lang, 'contractRate')}</div><b>{rate(res.partnerTier ? homeIn.rate.partner : homeIn.rate.list)}/ft²</b></div>
      </div>

      <div className="kicker" style={{ marginTop: 22 }}>{P(lang, 'exitTitle')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
        {exits.map(([k, t, d]) => {
          const on = exit === k;
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
        <span style={{ fontSize: 14, fontWeight: 600 }}>{P(lang, exit === 'rent' ? 'i_rent' : 'i_salePrice')}</span>
        {exit === 'rent'
          ? <Cell label={P(lang, 'i_rent')} value={rent} onChange={(v) => setRentOverride((s) => ({ ...s, [project.slug]: v }))} prefix="$" step={50} wide />
          : <Cell label={P(lang, 'i_salePrice')} value={salePrice} onChange={(v) => setSaleOverride((s) => ({ ...s, [saleKey]: v }))} prefix="$" step={1000} wide />}
        <span style={{ flexBasis: '100%', fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          {exit === 'clients' && P(lang, 'listHint', { v: money(listPrice) })}
          {exit === 'market' && (marketPrice
            ? P(lang, 'marketHint', { rate: rate(Math.round(marketPrice / homeIn.living)), living: n(homeIn.living), v: money(marketPrice) }) + (mkt ? ` · ${mkt.label}` : '')
            : P(lang, 'noMarket'))}
          {exit === 'rent' && `${money(facts.rentLow)}-${money(facts.rentHigh)} · ${P(lang, 'rentNetHow')}`}
          {exit !== 'rent' && ` · ${rate(Math.round(salePrice / homeIn.living))}/ft² ${lang === 'es' ? 'habitable' : 'living'}`}
        </span>
      </div>

      <div className="card" style={{ marginTop: 10, padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'i_financePct')}<Cell label={P(lang, 'i_financePct')} value={loanPct} onChange={(v) => setLoanPct(Math.min(90, v))} suffix="%" step={5} /></label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'i_ratePct')}<Cell label={P(lang, 'i_ratePct')} value={ratePct} onChange={setRatePct} suffix="%" step={0.25} /></label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'i_buildMonths')}<Cell label={P(lang, 'i_buildMonths')} value={buildMonths} onChange={(v) => setBuildMonths(Math.max(1, Math.round(v)))} /></label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'i_months')}<Cell label={P(lang, 'i_months')} value={months} onChange={(v) => setMonths(Math.max(1, Math.round(v)))} /></label>
        <div style={{ flexBasis: '100%', fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'financeHint')}</div>
      </div>

      {SECTIONS.map(section)}

      <div style={{ marginTop: 12, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
        {P(lang, 'contractLine', { v: money(res.contract), rate: rate(res.partnerTier ? homeIn.rate.partner : homeIn.rate.list), sqft: n(homeIn.total) })}
        {model.showBuilderMargin && ` ${P(lang, 'contractSplit', { cost: money(res.contractCost), margin: money(res.builderMargin), pct: pct(res.contract ? res.builderMargin / res.contract : 0) })}`}
        {contractRows.length > 0 && ` ${model.source[lang]}`}
      </div>

      <div className="card" style={{ marginTop: 18, padding: 16, borderColor: T.accent }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontWeight: 600 }}>{P(lang, 'totalCost')}</span>
          <span className="serif" style={{ fontSize: 28 }}>{money(res.cost)}</span>
        </div>
        {res.rent ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
            {big('rentNet', money(res.rent.net), res.rent.net >= 0 ? 'good' : 'bad')}
            {big('yieldOnCost', pct(res.rent.yieldOnCost))}
            {loanPct > 0 && big('cashFlow', money(res.rent.cashFlow), res.rent.cashFlow >= 0 ? undefined : 'bad')}
            {big('coc', pct(loanPct > 0 ? res.rent.cashOnCash : res.rent.yieldOnCost))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
            {big('sale', money(res.sale))}
            {big('profit', money(res.profit), res.profit >= 0 ? 'good' : 'bad', pct(res.margin))}
            {big('roi', pct(res.roi), undefined, loanPct > 0 ? `${P(lang, 'roiCash')} ${pct(res.roiCash)}` : undefined)}
            {big('annual', pct(res.annualRoi))}
            {big('breakEven', money(res.breakEven), res.sale >= res.breakEven ? 'good' : 'bad', `${rate(Math.round(res.breakEven / homeIn.living))}/ft²`)}
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

      <div className="kicker" style={{ marginTop: 22 }}>{P(lang, 'drawsTitle')}</div>
      <div className="card" style={{ marginTop: 8, padding: '2px 16px' }}>
        {res.draws.map((d, i) => (
          <div key={d.n} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: i ? `1px solid ${T.line}` : 'none', fontSize: 14 }}>
            <span>
              <b>{d.n}. {d.label[lang]}</b>
              <span style={{ display: 'block', fontSize: 12, color: T.muted }}>{P(lang, 'releasedBy')} {d.inspection[lang]}</span>
            </span>
            <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <b>{money(d.amount)}</b>
              <span style={{ display: 'block', fontSize: 12, color: T.muted }}>{pct(d.pct)}</span>
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: T.muted, margin: '6px 0 0' }}>{P(lang, 'drawsNote')}</p>

      <div className="card" style={{ marginTop: 12, padding: '14px 16px' }}>
        <div className="serif" style={{ fontSize: 20 }}>{P(lang, 'whereTitle')}</div>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
          <li>{P(lang, 'where1', { spread: money(listPrice - res.lotPrice - res.contract), total: money((listPrice - res.lotPrice - res.contract) * res.order.units), n: res.order.units })}</li>
          <li>{P(lang, 'where2', { profit: money(res.profit) })}</li>
          <li style={{ color: T.muted }}>{P(lang, 'where3')}</li>
        </ul>
      </div>

      {owner && ferest && (
        <div style={{ marginTop: 18, borderRadius: 16, border: '1px dashed #B42318', padding: 16, background: '#FFF8F6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B42318' }}>{P(lang, 'ownerTitle')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'ownerCost')}<Cell label={P(lang, 'ownerCost')} value={ownerCost} onChange={setOwnerCost} prefix="$" step={0.5} /></label>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'ownerLot')}<Cell label={P(lang, 'ownerLot')} value={ownerLot[project.slug] ?? 0} onChange={(v) => setOwnerLot((s) => ({ ...s, [project.slug]: v }))} prefix="$" step={500} wide /></label>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, color: T.muted }}>{P(lang, 'ownerRate')}<Cell label={P(lang, 'ownerRate')} value={homeIn.rate.partner} onChange={(v) => setTryRate(v)} prefix="$" step={1} /></label>
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{owner.buildCostNote}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 10 }}>
            {big('ownerMargin', money(ferest.build + (ferest.lot ?? 0)), ferest.build + (ferest.lot ?? 0) >= 0 ? 'good' : 'bad')}
            {big('ownerOrder', money((ferest.build + (ferest.lot ?? 0)) * res.order.units), ferest.build >= 0 ? 'good' : 'bad')}
          </div>
          {(ferest.build < 0 || (ferest.lot != null && ferest.lot < 0)) && <div style={{ marginTop: 8, color: '#B42318', fontWeight: 600, fontSize: 14 }}>{P(lang, 'ownerLoss')}</div>}
          {ferest.lot == null && <div style={{ marginTop: 8, color: T.muted, fontSize: 13 }}>{P(lang, 'ownerNoLot')}</div>}
        </div>
      )}

      <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 16 }}>{P(lang, 'disclaimer')}</p>
    </div>
  );
}
