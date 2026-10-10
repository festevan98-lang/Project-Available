'use client';

import { useRef, useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import { money, t } from './i18n';

export interface AppLot {
  key: string;
  n: string;
  area: string | null;
  retail: number | null;
  price: number | null;
  preliminary: boolean;
}

export interface AppHome {
  id: string;
  name: string;
  sub: string | null;
  specs: string | null;
  image: string | null;
  retail: number | null;
  price: number | null;
  preliminary: boolean;
}

export interface AppProject {
  slug: string;
  name: string;
  place: string;
  image: string;
  caption: string | null;
  lotImage: string | null;
  lotCaption: string | null;
  lots: AppLot[];
  homes: AppHome[];
}

type View = { s: 'start' } | { s: 'homes' } | { s: 'lots' } | { s: 'home'; id: string } | { s: 'lot'; key: string };

const UI = {
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  ink: '#111111',
  soft: '#6E6E73',
  line: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  gold: '#B08228',
  goldSoft: '#FBF4DF',
  shadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

const css = `
  .fx-app { font-family: ${UI.font}; color: ${UI.ink}; -webkit-font-smoothing: antialiased; }
  .fx-screen { animation: fx-in .22s ease-out; }
  @keyframes fx-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .fx-tap { transition: transform .12s ease, box-shadow .12s ease; -webkit-tap-highlight-color: transparent; }
  .fx-tap:active { transform: scale(0.98); }
  @media (prefers-reduced-motion: reduce) { .fx-screen { animation: none; } .fx-tap { transition: none; } }
`;

const sum = (a: number | null, b: number | null) => (a == null || b == null ? null : a + b);
const minOf = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
};

const Chevron = () => (
  <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M1.5 1.5l6 6-6 6" fill="none" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Badge = ({ lang }: { lang: Lang }) => (
  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: UI.soft, border: `1px solid ${UI.line}`, background: '#F5F5F7', borderRadius: 999, padding: '2px 8px' }}>
    {t(lang, 'prelim')}
  </span>
);

const card: React.CSSProperties = { background: UI.card, borderRadius: 20, boxShadow: UI.shadow, overflow: 'hidden' };
const reset: React.CSSProperties = { font: 'inherit', color: 'inherit', textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: '100%' };

