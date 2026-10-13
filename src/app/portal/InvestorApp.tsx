'use client';

import { useRef, useState } from 'react';
import type { Lang, Rate } from '@/lib/portal/types';
import type { ShareTarget } from '@/lib/portal/share';
import type { AppImage, AppProject } from './catalogData';
import { money, t } from './i18n';

type View =
  | { s: 'projects' } | { s: 'project' } | { s: 'homes' } | { s: 'lots' }
  | { s: 'home'; id: string } | { s: 'lot'; key: string };

const UI = {
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  ink: '#111111',
  soft: '#6E6E73',
  line: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  gold: '#B08228',
  goldSoft: '#FBF4DF',
  green: '#1E7A46',
  greenSoft: '#E9F6EE',
  shadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

const css = `
  .fx-app { font-family: ${UI.font}; color: ${UI.ink}; -webkit-font-smoothing: antialiased; }
  .fx-screen { animation: fx-in .22s ease-out; }
  @keyframes fx-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .fx-tap { transition: transform .12s ease; -webkit-tap-highlight-color: transparent; }
  .fx-tap:active { transform: scale(0.98); }
  .fx-gallery { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .fx-gallery::-webkit-scrollbar { display: none; }
  .fx-gallery > div { flex: 0 0 100%; scroll-snap-align: start; }
  .fx-sheet { animation: fx-up .24s ease-out; }
  @keyframes fx-up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .fx-screen, .fx-sheet { animation: none; } .fx-tap { transition: none; } }
`;

const sum = (a: number | null, b: number | null) => (a == null || b == null ? null : a + b);
const minOf = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
};
const rate = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`;

const card: React.CSSProperties = { background: UI.card, borderRadius: 20, boxShadow: UI.shadow, overflow: 'hidden' };
const reset: React.CSSProperties = { font: 'inherit', color: 'inherit', textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: '100%' };

const Chevron = () => (
  <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M1.5 1.5l6 6-6 6" fill="none" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
    <path d="M8 11V1.5M4.5 4.5L8 1l3.5 3.5M3 7.5H2v9h12v-9h-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Badge = ({ lang }: { lang: Lang }) => (
  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: UI.soft, border: `1px solid ${UI.line}`, background: '#F5F5F7', borderRadius: 999, padding: '2px 8px' }}>
    {t(lang, 'prelim')}
  </span>
);

function Photo({ img, alt, ratio = '16 / 10' }: { img: AppImage; alt: string; ratio?: string }) {
  return (
    <div style={{ position: 'relative', aspectRatio: ratio, background: '#E9E6DD' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.src} alt={alt} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {img.caption && (
        <span style={{ position: 'absolute', right: 10, bottom: 10, fontSize: 11, color: '#fff', background: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: '3px 9px', backdropFilter: 'blur(6px)' }}>{img.caption}</span>
      )}
    </div>
  );
}

function Gallery({ images, alt }: { images: AppImage[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 1) return <Photo img={images[0]} alt={alt} ratio="4 / 3" />;
  return (
    <div style={{ position: 'relative' }}>
      <div className="fx-gallery" onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {images.map((im, k) => <div key={im.src + k}><Photo img={im} alt={`${alt} ${k + 1}`} ratio="4 / 3" /></div>)}
      </div>
      <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: '3px 9px' }}>
        {i + 1} / {images.length}
      </span>
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

export interface AppProps {
  lang: Lang;
  projects: AppProject[];
  mode: 'investor' | 'guest';
  hello: string;
  helloSub: string;
  brand: { name: string; logo: string | null } | null;
  /** Who the "I'm interested" button messages. */
  contact: { wa: string; name: string };
  initial?: ShareTarget | null;
}

export default function InvestorApp({ lang, projects, mode, hello, helloSub, brand, contact, initial }: AppProps) {
  const start = (() => {
    const i = Math.max(0, projects.findIndex((p) => p.slug === initial?.p));
    const p = projects[i];
    let v: View = projects.length > 1 && !initial?.p ? { s: 'projects' } : { s: 'project' };
    if (initial?.k === 'home' && p?.homes.some((h) => h.id === initial.id)) v = { s: 'home', id: initial.id! };
    if (initial?.k === 'lot') {
      const lot = p?.lots.find((l) => l.n === initial.id);
      if (lot) v = { s: 'lot', key: lot.key };
    }
    return { i, v };
  })();

  const [pi, setPi] = useState(start.i);
  const [view, setView] = useState<View>(start.v);
  const [homeLot, setHomeLot] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ url: string | null; error: boolean; copied: boolean } | null>(null);
  const top = useRef<HTMLDivElement>(null);

  const p = projects[pi];
  const go = (v: View, project = pi) => {
    setPi(project);
    setView(v);
    requestAnimationFrame(() => {
      const el = top.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  async function openShare(target: ShareTarget) {
    setSheet({ url: null, error: false, copied: false });
    try {
      const res = await fetch('/api/portal/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target }) });
      const data = await res.json();
      setSheet({ url: res.ok && data.url ? data.url : null, error: !res.ok || !data.url, copied: false });
    } catch {
      setSheet({ url: null, error: true, copied: false });
    }
  }

  const shareButton = (target: ShareTarget, label = t(lang, 'share')) => mode === 'investor' && (
    <button type="button" onClick={() => openShare(target)} className="fx-tap"
      style={{ ...reset, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, padding: '14px 20px', borderRadius: 16, border: `1.5px solid ${UI.line}`, background: UI.card, fontSize: 16, fontWeight: 600 }}>
      <ShareIcon /> {label}
    </button>
  );

  const back = (to: View) => (
    <button type="button" onClick={() => go(to)} className="fx-tap" style={{ ...reset, width: 'auto', color: UI.gold, fontSize: 17, fontWeight: 500, padding: '6px 0', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width="10" height="17" viewBox="0 0 10 17" aria-hidden="true"><path d="M8.5 1.5l-7 7 7 7" fill="none" stroke={UI.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {t(lang, 'back')}
    </button>
  );

  const heading = (text: string) => <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px' }}>{text}</h2>;

  const mapRow = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="fx-tap"
      style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: '12px 14px', borderRadius: 14, background: '#F5F5F7', color: UI.ink, textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
      <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true"><path d="M9 21s7-7.1 7-12A7 7 0 0 0 2 9c0 4.9 7 12 7 12z" fill={UI.gold} /><circle cx="9" cy="9" r="2.6" fill="#fff" /></svg>
      <span style={{ flex: 1 }}>{label}</span>
      <Chevron />
    </a>
  );

  const minLot = (x: AppProject) => minOf(x.lots.map((l) => l.price));
  const minHome = (x: AppProject) => minOf(x.homes.map((h) => sum(minLot(x), h.price)));
  const backFromProject: View | null = projects.length > 1 ? { s: 'projects' } : null;

  function detail(o: {
    title: string; sub: string | null; specs?: string | null; media: React.ReactNode;
    rows: { label: string; value: number | null }[]; yours: number | null; list: number | null;
    rateLine?: string | null; value?: { est: number; line: string; note: string } | null;
    preliminary: boolean; item: string; chooser?: React.ReactNode; map?: string | null; target: ShareTarget;
  }) {
    const saved = o.yours != null && o.list != null && o.list > o.yours ? o.list - o.yours : null;
    const equity = o.value && o.yours != null ? o.value.est - o.yours : null;
    const msg = t(lang, 'waMsg', { name: contact.name, project: p.name, item: o.item, price: o.yours != null ? money(o.yours) : t(lang, 'pending') });
    return (
      <>
        <div style={card}>
          {o.media}
          <div style={{ padding: '18px 20px 20px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{o.title}</div>
            {o.sub && <div style={{ fontSize: 15, color: UI.soft, marginTop: 4, lineHeight: 1.4 }}>{o.sub}</div>}
            {o.specs && <div style={{ fontSize: 14, color: UI.soft, marginTop: 6, lineHeight: 1.4 }}>{o.specs}</div>}
            {o.chooser}
            <div style={{ marginTop: 18, borderTop: `1px solid ${UI.line}` }}>
              {o.rows.map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: `1px solid ${UI.line}`, fontSize: 15 }}>
                  <span style={{ color: UI.soft }}>{r.label}</span>
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.value != null ? money(r.value) : t(lang, 'pending')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingTop: 16 }}>
                <span style={{ fontSize: 17, fontWeight: 600 }}>{t(lang, 'yours')}</span>
                <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>{o.yours != null ? money(o.yours) : t(lang, 'pending')}</span>
              </div>
              {o.rateLine && <div style={{ textAlign: 'right', fontSize: 14, color: UI.soft, marginTop: 2 }}>{o.rateLine}</div>}
              {o.list != null && o.list !== o.yours && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 8, fontSize: 15, color: UI.soft }}>
                  <span>{t(lang, 'list')}</span>
                  {saved != null ? <s>{money(o.list)}</s> : <span>{money(o.list)}</span>}
                </div>
              )}
              {saved != null && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: UI.goldSoft, borderRadius: 12, padding: '10px 14px', fontSize: 15, fontWeight: 600 }}>
                  <span>{t(lang, 'save')}</span>
                  <span style={{ color: UI.gold }}>{money(saved)}</span>
                </div>
              )}
            </div>
            {o.value && equity != null && equity > 0 && (
              <div style={{ marginTop: 14, background: UI.greenSoft, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15, fontWeight: 600 }}>
                  <span>{t(lang, 'valueTitle')}</span>
                  <span>{money(o.value.est)}</span>
                </div>
                <div style={{ fontSize: 13, color: UI.soft, marginTop: 2 }}>{o.value.line}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, fontSize: 17, fontWeight: 700, color: UI.green }}>
                  <span>{t(lang, 'equity')}</span>
                  <span>+{money(equity)}</span>
                </div>
                <div style={{ fontSize: 12, color: UI.soft, marginTop: 6, lineHeight: 1.4 }}>{o.value.note} {t(lang, 'estimate')}</div>
              </div>
            )}
            {o.map && mapRow(o.map, t(lang, 'lotMap'))}
            {o.preliminary && <p style={{ fontSize: 13, color: UI.soft, marginTop: 12, lineHeight: 1.45 }}>{t(lang, 'prelimNote')}</p>}
          </div>
        </div>
        <a href={`${contact.wa}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="fx-tap"
          style={{ display: 'block', marginTop: 16, background: UI.ink, color: '#fff', borderRadius: 16, padding: '16px 20px', textAlign: 'center', textDecoration: 'none' }}>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 600 }}>{t(lang, 'cta')}</span>
          <span style={{ display: 'block', fontSize: 13, opacity: 0.7, marginTop: 2 }}>{t(lang, 'ctaSub', { name: contact.name })}</span>
        </a>
        {shareButton(o.target)}
        <p style={{ fontSize: 12, color: UI.soft, textAlign: 'center', marginTop: 12 }}>{t(lang, 'usd')}</p>
      </>
    );
  }

  let screen: React.ReactNode;

  if (view.s === 'projects') {
    screen = (
      <div style={{ display: 'grid', gap: 14 }}>
        {projects.map((x, i) => {
          const h = minHome(x);
          const l = minLot(x);
          return (
            <button key={x.slug} type="button" onClick={() => go({ s: 'project' }, i)} className="fx-tap" style={{ ...reset, ...card }}>
              <Photo img={x.image} alt={x.name} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px 18px' }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: UI.gold }}>{x.place}</span>
                  <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>{x.name}</span>
                  <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 6, lineHeight: 1.45 }}>
                    {h != null && <>{t(lang, 'homesFrom', { price: money(h) })}<br /></>}
                    {l != null && t(lang, 'lotsFrom', { price: money(l) })}
                  </span>
                </span>
                <Chevron />
              </span>
            </button>
          );
        })}
        {shareButton({}, t(lang, 'shareAll'))}
      </div>
    );
  } else if (view.s === 'project') {
    const h = minHome(p);
    const l = minLot(p);
    screen = (
      <>
        {backFromProject && back(backFromProject)}
        <div style={card}>
          <Photo img={p.image} alt={p.name} />
          <div style={{ padding: '14px 20px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: UI.gold }}>{p.place}</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>{p.name}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {p.homes.length > 0 && (
            <button type="button" onClick={() => (p.homes.length === 1 ? go({ s: 'home', id: p.homes[0].id }) : go({ s: 'homes' }))} className="fx-tap"
              style={{ ...reset, ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{t(lang, 'homeTile')}</span>
                <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 4 }}>{t(lang, 'homeTileSub')}</span>
                {h != null && <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: UI.gold, marginTop: 10 }}>{t(lang, 'from', { price: money(h) })}</span>}
              </span>
              <Chevron />
            </button>
          )}
          {p.lots.length > 0 && (
            <button type="button" onClick={() => (p.lots.length === 1 ? go({ s: 'lot', key: p.lots[0].key }) : go({ s: 'lots' }))} className="fx-tap"
              style={{ ...reset, ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{t(lang, 'lotTile')}</span>
                <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 4 }}>{t(lang, 'lotTileSub')}</span>
                {l != null && <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: UI.gold, marginTop: 10 }}>{t(lang, 'from', { price: money(l) })}</span>}
              </span>
              <Chevron />
            </button>
          )}
          {p.map && (
            <a href={p.map} target="_blank" rel="noopener noreferrer" className="fx-tap" style={{ ...card, display: 'block', color: UI.ink, textDecoration: 'none' }}>
              {p.lotImage && <Photo img={{ src: p.lotImage.src, caption: null }} alt={t(lang, 'location')} ratio="2 / 1" />}
              <span style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: UI.gold }}>{t(lang, 'location')}</span>
                  <span style={{ display: 'block', fontSize: 17, fontWeight: 600, marginTop: 2 }}>{t(lang, 'openMaps')}</span>
                </span>
                <Chevron />
              </span>
            </a>
          )}
        </div>
        {shareButton({ p: p.slug })}
      </>
    );
  } else if (view.s === 'homes') {
    const lotMin = minLot(p);
    const lotMinRetail = minOf(p.lots.map((l) => l.retail));
    screen = (
      <>
        {back({ s: 'project' })}
        {heading(t(lang, 'choosePlan'))}
        <div style={{ display: 'grid', gap: 14 }}>
          {p.homes.map((h) => (
            <button key={h.id} type="button" onClick={() => go({ s: 'home', id: h.id })} className="fx-tap" style={{ ...reset, ...card }}>
              <Photo img={h.images[0]} alt={h.name} ratio="4 / 3" />
              <span style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px 18px' }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{h.name}</span>
                    {h.preliminary && <Badge lang={lang} />}
                  </span>
                  {h.sub && <span style={{ display: 'block', fontSize: 15, color: UI.soft, marginTop: 2 }}>{h.sub}</span>}
                  <span style={{ display: 'block', marginTop: 8 }}>
                    <Price lang={lang} price={sum(lotMin, h.price)} retail={sum(lotMinRetail, h.retail)} big />
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
        {back({ s: 'project' })}
        {heading(t(lang, 'chooseLot'))}
        <div style={card}>
          {p.lots.map((l, i) => (
            <button key={l.key} type="button" onClick={() => go({ s: 'lot', key: l.key })} className="fx-tap"
              style={{ ...reset, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderTop: i ? `1px solid ${UI.line}` : 'none' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{t(lang, 'lot', { n: l.n })}</span>
                  {l.preliminary && <Badge lang={lang} />}
                </span>
                <span style={{ display: 'block', fontSize: 13, color: UI.soft, marginTop: 2 }}>{[l.address, l.area].filter(Boolean).join(' · ')}</span>
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
    const yours = sum(lot?.price ?? null, h.price);
    screen = (
      <>
        {back(p.homes.length > 1 ? { s: 'homes' } : { s: 'project' })}
        {detail({
          title: h.name,
          sub: h.sub,
          specs: h.specs,
          media: <Gallery images={h.images} alt={h.name} />,
          chooser: p.lots.length > 1 && (
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
          ),
          rows: [
            { label: [lotLabel || t(lang, 'rowLot'), lot?.rate && lot.sqft ? `${lot.sqft.toLocaleString('en-US')} ${lang === 'es' ? 'ft²' : 'sq ft'} × ${rate(lot.rate.price)}` : null].filter(Boolean).join(' · '), value: lot?.price ?? null },
            { label: h.rate && h.sqft ? t(lang, 'buildRow', { sqft: h.sqft.toLocaleString('en-US'), rate: rate(h.rate.price) }) : (/^casa\b/i.test(h.name) ? h.name : `${t(lang, 'rowHouse')} · ${h.name}`), value: h.price },
          ],
          yours,
          list: sum(lot?.retail ?? null, h.retail),
          value: p.appraisal && h.sqft ? {
            est: Math.round(h.sqft * p.appraisal.perSqft),
            line: t(lang, 'valueLine', { sqft: h.sqft.toLocaleString('en-US'), rate: rate(p.appraisal.perSqft) }),
            note: p.appraisal.note,
          } : null,
          preliminary: h.preliminary || !!lot?.preliminary,
          item: t(lang, 'itemHome', { home: h.name, lot: lotLabel }),
          map: lot?.map ?? null,
          target: { p: p.slug, k: 'home', id: h.id },
        })}
      </>
    );
  } else {
    const l = p.lots.find((x) => x.key === view.key) ?? p.lots[0];
    const lr: Rate | null = l.rate;
    screen = (
      <>
        {back(p.lots.length > 1 ? { s: 'lots' } : { s: 'project' })}
        {detail({
          title: t(lang, 'lot', { n: l.n }),
          sub: [l.address, l.area].filter(Boolean).join(' · ') || null,
          media: <Photo img={p.lotImage ?? p.image} alt={t(lang, 'lot', { n: l.n })} />,
          rows: [],
          yours: l.price,
          list: l.retail,
          rateLine: lr ? t(lang, 'rateLine', { yours: rate(lr.price), list: rate(lr.retail) }) : null,
          preliminary: l.preliminary,
          item: t(lang, 'lot', { n: l.n }),
          map: l.map,
          target: { p: p.slug, k: 'lot', id: l.n },
        })}
      </>
    );
  }

  const shareText = sheet?.url ? `${t(lang, 'shareText')} ${sheet.url}` : '';
  const subject = t(lang, 'shareSubject', { brand: brand?.name ?? 'FEREST' });

  return (
    <div ref={top} className="fx-app" style={{ maxWidth: 560, margin: '0 auto', scrollMarginTop: 72 }}>
      <style>{css}</style>
      <div style={{ padding: '26px 0 18px' }}>
        {brand && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            {brand.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8, display: 'block' }} />
            )}
            <span style={{ fontSize: 15, fontWeight: 600 }}>{brand.name}</span>
            <span style={{ fontSize: 13, color: UI.soft }}>× FEREST</span>
          </div>
        )}
        <h1 style={{ fontSize: mode === 'guest' ? 28 : 34, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>{hello}</h1>
        <p style={{ fontSize: 17, color: UI.soft, margin: '6px 0 0', lineHeight: 1.4 }}>{helloSub}</p>
      </div>
      <div key={`${pi}-${JSON.stringify(view)}`} className="fx-screen">{screen}</div>

      {sheet && (
        <div role="dialog" aria-modal="true" aria-label={t(lang, 'shareTitle')} onClick={() => setSheet(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="fx-sheet fx-app" onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 560, background: '#F2F2F7', borderRadius: '20px 20px 0 0', padding: '10px 16px calc(20px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 36, height: 5, borderRadius: 999, background: '#C7C7CC', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center' }}>{t(lang, 'shareTitle')}</div>
            <p style={{ fontSize: 14, color: UI.soft, textAlign: 'center', margin: '6px 12px 16px', lineHeight: 1.4 }}>{t(lang, 'shareHint')}</p>
            {sheet.error ? (
              <p style={{ textAlign: 'center', color: '#C0392B', fontWeight: 600 }}>{t(lang, 'shareFail')}</p>
            ) : !sheet.url ? (
              <p style={{ textAlign: 'center', color: UI.soft }}>{t(lang, 'preparing')}</p>
            ) : (
              <div style={{ background: UI.card, borderRadius: 14, overflow: 'hidden' }}>
                {[
                  { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(shareText)}`, color: '#1E9E54' },
                  { label: t(lang, 'email'), href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`, color: '#0A84FF' },
                ].map((o, i) => (
                  <a key={o.label} href={o.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', padding: '16px 18px', fontSize: 17, fontWeight: 600, color: o.color, textDecoration: 'none', borderTop: i ? `1px solid ${UI.line}` : 'none' }}>
                    {o.label}
                  </a>
                ))}
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(sheet.url!); setSheet({ ...sheet, copied: true }); } catch { /* clipboard blocked */ } }}
                  style={{ ...reset, padding: '16px 18px', fontSize: 17, fontWeight: 600, color: UI.ink, borderTop: `1px solid ${UI.line}` }}>
                  {sheet.copied ? t(lang, 'copied') : t(lang, 'copy')}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button type="button" onClick={() => navigator.share({ title: subject, text: t(lang, 'shareText'), url: sheet.url! }).catch(() => {})}
                    style={{ ...reset, padding: '16px 18px', fontSize: 17, fontWeight: 600, color: UI.ink, borderTop: `1px solid ${UI.line}` }}>
                    {t(lang, 'more')}
                  </button>
                )}
              </div>
            )}
            <button type="button" onClick={() => setSheet(null)}
              style={{ ...reset, marginTop: 10, padding: '16px 18px', borderRadius: 14, background: UI.card, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#0A84FF' }}>
              {t(lang, 'close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
