'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin, Phone, MessageCircle, ArrowRight, ArrowUpRight, X, Search, Hammer, Compass,
  Navigation, ExternalLink, ChevronDown,
} from 'lucide-react';
import {
  PIPELINE_ROWS, publicNameOf, PORTFOLIO, CONSTRUCTION, LAND_PIPELINE, MAP_PARCELS, STAGES,
} from '@/data/projects';

/** Apple Maps search link. */
const appleMaps = (q: string) => `https://maps.apple.com/?q=${encodeURIComponent(q)}`;

/*
  FEREST PORTAL - revamp v3.
  One scrolling page in the FEREST x M2 paper brand system. Three blocks:
  1. BUY OR BUILD (retail, owned lots)  2. WHAT WE'RE BUILDING (pipeline)
  3. OFF-MARKET (one investor strip). Contact one tap from anywhere.
  Copy: Title Case, ASCII, no return-math, no private deal names, no em-dash.
*/

/* ------------------------------------------------------------------ links */
const CALENDLY = 'https://calendly.com/ferest-info/30min';
const WA_BASE = 'https://wa.me/19562030003';
const TEL = 'tel:+19562030003';
const wa = (text: string) => `${WA_BASE}?text=${encodeURIComponent(text)}`;
const WA_INFO = wa("Hey FEREST, I Saw Your Projects Site And I'm Interested In A Project.");

const LINKS = {
  ferest: 'https://ferest.dev',
  m2: 'https://m2engineers.com',
  contact: 'https://contact.ferest.dev',
  tiktok: 'https://tiktok.com/@ferest_develops',
  instagram: 'https://instagram.com/ferest_develops',
  facebook: 'https://facebook.com/p/Ferest-Development-Services-61567786490571/',
};

/* ------------------------------------------------------------------ assets */
const BRAND = {
  mark: '/brand/ferest-mark.webp',
  wordmark: '/brand/ferest-wordmark.webp',
  m2: '/brand/m2-logo.webp',
  tiktok: '/brand/icon-tiktok.webp',
  instagram: '/brand/icon-instagram.webp',
  facebook: '/brand/icon-facebook.webp',
};
const HERO_IMG = '/plats/laguna-heights-hero.jpg';
const PLAT_IMG = '/plats/laguna-heights-plat.png';
const MODEL_INT = ['/models/ferest-model-kitchen.webp', '/models/ferest-model-living.webp'];

/* ------------------------------------------------------------------ palette */
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
  borderStrong: 'rgba(18,19,16,0.22)',
  wa: '#25D366',
  waText: '#06301A',
  waBorder: '#128C4A',
};

/* ------------------------------------------------------------------ data */
interface InventoryLot {
  id: string;
  project: string;
  city: string;
  lotNumber: string;
  sqft: number;
  street?: string;
  mapsQuery?: string;
}
const INVENTORY_LOTS: InventoryLot[] = [
  { id: 'lo-69', project: 'Laguna Oaks Phase II', city: 'Mission, TX', lotNumber: '69', sqft: 6000, street: '909 La Laguna Rd', mapsQuery: '909 La Laguna Rd, Mission, TX' },
  { id: 'lo-70', project: 'Laguna Oaks Phase II', city: 'Mission, TX', lotNumber: '70', sqft: 6000, street: 'La Laguna Rd', mapsQuery: 'Laguna Oaks Phase II, Mission, TX' },
  { id: 'lo-71', project: 'Laguna Oaks Phase II', city: 'Mission, TX', lotNumber: '71', sqft: 6000, street: 'La Laguna Rd', mapsQuery: 'Laguna Oaks Phase II, Mission, TX' },
  { id: 'lh-38', project: 'Laguna Heights', city: 'Mission, TX', lotNumber: '38', sqft: 5000, street: 'Sundown Dr', mapsQuery: 'Laguna Heights, Mission, TX' },
  { id: 'lh-39', project: 'Laguna Heights', city: 'Mission, TX', lotNumber: '39', sqft: 5000, street: 'Sundown Dr', mapsQuery: 'Laguna Heights, Mission, TX' },
];

