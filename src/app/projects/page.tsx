'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin, Phone, MessageCircle, ArrowRight, ArrowUpRight, X, Search, Hammer, Compass,
} from 'lucide-react';
import {
  PIPELINE_ROWS, publicNameOf, PORTFOLIO, CONSTRUCTION, LAND_PIPELINE, type ProjectStatus,
} from '@/data/projects';

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
const WA_INFO = wa("Hi FEREST, I'd Like More Information.");

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
const MODEL_EXT = [
  '/models/ferest-model-ext-1.webp',
  '/models/ferest-model-ext-2.webp',
  '/models/ferest-model-ext-3.webp',
];
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
  lotOnlyPrice: number;
  moveInPrice?: number;
  street?: string;
}
const INVENTORY_LOTS: InventoryLot[] = [
  { id: 'lo-69', project: 'Laguna Oaks Phase II', city: 'Mission, TX', lotNumber: '69', sqft: 6000, lotOnlyPrice: 78000, moveInPrice: 10150, street: '809 La Laguna Rd' },
  { id: 'lo-70', project: 'Laguna Oaks Phase II', city: 'Mission, TX', lotNumber: '70', sqft: 6000, lotOnlyPrice: 78000, moveInPrice: 10150, street: '809 La Laguna Rd' },
  { id: 'lo-71', project: 'Laguna Oaks Phase II', city: 'Mission, TX', lotNumber: '71', sqft: 6000, lotOnlyPrice: 78000, moveInPrice: 10150, street: '809 La Laguna Rd' },
  { id: 'lh-38', project: 'Laguna Heights', city: 'Mission, TX', lotNumber: '38', sqft: 5000, lotOnlyPrice: 78000, street: 'Sundown Dr' },
  { id: 'lh-39', project: 'Laguna Heights', city: 'Mission, TX', lotNumber: '39', sqft: 5000, lotOnlyPrice: 78000, street: 'Sundown Dr' },
];

// Laguna Heights recorded plat - lot -> sqft. Prices carried exactly from site.
const PRICE_PSF = 11.75;
const LOTS_DATA: [number, number][] = [[1,7293],[2,6548],[3,6414],[4,6302],[5,6289],[6,6289],[7,6289],[8,6289],[9,6289],[10,6289],[11,6289],[12,6289],[13,6289],[14,6289],[15,6289],[16,6289],[17,6289],[18,6198],[19,5317],[20,9122],[21,5215],[22,5030],[23,5500],[24,5546],[25,5896],[26,6649],[27,7436],[28,7828],[29,5000],[30,5000],[31,5000],[32,5000],[33,5000],[34,5000],[35,5000],[36,5000],[37,5000],[38,5000],[39,5000],[40,5000],[41,5500],[42,5922],[43,5735],[44,5735],[45,5735],[46,5735],[47,5735],[48,5735],[49,5735],[50,5735],[51,5735],[52,5735],[53,5735],[54,5735],[55,5734],[56,5647],[57,6315],[58,6274],[59,6340],[60,8388],[61,5704],[62,5704],[63,5703],[64,5703],[65,5704],[66,5704],[67,5703],[68,5704],[69,5704],[70,5703],[71,5703],[72,5703],[73,5703],[74,5703],[75,5703],[76,5636],[77,6017],[78,5772],[79,5772],[80,5772],[81,5772],[82,5772],[83,5772],[84,5772],[85,5772],[86,5772],[87,5772],[88,5772],[89,5772],[90,5772],[91,5772],[92,5944],[93,5944],[94,5772],[95,5772],[96,5772],[97,5772],[98,5772],[99,5772],[100,5772],[101,5772],[102,5772],[103,5772],[104,5772],[105,5772],[106,5772],[107,5772],[108,5772],[109,5772],[110,5944],[111,5937],[112,5568],[113,5568],[114,5568],[115,5568],[116,5568],[117,5568],[118,5568],[119,5568],[120,5568],[121,5568],[122,5568],[123,5568],[124,5568],[125,5568],[126,5568],[127,5568],[128,5052],[129,5427],[130,8252],[131,6731],[132,6240],[133,5750],[134,5750],[135,5750],[136,5750],[137,5750],[138,5750],[139,5750],[140,6675],[141,5362],[142,5000]];
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
const STATUS_CHIP: Record<ProjectStatus, string> = {
  Selling: C.gold,
  Ready: C.goldHi,
  'In Design': C.paperDeep,
};
const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  available: 'Available', reserved: 'Reserved', sold: 'Sold',
};

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
        <BuyOrBuild showPlat={showPlat} setShowPlat={setShowPlat} />
        <Pipeline />
        <DesignBuild />
        <Portfolio />
        <OffMarket />
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
        <div className="flex items-center gap-3 sm:gap-4">
          <a href={LINKS.ferest} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND.mark} alt="FEREST" style={{ height: 30, width: 'auto' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND.wordmark} alt="FEREST" style={{ height: 15, width: 'auto' }} />
          </a>
          <span aria-hidden style={{ width: 2, height: 26, background: C.goldDeep, opacity: 0.5 }} />
          <a href={LINKS.m2} target="_blank" rel="noopener noreferrer" className="flex items-center" aria-label="M2 Engineering">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND.m2} alt="M2 Engineering" style={{ height: 26, width: 'auto' }} />
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-2.5">
          <BtnGhost href={WA_INFO} external><MessageCircle size={15} strokeWidth={2.4} /> Text Us</BtnGhost>
          <BtnPrimary href={CALENDLY} external><Phone size={14} strokeWidth={2.6} /> Book A Call</BtnPrimary>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Block 1 */
