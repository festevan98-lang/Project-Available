'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import type { Opportunity } from '@/lib/lab/types';
import { APPRECIATION, FACTS, annualCost, rentalNet } from '@/lib/lab/facts';
import type { AppHome, AppLot, AppProject } from '../portal/catalogData';
import { money } from '../portal/i18n';
import { L, type LabKey } from './copy';
import { T } from './ui';

type Tab = 'home' | 'options' | 'costs' | 'buy' | 'visas';
interface Pick { p: string; kind: 'home' | 'lot'; id: string; lotKey?: string }

const rate = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`;
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const n = (v: number) => v.toLocaleString('en-US');
/** Where the visa facts on the Visas tab come from. */
const VISA_SOURCES = [
  { url: 'https://fam.state.gov/fam/09FAM/09FAM040209.html', label: { es: 'Departamento de Estado, 9 FAM 402.9: visas de comerciante e inversionista por tratado (E-1, E-2)', en: 'State Department, 9 FAM 402.9: treaty trader and investor visas (E-1, E-2)' } },
  { url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program', label: { es: 'USCIS: programa EB-5 de inversionista inmigrante', en: 'USCIS: EB-5 immigrant investor program' } },
];

const minOf = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
};

interface Resolved {
  project: AppProject;
  title: string;
  sub: string | null;
  specs: string | null;
  image: string;
  rows: { label: string; value: number | null; how: string | null }[];
  total: number | null;
  living: number | null;
  built: boolean;
  lot: AppLot | null;
  home: AppHome | null;
}

function resolve(projects: AppProject[], pick: Pick, lang: Lang): Resolved | null {
  const project = projects.find((x) => x.slug === pick.p);
  if (!project) return null;
  const lot = pick.kind === 'lot' ? project.lots.find((l) => l.key === pick.id) ?? null : project.lots.find((l) => l.key === pick.lotKey) ?? project.lots[0] ?? null;
  const home = pick.kind === 'home' ? project.homes.find((h) => h.id === pick.id) ?? null : null;
  if (pick.kind === 'home' && !home) return null;
  const rows: Resolved['rows'] = [];
  if (lot) {
    rows.push(lot.rate && lot.sqft
      ? { label: L(lang, 'lotRow', { n: lot.n, sqft: n(lot.sqft), rate: rate(lot.rate.price) }), value: lot.price, how: `${n(lot.sqft)} ft² × ${rate(lot.rate.price)} = ${lot.price != null ? money(lot.price) : '—'}` }
      : { label: L(lang, 'lotFixed', { n: lot.n }), value: lot.price, how: null });
  }
  if (home) {
    const sq = home.rateBasis === 'living' ? home.sqft : home.totalSqft ?? home.sqft;
    rows.push(home.rate && sq
      ? { label: L(lang, home.rateBasis === 'living' ? 'buildRowLiving' : 'buildRow', { sqft: n(sq), rate: rate(home.rate.price) }), value: home.price, how: `${n(sq)} ft² × ${rate(home.rate.price)} = ${home.price != null ? money(home.price) : '—'}` }
      : { label: home.name, value: home.price, how: null });
  }
  const total = rows.every((r) => r.value != null) ? rows.reduce((s, r) => s + (r.value ?? 0), 0) : null;
  return {
    project,
    title: home ? home.name : L(lang, 'lotFixed', { n: lot?.n ?? '' }).replace(/ \(.*\)$/, ''),
    sub: home ? home.sub : [lot?.address, lot?.area].filter(Boolean).join(' · ') || null,
    specs: home?.specs ?? null,
    image: home ? home.images[0]?.src ?? project.image.src : (project.lotImage ?? project.image).src,
    rows,
    total,
    living: home?.sqft ?? null,
    built: !!home,
    lot,
    home,
  };
}

export default function ClientExperience({ lang, partner, label, projects, opportunities, linkId, preview }: {
  lang: Lang;
  partner: { slug: string; name: string; whatsapp: string; contactName: string };
  label: string | null;
  projects: AppProject[];
  opportunities: Opportunity[];
  linkId: string | null;
  preview: boolean;
}) {
  const [tab, setTab] = useState<Tab>('home');
  const [project, setProject] = useState<string | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [visit, setVisit] = useState(false);

  const firstHome = useMemo<Pick | null>(() => {
    for (const p of projects) if (p.homes[0] && p.lots[0]) return { p: p.slug, kind: 'home', id: p.homes[0].id, lotKey: p.lots[0].key };
    for (const p of projects) if (p.lots[0]) return { p: p.slug, kind: 'lot', id: p.lots[0].key };
    return null;
  }, [projects]);
  const costPick = pick ?? firstHome;
  const sel = pick ? resolve(projects, pick, lang) : null;
  const costSel = costPick ? resolve(projects, costPick, lang) : null;

  const track = (type: string, detail?: string) => {
    if (!linkId || preview) return;
    fetch('/api/lab/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: linkId, type, detail }), keepalive: true }).catch(() => {});
  };
  const go = (t: Tab) => { setTab(t); track(`view:${t}`); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const choose = (x: Pick) => {
    setPick(x);
    track(`option:${`${x.p}-${x.kind}-${x.id}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 48)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const wa = (item: string) => `https://wa.me/${partner.whatsapp}?text=${encodeURIComponent(
    lang === 'es' ? `Hola ${partner.contactName}, me interesa: ${item}. ¿Podemos platicar?` : `Hi ${partner.contactName}, I'm interested in: ${item}. Can we talk?`)}`;

  const homesFrom = minOf(projects.flatMap((p) => p.homes.map((h) => (h.price != null && minOf(p.lots.map((l) => l.price)) != null ? h.price + minOf(p.lots.map((l) => l.price))! : null))));
  const lotsFrom = minOf(projects.flatMap((p) => p.lots.map((l) => l.price)));

  const tabs: [Tab, LabKey][] = [['home', 'tabHome'], ['options', 'tabOptions'], ['costs', 'tabCosts'], ['buy', 'tabBuy'], ['visas', 'tabVisas']];

  const Draft = () => (
    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: T.gold, border: `1px solid ${T.gold}`, borderRadius: 999, padding: '3px 10px' }}>{L(lang, 'draft')}</span>
  );

  let body: React.ReactNode;

  if (tab === 'home') {
    body = (
      <>
        {label && <div className="kicker" style={{ marginTop: 28 }}>{L(lang, 'preparedFor', { name: label })}</div>}
        <h1 className="serif" style={{ fontSize: 'clamp(1.9rem, 6.5vw, 2.6rem)', lineHeight: 1.15, margin: `${label ? 10 : 28}px 0 0` }}>{L(lang, 'homeTitle')}</h1>
        <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.55, margin: '12px 0 0' }}>{L(lang, 'homeLead')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {(['fact1', 'fact2', 'fact3'] as LabKey[]).map((k) => (
            <span key={k} style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: T.accentSoft, color: T.accent }}>{L(lang, k)}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          {homesFrom != null && (
            <div className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, color: T.muted }}>{L(lang, 'homesFrom')}</div>
              <div className="serif" style={{ fontSize: 26, marginTop: 2 }}>{money(homesFrom)}</div>
            </div>
          )}
          {lotsFrom != null && (
            <div className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, color: T.muted }}>{L(lang, 'lotsFrom')}</div>
              <div className="serif" style={{ fontSize: 26, marginTop: 2 }}>{money(lotsFrom)}</div>
            </div>
          )}
        </div>
        <div className="kicker" style={{ marginTop: 30 }}>{L(lang, 'essentials')}</div>
        <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
          {([['options', 'ess1'], ['costs', 'ess2'], ['buy', 'ess3'], ['visas', 'ess4']] as [Tab, LabKey][]).map(([t, k], i) => (
            <button key={t} type="button" onClick={() => go(t)}
              style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', background: '#fff', border: 'none', borderTop: i ? `1px solid ${T.line}` : 'none', fontFamily: 'inherit', fontSize: 16, color: T.ink, cursor: 'pointer' }}>
              {L(lang, k)} <span aria-hidden="true" style={{ color: T.muted }}>›</span>
            </button>
          ))}
        </div>
        <div className="kicker" style={{ marginTop: 30 }}>{L(lang, 'engineerTitle')}</div>
        <div className="card" style={{ marginTop: 10, padding: '18px 20px' }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{L(lang, 'engineerBody')}</p>
          <a href="https://pels.texas.gov/roster/pesearch.html" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 14, fontWeight: 600, color: T.accent }}>{L(lang, 'verify')} ›</a>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 24 }}>
          <a className="btn btn-primary" href={wa(lang === 'es' ? 'su selección privada' : 'your private selection')} target="_blank" rel="noopener noreferrer" onClick={() => track('cta:whatsapp', 'home')}>{L(lang, 'waPartner', { name: partner.contactName })}</a>
          <button type="button" className="btn btn-ghost" onClick={() => { setVisit(true); track('cta:visit', 'home'); }}>{L(lang, 'bookVisit')}</button>
        </div>
      </>
    );
  } else if (tab === 'options') {
    if (sel) {
      const f = FACTS[sel.project.slug];
      const item = `${sel.project.name} · ${sel.title}${sel.lot && sel.home ? ` · ${L(lang, 'chooseLot')} ${sel.lot.n}` : ''}`;
      body = (
        <div className="fade">
          <button type="button" onClick={() => setPick(null)} style={{ marginTop: 20, background: 'none', border: 'none', color: T.accent, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: 0 }}>‹ {sel.project.name}</button>
          <div className="card" style={{ marginTop: 12, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.image} alt="" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '18px 20px 20px' }}>
              <div className="serif" style={{ fontSize: 28 }}>{sel.title}</div>
              {sel.sub && <div style={{ color: T.muted, fontSize: 15, marginTop: 4 }}>{sel.sub}</div>}
              {sel.specs && <div style={{ color: T.muted, fontSize: 14, marginTop: 6, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{sel.specs}</div>}
              {sel.home?.preliminary && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: T.gold }}>{L(lang, 'plansPending')}</div>}
              {sel.home && sel.project.lots.length > 1 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 8 }}>{L(lang, 'chooseLot')}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {sel.project.lots.map((l) => {
                      const on = l.key === sel.lot?.key;
                      return (
                        <button key={l.key} type="button" onClick={() => setPick({ ...pick!, lotKey: l.key })} aria-pressed={on}
                          style={{ fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: '8px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${on ? T.accent : T.line}`, background: on ? T.accent : '#fff', color: on ? '#fff' : T.ink }}>
                          {l.n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 18, borderTop: `1px solid ${T.line}` }}>
                {sel.rows.map((r) => (
                  <div key={r.label} style={{ padding: '12px 0', borderBottom: `1px solid ${T.line}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
                      <span style={{ color: T.muted }}>{r.label}</span>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.value != null ? money(r.value) : '—'}</span>
                    </div>
                    {r.how && (
                      <button type="button" onClick={() => setOpen(open === r.label ? null : r.label)} style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, color: T.accent, cursor: 'pointer' }}>
                        {L(lang, 'how')} {open === r.label ? '−' : '+'}
                      </button>
                    )}
                    {open === r.label && r.how && <div className="fade" style={{ marginTop: 6, fontSize: 13, color: T.muted, background: T.soft, borderRadius: 10, padding: '8px 12px' }}>{r.how}</div>}
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingTop: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{L(lang, 'estimated')}</span>
                  <span className="serif" style={{ fontSize: 34 }}>{sel.total != null ? money(sel.total) : '—'}</span>
                </div>
                {sel.total != null && sel.living && (
                  <div style={{ textAlign: 'right', fontSize: 13, color: T.muted, marginTop: 2 }}>
                    {L(lang, 'perLiving', { ft: rate(Math.round(sel.total / sel.living)), m2: money(Math.round(sel.total / (sel.living * 0.092903))) })}
                  </div>
                )}
              </div>
              {sel.home?.sqft && sel.home.totalSqft && (
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginTop: 14 }}>{L(lang, 'areaNote', { living: n(sel.home.sqft) })}</p>
              )}
              {f && (
                <div style={{ marginTop: 14, background: T.accentSoft, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>{L(lang, 'marketRef')}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>{f.market[lang]}</div>
                </div>
              )}
              {sel.lot?.map && (
                <a href={sel.lot.map} target="_blank" rel="noopener noreferrer" onClick={() => track('cta:map')} style={{ display: 'inline-block', marginTop: 14, fontSize: 14, fontWeight: 600, color: T.accent }}>{L(lang, 'seeMap')} ›</a>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            <a className="btn btn-primary" href={wa(`${item}${sel.total != null ? ` (${money(sel.total)})` : ''}`)} target="_blank" rel="noopener noreferrer" onClick={() => track('cta:whatsapp', item)}>{L(lang, 'interested')}</a>
            <button type="button" className="btn btn-ghost" onClick={() => go('costs')}>{L(lang, 'costsTitle')} ›</button>
          </div>
        </div>
      );
    } else if (project) {
      const p = projects.find((x) => x.slug === project)!;
      const lotMin = minOf(p.lots.map((l) => l.price));
      body = (
        <div className="fade">
          <button type="button" onClick={() => setProject(null)} style={{ marginTop: 20, background: 'none', border: 'none', color: T.accent, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: 0 }}>‹ {L(lang, 'optionsTitle')}</button>
          <h2 className="serif" style={{ fontSize: 32, margin: '10px 0 2px' }}>{p.name}</h2>
          <div style={{ color: T.muted, fontSize: 15 }}>{p.place}</div>
          {p.homes.length > 0 && (
            <>
              <div className="kicker" style={{ marginTop: 22 }}>{L(lang, 'homeTile')}</div>
              <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
                {p.homes.map((h) => (
                  <button key={h.id} type="button" onClick={() => choose({ p: p.slug, kind: 'home', id: h.id, lotKey: p.lots[0]?.key })} className="card"
                    style={{ textAlign: 'left', padding: 0, overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit', color: T.ink }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.images[0]?.src ?? p.image.src} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }} />
                    <span style={{ display: 'block', padding: '14px 18px 16px' }}>
                      <span className="serif" style={{ display: 'block', fontSize: 22 }}>{h.name}</span>
                      {h.sub && <span style={{ display: 'block', fontSize: 14, color: T.muted, marginTop: 2 }}>{h.sub}</span>}
                      {h.sqft && <span style={{ display: 'block', fontSize: 13, color: T.muted, marginTop: 2 }}>{n(h.sqft)} ft² {lang === 'es' ? 'habitables' : 'living'}{h.preliminary ? ` · ${L(lang, 'plansPending')}` : ''}</span>}
                      {h.price != null && lotMin != null && <span style={{ display: 'block', fontSize: 16, fontWeight: 600, marginTop: 8 }}>{L(lang, 'homesFrom')} {money(h.price + lotMin)}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {p.lots.length > 0 && (
            <>
              <div className="kicker" style={{ marginTop: 24 }}>{L(lang, 'lotTile')}</div>
              <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
                {p.lots.map((l, i) => (
                  <button key={l.key} type="button" onClick={() => choose({ p: p.slug, kind: 'lot', id: l.key })}
                    style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 18px', background: '#fff', border: 'none', borderTop: i ? `1px solid ${T.line}` : 'none', fontFamily: 'inherit', color: T.ink, cursor: 'pointer' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 600 }}>{L(lang, 'chooseLot')} {l.n}</span>
                      <span style={{ display: 'block', fontSize: 13, color: T.muted, marginTop: 2 }}>{[l.address, l.area].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>{l.price != null ? money(l.price) : '—'}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      );
    } else {
      body = (
        <div className="fade">
          <h2 className="serif" style={{ fontSize: 32, margin: '28px 0 14px' }}>{L(lang, 'optionsTitle')}</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            {projects.map((p) => {
              const lotMin = minOf(p.lots.map((l) => l.price));
              const homeMin = minOf(p.homes.map((h) => (h.price != null && lotMin != null ? h.price + lotMin : null)));
              return (
                <button key={p.slug} type="button" onClick={() => { setProject(p.slug); track(`view:${p.slug}`); }} className="card"
                  style={{ textAlign: 'left', padding: 0, overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit', color: T.ink }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image.src} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }} />
                  <span style={{ display: 'block', padding: '14px 18px 16px' }}>
                    <span style={{ display: 'block', fontSize: 13, color: T.gold, fontWeight: 600 }}>{p.place}</span>
                    <span className="serif" style={{ display: 'block', fontSize: 24, marginTop: 2 }}>{p.name}</span>
                    <span style={{ display: 'block', fontSize: 14, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>
                      {homeMin != null && <>{L(lang, 'homesFrom')} {money(homeMin)}<br /></>}
                      {lotMin != null && <>{L(lang, 'lotsFrom')} {money(lotMin)}</>}
                    </span>
                  </span>
                </button>
              );
            })}
            {opportunities.map((o) => (
              <div key={o.id} className="card" style={{ overflow: 'hidden' }}>
                {o.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.image} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', background: T.soft }} />
                )}
                <div style={{ padding: '14px 18px 18px' }}>
                  <div style={{ fontSize: 13, color: T.gold, fontWeight: 600 }}>{o.place[lang]}</div>
                  <div className="serif" style={{ fontSize: 24, marginTop: 2 }}>{o.title}</div>
                  <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: '8px 0 0' }}>{o.summary[lang]}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    {o.facts.map((x) => (
                      <div key={x.label.en} style={{ background: T.soft, borderRadius: 10, padding: '8px 10px' }}>
                        <div style={{ fontSize: 12, color: T.muted }}>{x.label[lang]}</div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{typeof x.value === 'string' ? x.value : x.value[lang]}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, margin: '12px 0 0' }}>{o.fit[lang]}</p>
                  <a className="btn btn-ghost" style={{ marginTop: 12, width: '100%' }} href={wa(o.title)} target="_blank" rel="noopener noreferrer" onClick={() => track('cta:whatsapp', o.id)}>{L(lang, 'interested')}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  } else if (tab === 'costs') {
    const f = costSel ? FACTS[costSel.project.slug] : null;
    const price = costSel?.total ?? null;
    const cost = f && price != null ? annualCost(price, f, costSel!.built) : null;
    const rent = f && price != null && costSel!.built ? rentalNet(price, f) : null;
    const options: { key: string; label: string; pick: Pick }[] = projects.flatMap((p) => [
      ...p.homes.map((h) => ({ key: `${p.slug}-h-${h.id}`, label: `${p.name} · ${h.name}`, pick: { p: p.slug, kind: 'home' as const, id: h.id, lotKey: p.lots[0]?.key } })),
      ...p.lots.map((l) => ({ key: `${p.slug}-l-${l.key}`, label: `${p.name} · ${L(lang, 'chooseLot')} ${l.n}`, pick: { p: p.slug, kind: 'lot' as const, id: l.key } })),
    ]);
    const currentKey = costPick ? (costPick.kind === 'home' ? `${costPick.p}-h-${costPick.id}` : `${costPick.p}-l-${costPick.id}`) : '';
    body = (
      <div className="fade">
        <h2 className="serif" style={{ fontSize: 32, margin: '28px 0 12px' }}>{L(lang, 'costsTitle')}</h2>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: T.muted }}>
          {L(lang, 'costsFor')}
          <select value={currentKey} onChange={(e) => { const o = options.find((x) => x.key === e.target.value); if (o) setPick(o.pick); }}>
            {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
        {cost && f && price != null && (
          <div className="card" style={{ marginTop: 14, padding: '6px 18px' }}>
            {[
              [L(lang, 'costTax', { rate: pct(f.taxRate) }), cost.tax],
              ...(cost.insurance ? [[L(lang, 'costIns'), cost.insurance] as [string, number]] : []),
              [L(lang, 'costHoa'), cost.hoa],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.line}`, fontSize: 15 }}>
                <span style={{ color: T.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{money(v as number)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 0 6px' }}>
              <span style={{ fontWeight: 600 }}>{L(lang, 'costTotal')}</span><span className="serif" style={{ fontSize: 26 }}>{money(cost.total)}</span>
            </div>
            <div style={{ fontSize: 13, color: T.muted, paddingBottom: 12 }}>{L(lang, 'costMonthly', { m: money(Math.round(cost.total / 12)) })} {L(lang, 'noHomestead')}</div>
          </div>
        )}
        {rent && f && (
          <div className="card" style={{ marginTop: 14, padding: '16px 18px' }}>
            <div className="serif" style={{ fontSize: 21 }}>{L(lang, 'rentTitle')}</div>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: '8px 0 0' }}>{L(lang, 'rentBody', { low: money(f.rentLow), high: money(f.rentHigh), net: money(Math.max(0, rent.net)), pct: pct(Math.max(0, rent.yieldPct)) })}</p>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.5, margin: '8px 0 0' }}>{L(lang, 'rentHonest')}</p>
          </div>
        )}
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, marginTop: 14 }}>{APPRECIATION[lang]}</p>
        <details style={{ marginTop: 6, fontSize: 13, color: T.muted }}>
          <summary style={{ cursor: 'pointer' }}>{L(lang, 'sources')}</summary>
          <ul style={{ paddingLeft: 18 }}>
            {[...(f?.sources ?? []), APPRECIATION.source].map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
          </ul>
        </details>
      </div>
    );
  } else if (tab === 'buy') {
    const steps: [LabKey, LabKey][] = [['buy1', 'buy1d'], ['buy2', 'buy2d'], ['buy3', 'buy3d'], ['buy4', 'buy4d'], ['buy5', 'buy5d'], ['buy6', 'buy6d']];
    body = (
      <div className="fade">
        <h2 className="serif" style={{ fontSize: 32, margin: '28px 0 8px' }}>{L(lang, 'buyTitle')}</h2>
        <Draft />
        <ol style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 14 }}>
          {steps.map(([t, d], i) => (
            <li key={t} style={{ display: 'flex', gap: 14 }}>
              <span className="serif" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: T.accentSoft, color: T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{i + 1}</span>
              <span><span style={{ display: 'block', fontWeight: 600 }}>{L(lang, t)}</span><span style={{ display: 'block', color: T.muted, fontSize: 15, marginTop: 2, lineHeight: 1.5 }}>{L(lang, d)}</span></span>
            </li>
          ))}
        </ol>
        <div className="card" style={{ marginTop: 22, padding: '16px 18px', borderColor: T.gold }}>
          <div style={{ fontWeight: 600 }}>{L(lang, 'finTitle')}</div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
            {(['fin1', 'fin2', 'fin3', 'fin4', 'fin5'] as LabKey[]).map((k) => <li key={k}>{L(lang, k)}</li>)}
          </ul>
        </div>
        <div className="card" style={{ marginTop: 22, padding: '16px 18px' }}>
          <div style={{ fontWeight: 600 }}>{L(lang, 'knowTitle')}</div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, color: T.muted, lineHeight: 1.5 }}>
            {(['know1', 'know2', 'know3', 'know4', 'know5'] as LabKey[]).map((k) => <li key={k}>{L(lang, k)}</li>)}
          </ul>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="fade">
        <h2 className="serif" style={{ fontSize: 32, margin: '28px 0 8px' }}>{L(lang, 'visasTitle')}</h2>
        <Draft />
        <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: '12px 0 0' }}>{L(lang, 'visasLead')}</p>
        <div className="card" style={{ marginTop: 14, padding: '16px 18px', borderColor: T.gold }}>
          <div className="serif" style={{ fontSize: 20 }}>{L(lang, 'visaNo')}</div>
        </div>

        <div className="card" style={{ marginTop: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div className="serif" style={{ fontSize: 21 }}>{L(lang, 'vE2Title')}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, background: T.accentSoft, borderRadius: 999, padding: '3px 10px' }}>{L(lang, 'vE2Tag')}</span>
          </div>
          <div className="kicker" style={{ marginTop: 12 }}>{L(lang, 'vE2Asks')}</div>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 15, lineHeight: 1.5 }}>
            {(['vE2a', 'vE2b', 'vE2c', 'vE2d'] as LabKey[]).map((k) => <li key={k}>{L(lang, k)}</li>)}
          </ul>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: '12px 0 0', color: '#B42318' }}>{L(lang, 'vE2No')}</p>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>{L(lang, 'vE2Fit')}</p>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 0', color: T.muted }}>{L(lang, 'vE2Term')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div className="serif" style={{ fontSize: 19 }}>{L(lang, 'vFamTitle')}</div>
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>{L(lang, 'vFam1')}</p>
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: '6px 0 0', color: T.muted }}>{L(lang, 'vFam2')}</p>
          </div>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div className="serif" style={{ fontSize: 19 }}>{L(lang, 'vEb5Title')}</div>
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>{L(lang, 'vEb5')}</p>
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: '6px 0 0', color: T.muted }}>{L(lang, 'vEb5No')}</p>
          </div>
        </div>

        <div className="kicker" style={{ marginTop: 22 }}>{L(lang, 'vProsTitle')}</div>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 15, lineHeight: 1.5 }}>
          {(['vPro1', 'vPro2', 'vPro3', 'vPro4'] as LabKey[]).map((k) => <li key={k}>{L(lang, k)}</li>)}
        </ul>

        <div className="kicker" style={{ marginTop: 22 }}>{L(lang, 'vStepsTitle')}</div>
        <ol style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 12 }}>
          {(['vStep1', 'vStep2', 'vStep3', 'vStep4'] as LabKey[]).map((k, i) => (
            <li key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span className="serif" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: T.accentSoft, color: T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{i + 1}</span>
              <span style={{ fontSize: 15, lineHeight: 1.5, paddingTop: 3 }}>{L(lang, k)}</span>
            </li>
          ))}
        </ol>

        <p style={{ fontSize: 15, lineHeight: 1.6, color: T.muted, marginTop: 20 }}>{L(lang, 'visaAttorney', { partner: partner.name })}</p>
        <a className="btn btn-ghost" style={{ marginTop: 6, width: '100%' }} href={`https://wa.me/${partner.whatsapp}?text=${encodeURIComponent(L(lang, 'askAttorneyMsg', { contact: partner.contactName }))}`} target="_blank" rel="noopener noreferrer" onClick={() => track('cta:attorney')}>{L(lang, 'askAttorney')}</a>
        <details style={{ marginTop: 14, fontSize: 13, color: T.muted }}>
          <summary style={{ cursor: 'pointer' }}>{L(lang, 'vSources')}</summary>
          <ul style={{ paddingLeft: 18 }}>
            {VISA_SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label[lang]}</a></li>)}
          </ul>
        </details>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="Secciones" style={{ position: 'sticky', top: 61, zIndex: 20, background: '#fff', borderBottom: `1px solid ${T.line}`, margin: '0 -20px', padding: '0 12px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(([t, k]) => (
          <button key={t} type="button" onClick={() => { if (t === 'options') { setProject(null); setPick(null); } go(t); }} aria-current={tab === t ? 'page' : undefined}
            style={{ flexShrink: 0, padding: '13px 10px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? T.accent : 'transparent'}`, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: tab === t ? T.ink : T.muted, cursor: 'pointer' }}>
            {L(lang, k)}
          </button>
        ))}
      </nav>
      {preview && <div style={{ marginTop: 14, fontSize: 13, color: T.gold, fontWeight: 600 }}>{L(lang, 'preview')}</div>}
      {body}
      <details style={{ marginTop: 28, fontSize: 12, color: T.muted }}>
        <summary style={{ cursor: 'pointer' }}>{L(lang, 'privacyTitle')}</summary>
        <p style={{ lineHeight: 1.55 }}>{L(lang, 'clientPrivacy', { partner: partner.name })} <a href={`/lab/${partner.slug}/privacidad`} style={{ color: T.accent }}>{L(lang, 'privacyFull')}</a></p>
      </details>
      {visit && <VisitSheet lang={lang} partner={partner.slug} linkId={linkId} label={label} preview={preview} onClose={() => setVisit(false)} />}
    </div>
  );
}