function Photo({ src, alt, caption, ratio = '16 / 10' }: { src: string; alt: string; caption?: string | null; ratio?: string }) {
  return (
    <div style={{ position: 'relative', aspectRatio: ratio, background: '#E9E6DD' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {caption && (
        <span style={{ position: 'absolute', right: 10, bottom: 10, fontSize: 11, color: '#fff', background: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: '3px 9px', backdropFilter: 'blur(6px)' }}>{caption}</span>
      )}
    </div>
  );
}

function Price({ lang, price, retail, big = false }: { lang: Lang; price: number | null; retail: number | null; big?: boolean }) {
  if (price == null) return <span style={{ fontSize: big ? 22 : 17, fontWeight: 600, color: UI.soft }}>{t(lang, 'pending')}</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: big ? 22 : 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{money(price)}</span>
      {retail != null && retail > price && <s style={{ fontSize: 13, color: UI.soft }}>{money(retail)}</s>}
    </span>
  );
}

export default function InvestorApp({ lang, first, projects, wa }: { lang: Lang; first: string; projects: AppProject[]; wa: string }) {
  const [pi, setPi] = useState(0);
  const [view, setView] = useState<View>({ s: 'start' });
  const [homeLot, setHomeLot] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);

  const p = projects[pi];
  const go = (v: View) => {
    setView(v);
    requestAnimationFrame(() => {
      const el = top.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const switchProject = (i: number) => {
    setPi(i);
    setHomeLot(null);
    setView({ s: 'start' });
  };

  const minLot = minOf(p.lots.map((l) => l.price));
  const minHome = minOf(p.homes.map((h) => sum(minLot, h.price)));
  const openHomes = () => (p.homes.length === 1 ? go({ s: 'home', id: p.homes[0].id }) : go({ s: 'homes' }));
  const openLots = () => (p.lots.length === 1 ? go({ s: 'lot', key: p.lots[0].key }) : go({ s: 'lots' }));

  const back = (to: View) => (
    <button type="button" onClick={() => go(to)} className="fx-tap" style={{ ...reset, width: 'auto', color: UI.gold, fontSize: 17, fontWeight: 500, padding: '6px 0', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width="10" height="17" viewBox="0 0 10 17" aria-hidden="true"><path d="M8.5 1.5l-7 7 7 7" fill="none" stroke={UI.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {t(lang, 'back')}
    </button>
  );

  const title = (text: string) => (
    <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px' }}>{text}</h2>
  );

  function detail({ title, sub, specs, image, caption, rows, yours, list, preliminary, item, chooser }: {
    title: string; sub: string | null; specs?: string | null; image: string; caption: string | null; rows: { label: string; value: number | null }[];
    yours: number | null; list: number | null; preliminary: boolean; item: string; chooser?: React.ReactNode;
  }) {
    const saved = yours != null && list != null && list > yours ? list - yours : null;
    const msg = t(lang, 'waMsg', { project: p.name, item, price: yours != null ? money(yours) : t(lang, 'pending') });
    return (
      <>
        <div style={card}>
          <Photo src={image} alt={title} caption={caption} />
          <div style={{ padding: '18px 20px 20px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</div>
            {sub && <div style={{ fontSize: 15, color: UI.soft, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
            {specs && <div style={{ fontSize: 14, color: UI.soft, marginTop: 6, lineHeight: 1.4 }}>{specs}</div>}
            {chooser}
            <div style={{ marginTop: 18, borderTop: `1px solid ${UI.line}` }}>
              {rows.map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: `1px solid ${UI.line}`, fontSize: 16 }}>
                  <span style={{ color: UI.soft }}>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{r.value != null ? money(r.value) : t(lang, 'pending')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingTop: 16 }}>
                <span style={{ fontSize: 17, fontWeight: 600 }}>{t(lang, 'yours')}</span>
                <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>{yours != null ? money(yours) : t(lang, 'pending')}</span>
              </div>
              {list != null && list !== yours && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 6, fontSize: 15, color: UI.soft }}>
                  <span>{t(lang, 'list')}</span>
                  {saved != null ? <s>{money(list)}</s> : <span>{money(list)}</span>}
                </div>
              )}
              {saved != null && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: UI.goldSoft, borderRadius: 12, padding: '10px 14px', fontSize: 15, fontWeight: 600 }}>
                  <span>{t(lang, 'save')}</span>
                  <span style={{ color: UI.gold }}>{money(saved)}</span>
                </div>
              )}
            </div>
            {preliminary && <p style={{ fontSize: 13, color: UI.soft, marginTop: 12, lineHeight: 1.45 }}>{t(lang, 'prelimNote')}</p>}
          </div>
        </div>
        <a href={`${wa}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="fx-tap"
          style={{ display: 'block', marginTop: 16, background: UI.ink, color: '#fff', borderRadius: 16, padding: '16px 20px', textAlign: 'center', textDecoration: 'none' }}>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 600 }}>{t(lang, 'cta')}</span>
          <span style={{ display: 'block', fontSize: 13, opacity: 0.7, marginTop: 2 }}>{t(lang, 'ctaSub')}</span>
        </a>
        <p style={{ fontSize: 12, color: UI.soft, textAlign: 'center', marginTop: 10 }}>{t(lang, 'usd')}</p>
      </>
    );
  }

  let screen: React.ReactNode = null;

  if (view.s === 'start') {
    screen = (
      <>
        <div style={card}>
          <Photo src={p.image} alt={p.name} caption={p.caption} />
          <div style={{ padding: '14px 20px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: UI.gold, letterSpacing: '0.02em' }}>{p.place}</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>{p.name}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {p.homes.length > 0 && (
            <button type="button" onClick={openHomes} className="fx-tap" style={{ ...reset, ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{t(lang, 'homeTile')}</span>
                <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 4 }}>{t(lang, 'homeTileSub')}</span>
                {minHome != null && <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: UI.gold, marginTop: 10 }}>{t(lang, 'from', { price: money(minHome) })}</span>}
              </span>
              <Chevron />
            </button>
          )}
          {p.lots.length > 0 && (
            <button type="button" onClick={openLots} className="fx-tap" style={{ ...reset, ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{t(lang, 'lotTile')}</span>
                <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 4 }}>{t(lang, 'lotTileSub')}</span>
                {minLot != null && <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: UI.gold, marginTop: 10 }}>{t(lang, 'from', { price: money(minLot) })}</span>}
              </span>
              <Chevron />
            </button>
          )}
        </div>
      </>
    );
  } else if (view.s === 'homes') {
    screen = (
      <>
        {back({ s: 'start' })}
        {title(t(lang, 'choosePlan'))}
        <div style={{ display: 'grid', gap: 14 }}>
          {p.homes.map((h) => (
            <button key={h.id} type="button" onClick={() => go({ s: 'home', id: h.id })} className="fx-tap" style={{ ...reset, ...card }}>
              <Photo src={h.image ?? p.image} alt={h.name} ratio="4 / 3" />
              <span style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px 18px' }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{h.name}</span>
                    {h.preliminary && <Badge lang={lang} />}
                  </span>
                  {h.sub && <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 2 }}>{h.sub}</span>}
                  <span style={{ display: 'block', marginTop: 8 }}>
                    <Price lang={lang} price={sum(minLot, h.price)} retail={sum(minOf(p.lots.map((l) => l.retail)), h.retail)} big />
                  </span>
                </span>
                <Chevron />
              </span>
            </button>
          ))}
        </div>
      </>
    );
  } else if (view.s === 'lots') {
    screen = (
      <>
        {back({ s: 'start' })}
        {title(t(lang, 'chooseLot'))}
        <div style={card}>
          {p.lots.map((l, i) => (
            <button key={l.key} type="button" onClick={() => go({ s: 'lot', key: l.key })} className="fx-tap"
              style={{ ...reset, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderTop: i ? `1px solid ${UI.line}` : 'none' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{t(lang, 'lot', { n: l.n })}</span>
                  {l.preliminary && <Badge lang={lang} />}
                </span>
                {l.area && <span style={{ display: 'block', fontSize: 13, color: UI.soft, marginTop: 2 }}>{l.area}</span>}
              </span>
              <Price lang={lang} price={l.price} retail={l.retail} />
              <Chevron />
            </button>
          ))}
        </div>
      </>
    );
  } else if (view.s === 'home') {
    const h = p.homes.find((x) => x.id === view.id) ?? p.homes[0];
    const lot = p.lots.find((l) => l.key === homeLot) ?? p.lots[0] ?? null;
    const lotLabel = lot ? t(lang, 'lot', { n: lot.n }) : '';
    const chooser = p.lots.length > 1 && (
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: UI.soft, marginBottom: 8 }}>{t(lang, 'whichLot')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {p.lots.map((l) => {
            const on = l.key === lot?.key;
            return (
              <button key={l.key} type="button" onClick={() => setHomeLot(l.key)} aria-pressed={on} className="fx-tap"
                style={{ ...reset, width: 'auto', padding: '8px 14px', borderRadius: 999, fontSize: 15, fontWeight: 600, background: on ? UI.ink : '#F5F5F7', color: on ? '#fff' : UI.ink }}>
                {l.n}
              </button>
            );
          })}
        </div>
      </div>
    );
    screen = (
      <>
        {back(p.homes.length > 1 ? { s: 'homes' } : { s: 'start' })}
        {detail({
          title: h.name,
          sub: h.sub,
          specs: h.specs,
          image: h.image ?? p.image,
          caption: h.image ? null : p.caption,
          rows: [
            { label: lotLabel || t(lang, 'rowLot'), value: lot?.price ?? null },
            { label: /^casa\b/i.test(h.name) ? h.name : `${t(lang, 'rowHouse')} · ${h.name}`, value: h.price },
          ],
          yours: sum(lot?.price ?? null, h.price),
          list: sum(lot?.retail ?? null, h.retail),
          preliminary: h.preliminary || !!lot?.preliminary,
          item: t(lang, 'itemHome', { home: h.name, lot: lotLabel }),
          chooser: chooser,
        })}
      </>
    );
  } else {
    const l = p.lots.find((x) => x.key === view.key) ?? p.lots[0];
    screen = (
      <>
        {back(p.lots.length > 1 ? { s: 'lots' } : { s: 'start' })}
        {detail({
          title: t(lang, 'lot', { n: l.n }),
          sub: l.area,
          image: p.lotImage ?? p.image,
          caption: p.lotImage ? p.lotCaption : p.caption,
          rows: [],
          yours: l.price,
          list: l.retail,
          preliminary: l.preliminary,
          item: t(lang, 'lot', { n: l.n }),
        })}
      </>
    );
  }

  return (
    <div ref={top} className="fx-app" style={{ maxWidth: 560, margin: '0 auto', scrollMarginTop: 72 }}>
      <style>{css}</style>
      <div style={{ padding: '28px 0 18px' }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{t(lang, 'hello', { first })}</h1>
        <p style={{ fontSize: 17, color: UI.soft, margin: '4px 0 0' }}>{t(lang, 'helloSub')}</p>
      </div>
      {projects.length > 1 && (
        <div role="tablist" style={{ display: 'flex', background: 'rgba(118,118,128,0.12)', borderRadius: 10, padding: 2, marginBottom: 18 }}>
          {projects.map((x, i) => (
            <button key={x.slug} type="button" role="tab" aria-selected={i === pi} onClick={() => switchProject(i)}
              style={{ ...reset, flex: 1, textAlign: 'center', padding: '8px 6px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: i === pi ? '#fff' : 'transparent', boxShadow: i === pi ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
              {x.name}
            </button>
          ))}
        </div>
      )}
      <div key={`${pi}-${JSON.stringify(view)}`} className="fx-screen">{screen}</div>
    </div>
  );
}