function BuyOrBuild({ showPlat, setShowPlat }: { showPlat: boolean; setShowPlat: (v: boolean) => void }) {
  return (
    <section id="buy" className="fade">
      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
          <SmartImg src={HERO_IMG} alt="" label="Laguna Heights" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(244,241,232,0.35) 0%, rgba(244,241,232,0.55) 55%, ${C.paper} 100%)` }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '84px 20px 40px' }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="label" style={{ color: C.goldDeep }}>Laguna Heights</span>
            <span aria-hidden style={{ width: 20, height: 2, background: C.goldDeep, opacity: 0.6 }} />
            <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>Mission, TX</span>
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(3.2rem, 10vw, 7rem)' }}>
            <span style={{ color: C.ink }}>Own The Lot.</span><br />
            <span className="gold-text">Build The Home.</span>
          </h1>
          <p style={{ marginTop: 22, fontSize: 'clamp(1rem, 2.4vw, 1.25rem)', fontWeight: 500, color: C.ink, maxWidth: 640 }}>
            27 Acres. 142 Lots. Platted, Entitled, And Engineered In-House.
          </p>
        </div>
      </div>

      {/* STAT STRIP */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '4px 20px 8px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatTile top="Starting In The" big="$60s" sub="Lot Pricing" />
          <StatTile top="Available Now" big={String(AVAIL_COUNT)} sub="Lots Ready" />
          <StatTile top="Lot Sizes" big={`${SQFT_MIN.toLocaleString()}-${SQFT_MAX.toLocaleString()}`} sub="Square Feet" />
        </div>
      </div>

      {/* FHA CALCULATOR */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 20px 8px' }}>
        <FhaCalculator />
      </div>

      {/* MODEL + OWNED LOTS */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px 8px' }}>
        <div className="mb-2"><span className="label" style={{ color: C.goldDeep }}>FEREST Owned - Ready To Build</span></div>
        <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: C.ink }}>The Home We Build</h2>
        <p style={{ marginTop: 10, fontSize: 15, color: C.inkSoft, maxWidth: 620, fontWeight: 500 }}>
          Lots FEREST owns across Laguna Oaks Phase II and Laguna Heights. Take the lot flat, or let us build this model on it. Not on MLS.
        </p>

        {/* interior peek */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {MODEL_INT.map((src) => (
            <SmartImg key={src} src={src} alt="FEREST model home interior" label="Model Interior"
              style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 14, border: `2px solid ${C.border}` }} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {INVENTORY_LOTS.map((lot, i) => <OwnedLotCard key={lot.id} lot={lot} heroIndex={i % 3} />)}
        </div>

        {/* See all lots toggle */}
        <div className="flex justify-center mt-8">
          <BtnGhost onClick={() => setShowPlat(!showPlat)}>
            {showPlat ? 'Hide The Plat' : `See All ${AVAIL_COUNT} Lots`}
            <ArrowRight size={15} strokeWidth={2.6} style={{ transform: showPlat ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .2s' }} />
          </BtnGhost>
        </div>
      </div>

      {showPlat && <PlatDirectory />}
    </section>
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
function OwnedLotCard({ lot, heroIndex }: { lot: InventoryLot; heroIndex: number }) {
  const reserveHref = wa(`Hi FEREST, I Want To Reserve Lot ${lot.lotNumber} At ${lot.project}.`);
  const hasMoveIn = typeof lot.moveInPrice === 'number';
  return (
    <article style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative' }}>
        <SmartImg src={MODEL_EXT[heroIndex]} alt={`FEREST model at ${lot.project}`} label="Model Home"
          style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
        <span className="label" style={{ position: 'absolute', top: 12, left: 12, background: C.gold, color: '#1A160A', padding: '5px 10px', borderRadius: 999, fontSize: 10 }}>
          FEREST Owned
        </span>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>{lot.project} - {lot.city}</div>
        <div className="display flex items-baseline gap-2" style={{ fontSize: 34, color: C.ink, marginTop: 2 }}>
          Lot {lot.lotNumber}
          <span style={{ fontFamily: 'var(--font-oswald)', fontSize: 13, fontWeight: 600, color: C.inkSoft, textTransform: 'none', letterSpacing: 0 }}>
            {lot.sqft.toLocaleString()} Sqft
          </span>
        </div>
        {lot.street && (
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.inkSoft, fontWeight: 500, marginTop: 4 }}>
            <MapPin size={12} strokeWidth={2} /> {lot.street}
          </div>
        )}
        <div style={{ marginTop: 14, borderTop: `2px solid ${C.border}`, paddingTop: 14 }}>
          <div className="num flex items-baseline gap-2" style={{ fontSize: 26, color: C.ink }}>
            {money(lot.lotOnlyPrice)}
            <span style={{ fontFamily: 'var(--font-oswald)', fontSize: 13, fontWeight: 600, color: C.inkSoft }}>Flat</span>
          </div>
          {hasMoveIn && (
            <div style={{ marginTop: 8, background: C.paper, border: `2px solid ${C.goldDeep}`, borderRadius: 10, padding: '8px 12px' }}>
              <div className="label" style={{ color: C.goldDeep, fontSize: 9 }}>Or Move In For As Little As</div>
              <div className="num" style={{ fontSize: 22, color: C.goldDeep, lineHeight: 1, marginTop: 2 }}>{money(lot.moveInPrice as number)}</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <BtnPrimary href={reserveHref} external full>Reserve Lot {lot.lotNumber} <ArrowRight size={15} strokeWidth={2.6} /></BtnPrimary>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ plat + directory */
function PlatDirectory() {
  const [selected, setSelected] = useState<PortalLot | null>(null);
  const [availOnly, setAvailOnly] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('num');

  const shown = useMemo(() => {
    let arr = LOTS;
    if (availOnly) arr = arr.filter((l) => l.status === 'available');
    if (query.trim()) arr = arr.filter((l) => String(l.n).includes(query.trim()));
    arr = [...arr];
    if (sort === 'num') arr.sort((a, b) => a.n - b.n);
    if (sort === 'priceup') arr.sort((a, b) => a.price - b.price);
    if (sort === 'size') arr.sort((a, b) => b.sqft - a.sqft);
    return arr;
  }, [availOnly, query, sort]);

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
          {availOnly ? 'Available Only' : 'Show All 142'}
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
        Prices carried from the recorded plat. Availability updates as lots move.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Block 2 pipeline */
function Pipeline() {
  return (
    <section id="building" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 20px 8px' }}>
      <span className="label" style={{ color: C.goldDeep }}>Subdivision Pipeline</span>
      <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', color: C.ink, marginTop: 8 }}>From Raw Acres To Rooftops.</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 620 }}>
        What FEREST controls across the Valley, engineered and entitled in-house. Reach out for the detail on any one.
      </p>

      <div style={{ marginTop: 28, border: `2px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', background: C.card }}>
        {PIPELINE_ROWS.map((p, i) => (
          <div key={p.id} className="row-link flex items-center justify-between gap-4 flex-wrap"
            style={{ padding: '18px 20px', borderTop: i === 0 ? 'none' : `2px solid ${C.border}` }}>
            <div>
              <div className="display" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', color: C.ink }}>{publicNameOf(p)}</div>
              <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 2 }}>
                <MapPin size={13} strokeWidth={2} /> {p.city}
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="label" style={{ background: C.ink, color: C.paper, padding: '6px 12px', borderRadius: 999, fontSize: 10 }}>
                {p.devType}
              </span>
              {p.stats.slice(0, 3).map((s) => (
                <span key={s.label} style={{ background: C.paper, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.ink }}>
                  <span className="num" style={{ fontSize: 14 }}>{s.value}</span> <span style={{ color: C.inkSoft }}>{s.label}</span>
                </span>
              ))}
              <span className="label" style={{ background: STATUS_CHIP[p.status], color: '#1A160A', padding: '6px 12px', borderRadius: 999, fontSize: 10 }}>
                {p.status}
              </span>
            </div>
          </div>
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
    <section id="build" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 20px 8px' }}>
      <span className="label" style={{ color: C.goldDeep }}>Design + Build</span>
      <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', color: C.ink, marginTop: 8 }}>Under Construction Across The Valley.</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 620 }}>
        We do not just sell the dirt - we build on it. Homes going up now, plus commercial spaces we have designed and delivered.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
        {CONSTRUCTION.map((b) => (
          <article key={b.id} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <SmartImg src={b.image} alt={b.name} label={b.name}
                style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }} />
              <span className="label" style={{ position: 'absolute', top: 12, left: 12, background: b.type === 'Home' ? C.gold : C.ink, color: b.type === 'Home' ? '#1A160A' : C.paper, padding: '5px 10px', borderRadius: 999, fontSize: 10 }}>
                {b.type === 'Home' ? <Hammer size={10} strokeWidth={2.6} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 5 }} /> : null}
                {b.type}
              </span>
              {b.status && (
                <span className="label" style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(18,19,16,0.7)', color: C.paper, padding: '5px 10px', borderRadius: 999, fontSize: 9 }}>
                  {b.status}
                </span>
              )}
            </div>
            <div style={{ padding: 18 }}>
              <div className="display" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', color: C.ink }}>{b.name}</div>
              <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 3 }}>
                <MapPin size={13} strokeWidth={2} /> {b.location}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ portfolio */
