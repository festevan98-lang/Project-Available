'use client';

/*
  Laguna Heights - shareable live-availability page.
  Availability mirrors the official ClickPlat tracker (synced server-side
  every 10 minutes). Send clients: projects.ferest.dev/laguna-heights
*/

import React, { useMemo, useState } from 'react';
import {
  MapPin, Phone, MessageCircle, ArrowRight, X, Search, Home, Landmark, KeyRound,
} from 'lucide-react';
import type { LhData, LhLot } from '@/lib/clickplat';

const CALENDLY = 'https://calendly.com/ferest-info/30min';
const WA_BASE = 'https://wa.me/19562030003';
const TEL = 'tel:+19562030003';
const wa = (text: string) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

const BRAND = { mark: '/brand/ferest-mark.webp', wordmark: '/brand/ferest-wordmark.webp' };
const PLAT_IMG = '/plats/laguna-heights-plat.png';
const MODEL_INT = ['/models/ferest-model-kitchen.webp', '/models/ferest-model-living.webp'];

const C = {
  paper: '#F4F1E8',
  paperDeep: '#ECE8DC',
  ink: '#121310',
  inkSoft: '#4A4C46',
  gold: '#E0B64A',
  goldDeep: '#B08228',
  goldHi: '#F0D076',
  card: '#FFFFFF',
  border: 'rgba(18,19,16,0.13)',
  wa: '#25D366',
  waText: '#06301A',
  waBorder: '#128C4A',
};

const money = (v: number) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const STATUS_FILL: Record<LhLot['status'], string> = {
  available: 'rgba(224,182,74,0.45)',
  reserved: 'rgba(18,19,16,0.25)',
  sold: 'rgba(18,19,16,0.55)',
};
const STATUS_STROKE: Record<LhLot['status'], string> = {
  available: '#B08228',
  reserved: '#4A4C46',
  sold: '#121310',
};

function Btn({ href, children, kind = 'primary', full }: {
  href: string; children: React.ReactNode; kind?: 'primary' | 'ghost' | 'wa'; full?: boolean;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font-oswald)', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.06em', fontSize: 14, borderRadius: 999, padding: '12px 22px',
    textDecoration: 'none', width: full ? '100%' : undefined,
  };
  const kinds: Record<string, React.CSSProperties> = {
    primary: { background: C.gold, color: '#1A160A', border: `3px solid ${C.goldDeep}` },
    ghost: { background: 'transparent', color: C.goldDeep, border: `2px solid ${C.goldDeep}` },
    wa: { background: C.wa, color: C.waText, border: `3px solid ${C.waBorder}` },
  };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...base, ...kinds[kind] }}>
      {children}
    </a>
  );
}