function VisitSheet({ lang, partner, linkId, label, preview, onClose }: { lang: Lang; partner: string; linkId: string | null; label: string | null; preview: boolean; onClose: () => void }) {
  const [f, setF] = useState({ name: label ?? '', phone: '', date: '', people: '2', notes: '' });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const first = useRef<HTMLInputElement>(null);

  // Dialog basics: focus the first field, close on Escape, give focus back on close.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); before?.focus?.(); };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) { setState('done'); return; }
    setState('busy');
    const res = await fetch('/api/lab/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner, kind: 'visit', linkId, consent, name: f.name, phone: f.phone, interest: ['visit'], message: `${L(lang, 'visitDate')}: ${f.date || '-'} · ${L(lang, 'visitPeople')}: ${f.people} · ${f.notes}` }),
    }).catch(() => null);
    setState(res?.ok ? 'done' : 'error');
  }
  const field = { display: 'grid', gap: 4, fontSize: 13, color: T.muted } as const;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="visit-title" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="fade" style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: '18px 18px 0 0', padding: '18px 20px calc(22px + env(safe-area-inset-bottom))', display: 'grid', gap: 12, maxHeight: '90dvh', overflowY: 'auto' }}>
        <div id="visit-title" className="serif" style={{ fontSize: 24 }}>{L(lang, 'visitTitle')}</div>
        {state === 'done' ? (
          <p style={{ fontSize: 16 }}>{L(lang, 'visitThanks')}</p>
        ) : (
          <>
            <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>{L(lang, 'visitBody')}</p>
            <label style={field}>{L(lang, 'fName')}<input ref={first} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
            <label style={field}>{L(lang, 'fPhone')}<input type="tel" autoComplete="tel" placeholder="+52 81 0000 0000" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <label style={field}>{L(lang, 'visitDate')}<input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
              <label style={field}>{L(lang, 'visitPeople')}<input type="number" min={1} max={12} value={f.people} onChange={(e) => setF({ ...f, people: e.target.value })} /></label>
            </div>
            <label style={field}>{L(lang, 'fMessage')}<textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: T.muted }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0 }} />
              {L(lang, 'fConsentClient')}
            </label>
            {state === 'error' && <div role="alert" style={{ color: '#B42318', fontSize: 14 }}>{L(lang, 'fError')}</div>}
            <button type="submit" className="btn btn-primary" disabled={state === 'busy' || !consent || !f.name} style={{ opacity: state === 'busy' || !consent || !f.name ? 0.55 : 1 }}>{L(lang, 'visitSend')}</button>
          </>
        )}
        <button type="button" className="btn btn-ghost" onClick={onClose}>{lang === 'es' ? 'Cerrar' : 'Close'}</button>
      </form>
    </div>
  );
}