function Portfolio() {
  return (
    <section id="portfolio" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 20px 8px' }}>
      <span className="label" style={{ color: C.goldDeep }}>Platted &amp; Engineered By Our Team</span>
      <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: C.ink, marginTop: 8 }}>The Track Record.</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 640 }}>
        Subdivisions our team designed, platted, and engineered across the Valley. Filed under M2 Engineering, PLLC, TBPELS F-19545.
      </p>
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
    <section id="offmarket" style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 20px' }}>
      <div style={{ background: C.paperDeep, border: `2px solid ${C.border}`, borderRadius: 18, padding: 'clamp(28px, 6vw, 48px)' }}>
        <span className="label" style={{ color: C.goldDeep }}>For Builders &amp; Investors</span>
        <p className="display" style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)', color: C.ink, marginTop: 10, maxWidth: 780 }}>
          We Control Off-Market Dirt Across The Valley - Engineered, Entitled, Or Shovel-Ready.
        </p>

        {/* land pipeline teaser - names only, detail lives in the deal sheet */}
        <div className="flex flex-wrap gap-2.5 mt-6">
          {LAND_PIPELINE.map((d) => (
            <span key={d.id} className="inline-flex items-center gap-2" style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: C.ink }}>
              <Compass size={13} color={C.goldDeep} strokeWidth={2.2} />
              <span className="num" style={{ fontSize: 14 }}>{d.area}</span>
              <span style={{ color: C.inkSoft }}>{d.city}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-7">
          <BtnGhost href={wa('Hi FEREST, Send Me The Off-Market Deal Sheet.')} external>
            Request The Deal Sheet <ArrowRight size={15} strokeWidth={2.6} />
          </BtnGhost>
          <a href={wa('Hi FEREST, I Want To Feature My Project.')} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 14, fontWeight: 600, color: C.inkSoft, alignSelf: 'center', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Or List Your Project
          </a>
        </div>
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