// Laguna Heights recorded plat - lot -> sqft. Prices carried exactly from site.
const PRICE_PSF = 11.75;
const LOTS_DATA: [number, number][] = [[1,7293],[2,6548],[3,6414],[4,6302],[5,6289],[6,6289],[7,6289],[8,6289],[9,6289],[10,6289],[11,6289],[12,6289],[13,6289],[14,6289],[15,6289],[16,6289],[17,6289],[18,6198],[19,5317],[21,5215],[22,5030],[23,5500],[24,5546],[25,5896],[26,6649],[27,7436],[28,7828],[29,5000],[30,5000],[31,5000],[32,5000],[33,5000],[34,5000],[35,5000],[36,5000],[37,5000],[38,5000],[39,5000],[40,5000],[41,5500],[42,5922],[43,5735],[44,5735],[45,5735],[46,5735],[47,5735],[48,5735],[49,5735],[50,5735],[51,5735],[52,5735],[53,5735],[54,5735],[55,5734],[56,5647],[57,6315],[58,6274],[59,6340],[60,8388],[61,5704],[62,5704],[63,5703],[64,5703],[65,5704],[66,5704],[67,5703],[68,5704],[69,5704],[70,5703],[71,5703],[72,5703],[73,5703],[74,5703],[75,5703],[76,5636],[77,6017],[78,5772],[79,5772],[80,5772],[81,5772],[82,5772],[83,5772],[84,5772],[85,5772],[86,5772],[87,5772],[88,5772],[89,5772],[90,5772],[91,5772],[92,5944],[93,5944],[94,5772],[95,5772],[96,5772],[97,5772],[98,5772],[99,5772],[100,5772],[101,5772],[102,5772],[103,5772],[104,5772],[105,5772],[106,5772],[107,5772],[108,5772],[109,5772],[110,5944],[111,5937],[112,5568],[113,5568],[114,5568],[115,5568],[116,5568],[117,5568],[118,5568],[119,5568],[120,5568],[121,5568],[122,5568],[123,5568],[124,5568],[125,5568],[126,5568],[127,5568],[128,5052],[129,5427],[130,8252],[131,6731],[132,6240],[133,5750],[134,5750],[135,5750],[136,5750],[137,5750],[138,5750],[139,5750],[140,6675],[141,5362],[142,5000]];
const SOLD = new Set<number>([18,22,23,24,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,70,73,74,75,77,78,91,92,93,94,95,96,97,98,99,100,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,133,134,137]);
const RESERVED = new Set<number>([]);

type LotStatus = 'available' | 'reserved' | 'sold';
interface PortalLot { n: number; sqft: number; price: number; status: LotStatus; }
const LOTS: PortalLot[] = LOTS_DATA.map(([n, sqft]) => ({
  n, sqft,
  price: Math.round(sqft * PRICE_PSF * 100) / 100,
  status: SOLD.has(n) ? 'sold' : RESERVED.has(n) ? 'reserved' : 'available',
}));
const AVAIL_COUNT = LOTS.filter((l) => l.status === 'available').length;
const SQFT_MIN = Math.min(...LOTS.map((l) => l.sqft));
const SQFT_MAX = Math.max(...LOTS.map((l) => l.sqft));

/* ------------------------------------------------------------------ helpers */
const money = (v: number) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
function monthlyPI(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12, n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  available: 'Available', reserved: 'Reserved', sold: 'Sold',
};

/* ------------------------------------------------------------------ live availability (ClickPlat sync) */
interface LiveLots { lots: PortalLot[]; updatedAt: string; available: number; }
let liveLotsPromise: Promise<LiveLots | null> | null = null;
function fetchLiveLots(): Promise<LiveLots | null> {
  return fetch('/api/lh-lots')
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      if (!j?.ok || !Array.isArray(j.lots) || j.lots.length === 0) return null;
      return { lots: j.lots as PortalLot[], updatedAt: j.updatedAt as string, available: j.counts.available as number };
    })
    .catch(() => null);
}
/** Live Laguna Heights lots from the official tracker; falls back to the static plat data. */
function useLiveLots(): LiveLots | null {
  const [data, setData] = useState<LiveLots | null>(null);
  useEffect(() => {
    liveLotsPromise ??= fetchLiveLots();
    let on = true;
    liveLotsPromise.then((d) => { if (on && d) setData(d); });
    return () => { on = false; };
  }, []);
  return data;
}