export default function LagunaClient({ initial }: { initial: LhData | null }) {
  const [selected, setSelected] = useState<LhLot | null>(null);
  const [availOnly, setAvailOnly] = useState(true);
  const [query, setQuery] = useState('');

  const data = initial;
  const lots = useMemo(() => data?.lots ?? [], [data]);
  const hasMap = !!data?.imageUrl && lots.some((l) => l.points && l.points.length >= 3);

  const shown = useMemo(() => {
    let arr = lots;
    if (availOnly) arr = arr.filter((l) => l.status === 'available');
    if (query.trim()) arr = arr.filter((l) => String(l.n).includes(query.trim()));
    return arr;
  }, [lots, availOnly, query]);

  const updated = data
    ? new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={{ background: C.paper, minHeight: '100vh', color: C.ink }}>
      <style>{`
        .lh * { box-sizing: border-box; }
        .lh .display { font-family: var(--font-anton); text-transform: uppercase; line-height: 0.94; letter-spacing: 0.01em; }
        .lh .num { font-family: var(--font-anton); letter-spacing: 0.01em; }
        .lh .label { font-family: var(--font-oswald); font-weight: 700; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; }
        .lh { font-family: var(--font-oswald); }
        .lh .grid-bg { background-image:
          linear-gradient(rgba(120,125,110,0.10) 1px, transparent 1px),
          linear-gradient(90deg, rgba(120,125,110,0.10) 1px, transparent 1px);
          background-size: 26px 26px; }
        .lh .fade { animation: lhfade .25s ease; }
        @keyframes lhfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .lh polygon { cursor: pointer; transition: fill-opacity .15s ease; }
        .lh polygon:hover { fill-opacity: 0.85; }
        .lh .tile:hover:not(:disabled) { transform: translateY(-1px); }
        @media (max-width: 640px) { .lh .pad-bar { padding-bottom: 84px; } }
      `}</style>

      <div className="lh grid-bg pad-bar">
        {/* header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(244,241,232,0.9)', backdropFilter: 'blur(12px)', borderBottom: `2px solid ${C.goldDeep}` }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <a href="https://ferest.dev" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.mark} alt="FEREST" style={{ height: 30, width: 'auto' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.wordmark} alt="FEREST" style={{ height: 15, width: 'auto' }} />
            </a>
            <div style={{ display: 'flex', gap: 10 }} className="hidden sm:flex">
              <Btn kind="ghost" href={wa('Hey FEREST, I Saw The Laguna Heights Availability Page.')}>
                <MessageCircle size={15} strokeWidth={2.4} /> Text Us
              </Btn>
              <Btn href={CALENDLY}><Phone size={14} strokeWidth={2.6} /> Book A Call</Btn>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>
          {/* hero */}
          <section style={{ padding: '48px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="label" style={{ color: C.goldDeep }}>Live Availability</span>
              {updated && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: C.wa, display: 'inline-block' }} />
                  Synced With The Official Lot Tracker - Updated {updated}
                </span>
              )}
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(3rem, 9vw, 5.6rem)', marginTop: 12 }}>
              <span style={{ color: C.ink }}>Laguna</span>{' '}
              <span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.goldDeep})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Heights.</span>
            </h1>
            <p style={{ marginTop: 14, fontSize: 16, fontWeight: 500, color: C.inkSoft, maxWidth: 620, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} strokeWidth={2.2} /> Mission, TX - Platted, Entitled, And Engineered In-House By FEREST.
            </p>

            {data ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
                {[
                  { top: 'Available Now', big: data.counts.available, sub: 'Open Lots' },
                  { top: 'Already Gone', big: data.counts.sold + data.counts.reserved, sub: 'Sold Or Reserved' },
                  { top: 'Community', big: data.counts.total, sub: 'Total Lots' },
                ].map((t) => (
                  <div key={t.top} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
                    <div className="label" style={{ color: C.goldDeep, fontSize: 10 }}>{t.top}</div>
                    <div className="num" style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', lineHeight: 0.96, marginTop: 6 }}>{t.big}</div>
                    <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>{t.sub}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 24, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 18, fontSize: 14, fontWeight: 600, color: C.inkSoft }}>
                Live Availability Is Refreshing - Text Us And We Will Send The Current Lot List.
              </div>
            )}
          </section>

          {/* interactive plat */}
          {hasMap && data && (
            <section style={{ padding: '28px 0 0' }}>
              <span className="label" style={{ color: C.goldDeep }}>Tap A Lot</span>
              <div style={{ position: 'relative', marginTop: 12, borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.card }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.imageUrl ?? PLAT_IMG} alt="Laguna Heights Plat" style={{ width: '100%', display: 'block' }} />
                <svg viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  {lots.filter((l) => l.points && l.points.length >= 3).map((l) => (
                    <polygon
                      key={l.n}
                      points={l.points!.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill={selected?.n === l.n ? 'rgba(224,182,74,0.8)' : STATUS_FILL[l.status]}
                      stroke={STATUS_STROKE[l.status]}
                      strokeWidth={1.4}
                      vectorEffect="non-scaling-stroke"
                      onClick={() => setSelected(l)}
                    />
                  ))}
                </svg>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, fontWeight: 600, color: C.inkSoft, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: STATUS_FILL.available, border: `2px solid ${STATUS_STROKE.available}` }} /> Available</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: STATUS_FILL.sold, border: `2px solid ${STATUS_STROKE.sold}` }} /> Sold</span>
              </div>
            </section>
          )}

          {/* selected lot panel */}
          {selected && (
            <div className="fade" style={{ marginTop: 16, background: C.card, border: `2px solid ${C.goldDeep}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <span className="label" style={{ color: C.goldDeep }}>Laguna Heights</span>
                  <div className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginTop: 2 }}>Lot {selected.n}</div>
                  <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 2 }}>
                    {selected.sqft.toLocaleString()} Sqft
                    {selected.status === 'available' && selected.price > 0 && <> · {money(selected.price)}</>}
                    {' '}· {selected.status === 'available' ? 'Available' : selected.status === 'sold' ? 'Sold' : 'Reserved'}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" style={{ color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={22} /></button>
              </div>
              {selected.status === 'available' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                  <Btn kind="wa" href={wa(`Hey FEREST, I Want Lot ${selected.n} At Laguna Heights (${selected.sqft.toLocaleString()} Sqft). Is It Still Open?`)}>
                    Claim Lot {selected.n} <ArrowRight size={15} strokeWidth={2.6} />
                  </Btn>
                  <Btn kind="ghost" href={CALENDLY}><Phone size={14} strokeWidth={2.4} /> Book A Call</Btn>
                </div>
              )}
            </div>
          )}

          {/* directory */}
          {data && (
            <section style={{ padding: '32px 0 0' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} strokeWidth={2.4} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.inkSoft }} />
                  <input
                    value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lot #"
                    inputMode="numeric"
                    style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '10px 14px 10px 34px', fontSize: 16, width: 110, fontFamily: 'var(--font-oswald)', color: C.ink }}
                  />
                </div>
                <button onClick={() => setAvailOnly(!availOnly)}
                  style={{ background: availOnly ? C.gold : C.card, color: availOnly ? '#1A160A' : C.inkSoft, border: `2px solid ${availOnly ? C.goldDeep : C.border}`, borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', letterSpacing: '0.05em', minHeight: 44 }}>
                  {availOnly ? 'Available Only' : `Show All ${lots.length}`}
                </button>
                <div style={{ marginLeft: 'auto', fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
                  <span style={{ color: C.ink }}>{shown.length}</span> {availOnly ? 'Available' : 'Shown'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))', gap: 8, marginTop: 14 }}>
                {shown.map((l) => {
                  const isSel = selected?.n === l.n;
                  const clickable = l.status === 'available';
                  const bg = l.status === 'sold' ? C.ink : l.status === 'reserved' ? C.paperDeep : isSel ? C.gold : C.card;
                  const fg = l.status === 'sold' ? C.paper : C.ink;
                  return (
                    <button key={l.n} className="tile" disabled={!clickable} onClick={() => setSelected(l)}
                      aria-label={`Lot ${l.n}, ${l.sqft.toLocaleString()} square feet, ${l.status}`}
                      style={{ background: bg, color: fg, border: `2px solid ${isSel ? C.goldDeep : C.border}`, borderRadius: 10, padding: '10px 6px', textAlign: 'center', cursor: clickable ? 'pointer' : 'default', opacity: clickable || isSel ? 1 : 0.7, fontFamily: 'var(--font-oswald)', WebkitTapHighlightColor: 'transparent' }}>
                      <div className="num" style={{ fontSize: 19, lineHeight: 1 }}>{l.n}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 3 }}>{l.sqft.toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
                Availability Mirrors The Official Tracker. Prices Confirmed When You Reach Out.
              </div>
            </section>
          )}

          {/* three ways */}
          <section style={{ padding: '48px 0 8px' }}>
            <span className="label" style={{ color: C.goldDeep }}>Three Ways To Go</span>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', marginTop: 8 }}>Pick Your Lot. Pick Your Path.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 20 }}>
              {[
                { icon: Landmark, title: 'Buy The Lot', body: 'Take any open lot flat and hold it or build later. Starting in the $60s.', cta: 'Ask About A Lot', msg: 'Hey FEREST, I Want To Buy A Lot At Laguna Heights.' },
                { icon: Home, title: 'We Build Your Home', body: 'Pick the lot and we build on it - our model or your floor plan, handled end to end.', cta: 'Ask About Building', msg: 'Hey FEREST, I Want You To Build A Home On A Laguna Heights Lot.' },
                { icon: KeyRound, title: 'FEREST-Held Lots', body: 'We keep a few of our own lots here. Ask what we would sell or build on for you.', cta: 'Ask What We Hold', msg: 'Hey FEREST, Which Laguna Heights Lots Do You Still Hold?' },
              ].map((w) => (
                <div key={w.title} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <w.icon size={22} color={C.goldDeep} strokeWidth={2.2} />
                  <div className="display" style={{ fontSize: '1.3rem', marginTop: 10 }}>{w.title}</div>
                  <p style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500, marginTop: 8, lineHeight: 1.5, flex: 1 }}>{w.body}</p>
                  <div style={{ marginTop: 14 }}>
                    <Btn kind="ghost" href={wa(w.msg)}>{w.cta} <ArrowRight size={14} strokeWidth={2.6} /></Btn>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 20 }}>
              {MODEL_INT.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="The Home FEREST Builds"
                  style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 14, border: `2px solid ${C.border}` }} />
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12.5, color: C.inkSoft, fontWeight: 600 }}>
              The Home We Build - Ask For Plans And Pricing.
            </div>
          </section>

          {/* footer-lite */}
          <footer style={{ borderTop: `2px solid ${C.goldDeep}`, margin: '48px 0 0', padding: '24px 0 40px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="label" style={{ color: C.goldDeep }}>Raw Land - Rooftops - Revenue</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>
              FEREST Development - Rio Grande Valley, TX · 956-203-0003
            </div>
          </footer>
        </main>

        {/* sticky mobile bar */}
        <div className="sm:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(244,241,232,0.95)', backdropFilter: 'blur(12px)', borderTop: `2px solid ${C.goldDeep}`, padding: '10px 14px', display: 'flex', gap: 10 }}>
          <Btn kind="wa" full href={wa('Hey FEREST, I Saw The Laguna Heights Availability Page.')}>
            <MessageCircle size={15} strokeWidth={2.4} /> Text Us
          </Btn>
          <Btn full href={TEL}><Phone size={14} strokeWidth={2.6} /> Call</Btn>
        </div>
      </div>
    </div>
  );
}