/* ------------------------------------------------------------------ image with graceful fallback */
function SmartImg({ src, alt, style, label }: { src: string; alt: string; style?: React.CSSProperties; label?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{ ...style, background: C.paperDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="label" style={{ color: C.goldDeep }}>{label ?? 'Photo Coming'}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={style} loading="lazy" onError={() => setErr(true)} />;
}

/* ------------------------------------------------------------------ buttons */
type BtnProps = { href?: string; onClick?: () => void; children: React.ReactNode; full?: boolean; external?: boolean };
const BTN_BASE: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: 'var(--font-oswald)', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.04em', fontSize: 14, cursor: 'pointer', textDecoration: 'none',
  padding: '13px 22px', borderRadius: 999, lineHeight: 1, whiteSpace: 'nowrap',
};
function BtnPrimary({ href, onClick, children, full, external }: BtnProps) {
  const style: React.CSSProperties = { ...BTN_BASE, background: C.gold, color: '#1A160A', border: `3px solid ${C.goldDeep}`, width: full ? '100%' : undefined };
  return href
    ? <a href={href} style={style} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    : <button onClick={onClick} style={style}>{children}</button>;
}
function BtnWhatsApp({ href, children, full }: BtnProps) {
  const style: React.CSSProperties = { ...BTN_BASE, background: C.wa, color: C.waText, border: `2px solid ${C.waBorder}`, width: full ? '100%' : undefined };
  return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>;
}
function BtnGhost({ href, onClick, children, full, external }: BtnProps) {
  const style: React.CSSProperties = { ...BTN_BASE, background: 'transparent', color: C.goldDeep, border: `2px solid ${C.goldDeep}`, width: full ? '100%' : undefined };
  return href
    ? <a href={href} style={style} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    : <button onClick={onClick} style={style}>{children}</button>;
}

/* ------------------------------------------------------------------ accordion (dropdown) */
function Accordion({ id, eyebrow, title, subtitle, children }: {
  id?: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section id={id} style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 20px 0' }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 text-left"
        style={{ background: C.card, border: `2px solid ${open ? C.goldDeep : C.border}`, borderRadius: 16, padding: '18px 22px', cursor: 'pointer' }}>
        <div>
          {eyebrow && <span className="label" style={{ color: C.goldDeep }}>{eyebrow}</span>}
          <div className="display" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: C.ink, marginTop: eyebrow ? 4 : 0 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500, marginTop: 4 }}>{subtitle}</div>}
        </div>
        <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 999, border: `2px solid ${C.goldDeep}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldDeep, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <ChevronDown size={20} strokeWidth={2.4} />
        </span>
      </button>
      {open && <div className="fade" style={{ marginTop: 16 }}>{children}</div>}
    </section>
  );
}

/* ================================================================== PAGE */
export default function App() {
  const [showPlat, setShowPlat] = useState(false);

  return (
    <div style={{ color: C.ink, minHeight: '100vh', fontFamily: 'var(--font-oswald), system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .display { font-family: var(--font-anton); text-transform: uppercase; line-height: 0.94; letter-spacing: 0.005em; font-weight: 400; }
        .num { font-family: var(--font-anton); font-variant-numeric: tabular-nums; letter-spacing: 0.01em; }
        .label { font-family: var(--font-oswald); font-weight: 700; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; }
        .gold-text { background: linear-gradient(120deg, ${C.goldHi}, ${C.goldDeep}); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .fade { animation: fade .6s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        input, select, button, a { font-family: inherit; }
        input::placeholder { color: rgba(18,19,16,0.4); }
        .range { accent-color: ${C.goldDeep}; height: 4px; }
        .lot-tile { transition: transform .15s ease, border-color .15s ease, background .15s ease; }
        .lot-tile:hover:not(:disabled) { transform: translateY(-1px); }
        .row-link { transition: background .15s ease; }
        .row-link:hover { background: ${C.paperDeep}; }
        @media (max-width: 640px) { .pad-mobile-bar { padding-bottom: 84px; } }
      `}</style>

      <Header />

      <main>
        <Hero />
        <Pipeline />
        <OffMarket />
        <Portfolio />
        <DesignBuild />
        <Homes showPlat={showPlat} setShowPlat={setShowPlat} />
      </main>

      <Footer />
      <MobileContactBar />
    </div>
  );
}

/* ------------------------------------------------------------------ Header */
function Header() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(244,241,232,0.9)', backdropFilter: 'blur(12px)', borderBottom: `2px solid ${C.goldDeep}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 20px' }} className="flex items-center justify-between gap-4">
        <a href={LINKS.ferest} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.mark} alt="FEREST" style={{ height: 30, width: 'auto' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.wordmark} alt="FEREST" style={{ height: 15, width: 'auto' }} />
        </a>
        <div className="hidden sm:flex items-center gap-2.5">
          <BtnGhost href={WA_INFO} external><MessageCircle size={15} strokeWidth={2.4} /> Text Us</BtnGhost>
          <BtnPrimary href={CALENDLY} external><Phone size={14} strokeWidth={2.6} /> Book A Call</BtnPrimary>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Hero (developments-first) */
function Hero() {
  return (
    <section id="top" className="fade" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <SmartImg src={HERO_IMG} alt="" label="Rio Grande Valley" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(244,241,232,0.4) 0%, rgba(244,241,232,0.6) 55%, ${C.paper} 100%)` }} />
      </div>
      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '84px 20px 44px' }}>
        <div className="flex items-center gap-3 mb-5">
          <span className="label" style={{ color: C.goldDeep }}>FEREST Development</span>
          <span aria-hidden style={{ width: 20, height: 2, background: C.goldDeep, opacity: 0.6 }} />
          <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>Rio Grande Valley, TX</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(3rem, 9vw, 6.6rem)' }}>
          <span style={{ color: C.ink }}>From Raw Acres</span><br />
          <span className="gold-text">To Rooftops.</span>
        </h1>
        <p style={{ marginTop: 22, fontSize: 'clamp(1rem, 2.4vw, 1.3rem)', fontWeight: 500, color: C.ink, maxWidth: 680 }}>
          We run developments from feasibility to plans to construction to sales, engineered and entitled in-house. Want a home instead? We build those too.
        </p>
        <div className="flex flex-wrap gap-2.5 mt-7">
          <BtnPrimary href="#developments"><Compass size={15} strokeWidth={2.6} /> See Developments</BtnPrimary>
          <BtnGhost href="#homes">Looking For A Home</BtnGhost>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Homes (simple, under developments) */
function Homes({ showPlat, setShowPlat }: { showPlat: boolean; setShowPlat: (v: boolean) => void }) {
  const live = useLiveLots();
  const lots = live?.lots ?? LOTS;
  const availCount = live?.available ?? AVAIL_COUNT;
  const sqftMin = live ? Math.min(...lots.map((l) => l.sqft)) : SQFT_MIN;
  const sqftMax = live ? Math.max(...lots.map((l) => l.sqft)) : SQFT_MAX;
  return (
    <Accordion id="homes" eyebrow="FEREST Homes" title="Buy A Lot Or Build To Suit"
      subtitle="Vacant lots FEREST owns. Take the lot as-is or build our model. Pricing by request - tap to view.">
      {/* one model peek - not repeated per card */}
      <div className="grid grid-cols-2 gap-3">
        {MODEL_INT.map((src) => (
          <SmartImg key={src} src={src} alt="FEREST model home interior" label="Our Model"
            style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 14, border: `2px solid ${C.border}` }} />
        ))}
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <StatTile top="Starting In The" big="$60s" sub="Lot Pricing" />
        <StatTile top="Available Now" big={String(availCount)} sub={live ? 'Lots Ready - Live Count' : 'Lots Ready'} />
        <StatTile top="Lot Sizes" big={`${sqftMin.toLocaleString()}-${sqftMax.toLocaleString()}`} sub="Square Feet" />
      </div>

      {/* owned lots - compact reach-out cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {INVENTORY_LOTS.map((lot) => <OwnedLotCard key={lot.id} lot={lot} />)}
      </div>

      <div className="mt-4"><FhaCalculator /></div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 mt-8">
        <BtnGhost onClick={() => setShowPlat(!showPlat)}>
          {showPlat ? 'Hide The Plat' : `See All ${availCount} Lots`}
          <ArrowRight size={15} strokeWidth={2.6} style={{ transform: showPlat ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .2s' }} />
        </BtnGhost>
        <a href="/laguna-heights" className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
          Laguna Heights Live Availability <ArrowUpRight size={14} strokeWidth={2.6} />
        </a>
      </div>

      {showPlat && <PlatDirectory lots={lots} live={!!live} />}
    </Accordion>
  );
}

function StatTile({ top, big, sub }: { top: string; big: string; sub: string }) {
  return (
    <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
      <div className="label" style={{ color: C.goldDeep, fontSize: 11 }}>{top}</div>
      <div className="num" style={{ fontSize: 'clamp(2.2rem, 6vw, 3rem)', color: C.ink, lineHeight: 0.96, marginTop: 6 }}>{big}</div>
      <div style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ FHA calculator */
function FhaCalculator() {
  const [price, setPrice] = useState(180000);
  const [rate, setRate] = useState(6.5);
  const down = Math.round(price * 0.035);
  const loan = price - down;
  const monthly = Math.round(monthlyPI(loan, rate, 30));
  return (
    <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 'clamp(20px, 4vw, 28px)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="label" style={{ color: C.goldDeep }}>FHA Down Payment Estimator</span>
        <span style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>3.5% Minimum Down</span>
      </div>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-5 mt-5 items-start">
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>Home Price</label>
          <div className="num" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.3rem)', color: C.ink, lineHeight: 1, marginTop: 4 }}>{money(price)}</div>
          <input type="range" min={60000} max={400000} step={5000} value={price}
            onChange={(e) => setPrice(Number(e.target.value))} className="range w-full" style={{ marginTop: 14 }} />
          <div className="flex justify-between" style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>
            <span>{money(60000)}</span><span>{money(400000)}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <label style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>Rate</label>
            <input type="number" step={0.125} value={rate} onChange={(e) => setRate(Number(e.target.value))}
              style={{ width: 90, background: C.paper, border: `2px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', fontSize: 16, color: C.ink }} />
            <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>% / 30 Yr Fixed</span>
          </div>
        </div>

        <div style={{ background: C.paper, border: `2px solid ${C.goldDeep}`, borderRadius: 14, padding: '20px 22px' }}>
          <div className="label" style={{ color: C.goldDeep, fontSize: 11 }}>Your Down Payment</div>
          <div className="num" style={{ fontSize: 'clamp(2.6rem, 8vw, 3.6rem)', color: C.goldDeep, lineHeight: 0.95, marginTop: 4 }}>{money(down)}</div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Financed</div>
              <div className="num" style={{ fontSize: 20, color: C.ink }}>{money(loan)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>Est. Monthly</div>
              <div className="num" style={{ fontSize: 20, color: C.ink }}>{money(monthly)}</div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.inkSoft, marginTop: 16, lineHeight: 1.5 }}>
        Estimate only. Assumes FHA 3.5% minimum down on a 30-year fixed at the rate shown. Not a loan offer or commitment. Principal and interest only - taxes, insurance, and HOA not included. Talk to a licensed lender for real terms.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ owned lot card */
function OwnedLotCard({ lot }: { lot: InventoryLot }) {
  const reachHref = wa(`Hey FEREST, I'm Interested In Lot ${lot.lotNumber} At ${lot.project} - Buy Or Build To Suit. What's The Pricing?`);
  return (
    <article style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="label" style={{ background: C.gold, color: '#1A160A', padding: '4px 10px', borderRadius: 999, fontSize: 9 }}>FEREST Owned</span>
        <span className="label" style={{ background: C.paperDeep, color: C.inkSoft, padding: '4px 10px', borderRadius: 999, fontSize: 9 }}>Vacant</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginTop: 12 }}>{lot.project} - {lot.city}</div>
      <div className="display flex items-baseline gap-2" style={{ fontSize: 30, color: C.ink, marginTop: 2 }}>
        Lot {lot.lotNumber}
        <span style={{ fontFamily: 'var(--font-oswald)', fontSize: 12, fontWeight: 600, color: C.inkSoft, textTransform: 'none', letterSpacing: 0 }}>
          {lot.sqft.toLocaleString()} Sqft
        </span>
      </div>
      {lot.street && (
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.inkSoft, fontWeight: 500, marginTop: 4 }}>
          <MapPin size={12} strokeWidth={2} /> {lot.street}
        </div>
      )}
      <div style={{ marginTop: 12, borderTop: `2px solid ${C.border}`, paddingTop: 12 }}>
        <div className="label" style={{ color: C.goldDeep, fontSize: 10 }}>Buy The Lot Or Build To Suit</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 3 }}>Reach Out For Pricing</div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 14 }} className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <BtnPrimary href={reachHref} external>Reach Out <ArrowRight size={14} strokeWidth={2.6} /></BtnPrimary>
        {lot.mapsQuery && (
          <a href={appleMaps(lot.mapsQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
            <Navigation size={13} strokeWidth={2.4} /> Maps
          </a>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ plat + directory */
function PlatDirectory({ lots = LOTS, live = false }: { lots?: PortalLot[]; live?: boolean }) {
  const [selected, setSelected] = useState<PortalLot | null>(null);
  const [availOnly, setAvailOnly] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('num');

  const shown = useMemo(() => {
    let arr = lots;
    if (availOnly) arr = arr.filter((l) => l.status === 'available');
    if (query.trim()) arr = arr.filter((l) => String(l.n).includes(query.trim()));
    arr = [...arr];
    if (sort === 'num') arr.sort((a, b) => a.n - b.n);
    if (sort === 'priceup') arr.sort((a, b) => a.price - b.price);
    if (sort === 'size') arr.sort((a, b) => b.sqft - a.sqft);
    return arr;
  }, [lots, availOnly, query, sort]);

  return (
    <div className="fade" style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px 8px' }}>
      {/* PLAT */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
        <div>
          <span className="label" style={{ color: C.goldDeep }}>Recorded Plat</span>
          <h3 className="display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: C.ink, marginTop: 4 }}>The Site Plan</h3>
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, maxWidth: 280, textAlign: 'right' }}>
          Filed By M2 Engineering, PLLC - TBPELS F-19545
        </div>
      </div>
      <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 8 }}>
        <SmartImg src={PLAT_IMG} alt="Laguna Heights recorded plat" label="Recorded Plat"
          style={{ width: '100%', display: 'block', borderRadius: 10 }} />
      </div>

      {/* DIRECTORY */}
      <div className="flex items-end justify-between flex-wrap gap-3 mt-10 mb-5">
        <div>
          <span className="label" style={{ color: C.goldDeep }}>Lot Directory</span>
          <h3 className="display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: C.ink, marginTop: 4 }}>Pick Your Lot</h3>
        </div>
        <div className="flex gap-4" style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>
          {(['available', 'reserved', 'sold'] as LotStatus[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 3, border: `1.5px solid ${C.borderStrong}`, background: k === 'available' ? C.card : k === 'reserved' ? C.paperDeep : C.ink }} />
              {LOT_STATUS_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <div className="flex items-center gap-2" style={{ border: `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', background: C.card }}>
          <Search size={14} color={C.inkSoft} strokeWidth={2.2} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lot #" inputMode="numeric"
            style={{ background: 'transparent', border: 'none', outline: 'none', color: C.ink, width: 56, fontSize: 16 }} />
        </div>
        <button onClick={() => setAvailOnly((s) => !s)}
          style={{ fontSize: 14, fontWeight: 600, padding: '9px 18px', borderRadius: 999, minHeight: 44,
            background: availOnly ? C.ink : C.card, color: availOnly ? C.paper : C.ink, border: `2px solid ${availOnly ? C.ink : C.border}` }}>
          {availOnly ? 'Available Only' : `Show All ${lots.length}`}
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ fontSize: 14, fontWeight: 600, padding: '9px 18px', borderRadius: 999, minHeight: 44, background: C.card, color: C.ink, border: `2px solid ${C.border}`, appearance: 'none' }}>
          <option value="num">Lot Number</option>
          <option value="priceup">Price - Low To High</option>
          <option value="size">Size - Largest First</option>
        </select>
        <div className="ml-auto" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
          <span style={{ color: C.ink }}>{shown.length}</span> {availOnly ? 'Available' : 'Shown'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))', gap: 8 }}>
        {shown.map((l) => {
          const isSel = selected?.n === l.n;
          const clickable = l.status === 'available';
          const bg = l.status === 'sold' ? C.ink : l.status === 'reserved' ? C.paperDeep : (isSel ? C.gold : C.card);
          const fg = l.status === 'sold' ? C.paper : C.ink;
          return (
            <button key={l.n} className="lot-tile" disabled={!clickable}
              onClick={() => setSelected(l)}
              style={{ background: bg, color: fg, border: `2px solid ${isSel ? C.goldDeep : C.border}`, borderRadius: 10, padding: '10px 6px', textAlign: 'center', cursor: clickable ? 'pointer' : 'default', opacity: clickable || isSel ? 1 : 0.7 }}>
              <div className="num" style={{ fontSize: 19, lineHeight: 1 }}>{l.n}</div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 3 }}>{l.sqft.toLocaleString()}</div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fade" style={{ marginTop: 16, background: C.card, border: `2px solid ${C.goldDeep}`, borderRadius: 16, padding: '20px 22px' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="label" style={{ color: C.goldDeep }}>Laguna Heights</span>
              <div className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', color: C.ink, marginTop: 2 }}>Lot {selected.n}</div>
              <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 2 }}>
                {selected.sqft.toLocaleString()} Sqft · {money(selected.price)}
              </div>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close" style={{ color: C.inkSoft, padding: 4 }}><X size={22} /></button>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <BtnPrimary href={wa(`Hi FEREST, I Want To Reserve Lot ${selected.n} At Laguna Heights.`)} external>
              Reserve Lot {selected.n} <ArrowRight size={15} strokeWidth={2.6} />
            </BtnPrimary>
            <BtnGhost href={CALENDLY} external><Phone size={14} strokeWidth={2.4} /> Book A Call</BtnGhost>
          </div>
        </div>
      )}

      <div style={{ marginTop: 18, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
        {live
          ? 'Availability synced with the official lot tracker.'
          : 'Prices carried from the recorded plat. Availability updates as lots move.'}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ developments (lifecycle) */
function StageBar({ index }: { index: number }) {
  return (
    <div className="flex items-end gap-1.5" style={{ width: '100%' }}>
      {STAGES.map((s, i) => {
        const active = i <= index;
        const current = i === index;
        return (
          <div key={s} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 5, borderRadius: 999, background: active ? C.goldDeep : C.border }} />
            <div className="label" style={{ fontSize: 9, marginTop: 5, color: current ? C.goldDeep : C.inkSoft, opacity: current ? 1 : 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DevRow({ p, first }: { p: (typeof PIPELINE_ROWS)[number]; first: boolean }) {
  const [open, setOpen] = useState(false);
  const canExpand = !!p.detail;
  return (
    <div style={{ borderTop: first ? 'none' : `2px solid ${C.border}` }}>
      <button
        onClick={() => canExpand && setOpen((v) => !v)}
        className="w-full text-left"
        style={{ display: 'block', width: '100%', padding: '18px 20px', background: 'transparent', cursor: canExpand ? 'pointer' : 'default' }}
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="display flex items-center gap-2" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', color: C.ink }}>
              {publicNameOf(p)}
              {canExpand && (
                <ChevronDown size={18} strokeWidth={2.6} color={C.goldDeep} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              )}
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 2 }}>
              <MapPin size={13} strokeWidth={2} /> {p.city}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="label" style={{ background: C.ink, color: C.paper, padding: '6px 12px', borderRadius: 999, fontSize: 10 }}>{p.devType}</span>
            {p.stats.slice(0, 3).map((s) => (
              <span key={s.label} style={{ background: C.paper, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.ink }}>
                <span className="num" style={{ fontSize: 14 }}>{s.value}</span> <span style={{ color: C.inkSoft }}>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, maxWidth: 460 }}><StageBar index={p.stageIndex} /></div>
      </button>

      {open && p.detail && (
        <div className="fade" style={{ padding: '0 20px 20px' }}>
          <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: 16 }}>
            <p style={{ fontSize: 15, color: C.ink, fontWeight: 500, maxWidth: 700, lineHeight: 1.5 }}>{p.detail}</p>
            {p.features && (
              <div className="flex flex-wrap gap-2 mt-4">
                {p.features.map((f) => (
                  <span key={f} style={{ background: C.paper, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: C.ink }}>{f}</span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center mt-5">
              <BtnPrimary href={wa(`Hey FEREST, Tell Me More About ${publicNameOf(p)}.`)} external>
                Ask About This <ArrowRight size={14} strokeWidth={2.6} />
              </BtnPrimary>
              {p.liveHref && (
                <a href={p.liveHref} className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
                  Live Availability <ArrowUpRight size={13} strokeWidth={2.6} />
                </a>
              )}
              {p.mapsQuery && (
                <a href={appleMaps(p.mapsQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
                  <Navigation size={13} strokeWidth={2.4} /> View On Maps
                </a>
              )}
              {p.locationNote && (
                <span style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600 }}>{p.locationNote}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pipeline() {
  return (
    <section id="developments" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 20px 8px' }}>
      <span className="label" style={{ color: C.goldDeep }}>Subdivision Pipeline</span>
      <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', color: C.ink, marginTop: 8 }}>Developments We Run.</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 640 }}>
        Every project taken through the full cycle - feasibility, plans, construction, sales. Engineered and entitled in-house. Tap any development for the detail.
      </p>

      <div style={{ marginTop: 28, border: `2px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', background: C.card }}>
        {PIPELINE_ROWS.map((p, i) => (
          <DevRow key={p.id} p={p} first={i === 0} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <BtnPrimary href={LINKS.contact} external>Talk To The Team <ArrowUpRight size={16} strokeWidth={2.6} /></BtnPrimary>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ design + build */
function DesignBuild() {
  return (
    <Accordion id="build" eyebrow="Design + Build" title="Built By FEREST"
      subtitle="Homes delivered and commercial spaces we have designed and built. Tap to view.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONSTRUCTION.map((b) => {
          const sold = b.status === 'Sold';
          const concept = b.status === 'Concept';
          const statusBg = sold ? C.ink : concept ? C.paperDeep : C.wa;
          const statusFg = sold ? C.paper : concept ? C.inkSoft : C.waText;
          return (
            <article key={b.id} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <SmartImg src={b.image} alt={b.name} label={b.name}
                  style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
                <span className="label" style={{ position: 'absolute', top: 12, left: 12, background: b.type === 'Home' ? C.gold : C.ink, color: b.type === 'Home' ? '#1A160A' : C.paper, padding: '5px 10px', borderRadius: 999, fontSize: 10 }}>
                  {b.type === 'Home' ? <Hammer size={10} strokeWidth={2.6} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 5 }} /> : null}
                  {b.type}
                </span>
                {b.status && (
                  <span className="label" style={{ position: 'absolute', top: 12, right: 12, background: statusBg, color: statusFg, padding: '5px 10px', borderRadius: 999, fontSize: 9 }}>
                    {b.status}
                  </span>
                )}
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="display" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', color: C.ink }}>{b.name}</div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 3 }}>
                  <MapPin size={13} strokeWidth={2} /> {b.location}
                </div>
                {(b.mapsQuery || b.website) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3" style={{ marginTop: 'auto', paddingTop: 12 }}>
                    {b.website && (
                      <a href={b.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
                        <ExternalLink size={13} strokeWidth={2.4} /> Visit Site
                      </a>
                    )}
                    {b.mapsQuery && (
                      <a href={appleMaps(b.mapsQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
                        <Navigation size={13} strokeWidth={2.4} /> View On Maps
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Accordion>
  );
}

/* ------------------------------------------------------------------ where we build map */
function ParcelMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let map: any;
    let cancelled = false;
    function init() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const el = ref.current as any;
      if (!L || !el || el._leaflet_id) return;
      map = L.map(el, { scrollWheelZoom: false }).setView([26.19, -98.2], 10);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CARTO', maxZoom: 19,
      }).addTo(map);
      const pts: [number, number][] = [];
      MAP_PARCELS.forEach((p) => {
        const built = p.kind === 'built';
        L.circleMarker([p.lat, p.lng], {
          radius: 10, color: '#B08228', weight: 2,
          fillColor: built ? '#121310' : '#E0B64A', fillOpacity: 0.5,
        }).addTo(map).bindTooltip(p.name, { direction: 'top', offset: [0, -6] });
        pts.push([p.lat, p.lng]);
      });
      if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 12 });
      setReady(true);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { init(); return () => { if (map) map.remove(); }; }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    let script = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.body.appendChild(script);
    }
    const onload = () => { if (!cancelled) init(); };
    script.addEventListener('load', onload);
    if ((window as unknown as { L?: unknown }).L) init();
    return () => { cancelled = true; script?.removeEventListener('load', onload); if (map) map.remove(); };
  }, []);
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ position: 'relative', zIndex: 0, borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.border}` }}>
        <div ref={ref} style={{ height: 380, width: '100%', background: C.paperDeep }} />
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span className="label" style={{ color: C.goldDeep }}>Loading Map...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 mt-3" style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
        <span className="flex items-center gap-1.5"><span style={{ width: 12, height: 12, borderRadius: 999, background: '#E0B64A', border: '2px solid #B08228' }} /> Developed</span>
        <span className="flex items-center gap-1.5"><span style={{ width: 12, height: 12, borderRadius: 999, background: '#121310', border: '2px solid #B08228' }} /> Built</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ portfolio */
function Portfolio() {
  return (
    <section id="portfolio" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 20px 8px' }}>
      <span className="label" style={{ color: C.goldDeep }}>Platted &amp; Engineered By Our Team</span>
      <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: C.ink, marginTop: 8 }}>The Track Record.</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 640 }}>
        Subdivisions our team designed, platted, and engineered across the Valley.
      </p>
      <div className="inline-flex items-center gap-2.5 mt-4" style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '8px 16px' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>Engineered By</span>
        <a href={LINKS.m2} target="_blank" rel="noopener noreferrer" aria-label="M2 Engineering">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.m2} alt="M2 Engineering" style={{ height: 20, width: 'auto', display: 'block' }} />
        </a>
        <span aria-hidden style={{ width: 1, height: 16, background: C.border }} />
        <span className="label" style={{ fontSize: 10, color: C.goldDeep }}>TBPELS F-19545</span>
      </div>

      <ParcelMap />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
        {PORTFOLIO.map((p) => (
          <article key={p.id} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                {p.tag && (
                  <span className="label" style={{ display: 'inline-block', background: C.gold, color: '#1A160A', padding: '4px 10px', borderRadius: 999, fontSize: 9, marginBottom: 8 }}>
                    {p.tag}
                  </span>
                )}
                <div className="display" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', color: C.ink }}>{p.name}</div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 3 }}>
                  <MapPin size={13} strokeWidth={2} /> {p.city}
                </div>
              </div>
              <Compass size={18} color={C.goldDeep} strokeWidth={2} style={{ flexShrink: 0, marginTop: 4 }} />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {p.stats.map((s) => (
                <span key={s.label} style={{ background: C.paper, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.ink }}>
                  <span className="num" style={{ fontSize: 14 }}>{s.value}</span> <span style={{ color: C.inkSoft }}>{s.label}</span>
                </span>
              ))}
            </div>
            {p.mapsQuery && (
              <a href={appleMaps(p.mapsQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
                <Navigation size={13} strokeWidth={2.4} /> View On Maps
              </a>
            )}
            {p.note && (
              <div style={{ marginTop: 14, borderTop: `2px solid ${C.border}`, paddingTop: 14 }}>
                <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{p.note}</div>
                {p.noteCta && (
                  <a href={wa(p.noteCta.waText)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2" style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, textDecoration: 'none' }}>
                    {p.noteCta.label} <ArrowRight size={13} strokeWidth={2.6} />
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Block 3 off-market */
function OffMarket() {
  return (
    <section id="offmarket" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 20px 8px' }}>
      <span className="label" style={{ color: C.goldDeep }}>Off-Market Land</span>
      <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', color: C.ink, marginTop: 8 }}>Raw Dirt We Control.</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 660 }}>
        Engineered, entitled, or shovel-ready parcels across the Valley for builders and investors. The numbers live in the deal sheet - reach out and we send it.
      </p>

      <div style={{ marginTop: 28, border: `2px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', background: C.card }}>
        {LAND_PIPELINE.map((d, i) => (
          <div key={d.id} className="flex items-center justify-between gap-4"
            style={{ padding: '18px 20px', borderTop: i === 0 ? 'none' : `2px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <Compass size={17} color={C.goldDeep} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span className="display" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: C.ink }}>{d.area}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
                <MapPin size={13} strokeWidth={2} /> {d.city}
              </span>
              <span className="label" style={{ background: C.paperDeep, color: C.inkSoft, padding: '5px 11px', borderRadius: 999, fontSize: 9 }}>Off-Market</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-7">
        <BtnPrimary href={wa('Hey FEREST, Send Me The Off-Market Deal Sheet.')} external>
          Request The Deal Sheet <ArrowRight size={15} strokeWidth={2.6} />
        </BtnPrimary>
        <a href={wa('Hey FEREST, I Want To Feature My Project.')} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 14, fontWeight: 600, color: C.inkSoft, alignSelf: 'center', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Or List Your Project
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Footer */
function Footer() {
  const socials = [
    { href: LINKS.tiktok, icon: BRAND.tiktok, name: 'TikTok' },
    { href: LINKS.instagram, icon: BRAND.instagram, name: 'Instagram' },
    { href: LINKS.facebook, icon: BRAND.facebook, name: 'Facebook' },
  ];
  return (
    <footer style={{ background: C.ink, color: C.paper, marginTop: 64 }}>
      <div className="pad-mobile-bar" style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 20px' }}>
        <div className="display gold-text" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>Raw Land - Rooftops - Revenue</div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6" style={{ fontSize: 14, fontWeight: 600 }}>
          <a href={LINKS.ferest} target="_blank" rel="noopener noreferrer" style={{ color: C.paper, textDecoration: 'none' }}>ferest.dev</a>
          <a href={LINKS.m2} target="_blank" rel="noopener noreferrer" style={{ color: C.paper, textDecoration: 'none' }}>m2engineers.com</a>
          <a href={LINKS.contact} target="_blank" rel="noopener noreferrer" style={{ color: C.paper, textDecoration: 'none' }}>contact.ferest.dev</a>
          <div className="flex items-center gap-3 ml-auto">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                style={{ width: 34, height: 34, borderRadius: 999, background: 'rgba(244,241,232,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt={s.name} style={{ width: 16, height: 16, objectFit: 'contain' }} />
              </a>
            ))}
          </div>
        </div>

        <div style={{ height: 2, background: 'rgba(244,241,232,0.14)', margin: '28px 0' }} />

        <div className="flex flex-wrap justify-between gap-3" style={{ fontSize: 13, color: 'rgba(244,241,232,0.7)', fontWeight: 500 }}>
          <div>FEREST Development - Rio Grande Valley, TX</div>
          <div>Engineered By M2 Engineering, PLLC - TBPELS F-19545</div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ mobile contact bar */
function MobileContactBar() {
  return (
    <div className="sm:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(244,241,232,0.96)', backdropFilter: 'blur(10px)', borderTop: `2px solid ${C.goldDeep}`, padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <BtnWhatsApp href={WA_INFO} full><MessageCircle size={16} strokeWidth={2.4} /> Text Us</BtnWhatsApp>
      <BtnPrimary href={TEL} full><Phone size={15} strokeWidth={2.6} /> Call</BtnPrimary>
    </div>
  );
}
