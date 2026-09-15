'use client';

/*
  Gems Creek - shareable info page for a client development.
  Development by Elite Development; listed with Gema Hernandez (GEMS Real
  Estate Group); engineering by M2 Engineering. All buyer contact goes
  through FEREST's number.
  Lot availability is carried from the official Gems Creek flyer
  (updated 2026-09-15) - update RESERVED below when a new flyer drops.
  Share: projects.ferest.dev/gems-creek
*/

import React, { useMemo, useState } from 'react';
import {
  MapPin, Phone, MessageCircle, ArrowRight, Landmark, Store, CalendarCheck, Hammer, X,
} from 'lucide-react';

const CALENDLY = 'https://calendly.com/ferest-info/30min';
const WA_BASE = 'https://wa.me/19562030003';
const TEL = 'tel:+19562030003';
const wa = (text: string) => `${WA_BASE}?text=${encodeURIComponent(text)}`;
const WA_GEMS = wa('Hey FEREST, Send Me Info On Gems Creek.');

const BRAND = { mark: '/brand/ferest-mark.webp', wordmark: '/brand/ferest-wordmark.webp', m2: '/brand/m2-logo.webp' };
const PLAT_IMG = '/plats/gems-creek.png';

/* ---- availability, carried from the flyer (2026-09-15) ---- */
// Residential lots are 4-87 (84 lots). Commercial pads are Lots 1-3.
const RESERVED = new Set<number>([
  4, 5, 6, 9, 10,
  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  40, 41, 42, 43, 44, 45, 46,
  52, 53, 54, 55, 56,
]);
const RES_LOTS: number[] = Array.from({ length: 84 }, (_, i) => i + 4);
const AVAIL = RES_LOTS.filter((n) => !RESERVED.has(n));
const COMMERCIAL = [
  { n: 1, acres: '1.000', sqft: '43,560' },
  { n: 2, acres: '0.997', sqft: '43,428' },
  { n: 3, acres: '1.302', sqft: '56,698' },
];

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

/** Partner logo tile - hides itself until the file exists in /public/brand. */
function PartnerLogo({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setOk(false)}
      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 12, border: `2px solid ${C.border}`, background: '#0B0B0B', display: 'block' }} />
  );
}

export default function GemsClient() {
  const [platOk, setPlatOk] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [availOnly, setAvailOnly] = useState(true);

  const shown = useMemo(
    () => (availOnly ? RES_LOTS.filter((n) => !RESERVED.has(n)) : RES_LOTS),
    [availOnly],
  );

  return (
    <div style={{ background: C.paper, minHeight: '100vh', color: C.ink }}>
      <style>{`
        .gc * { box-sizing: border-box; }
        .gc .display { font-family: var(--font-anton); text-transform: uppercase; line-height: 0.94; letter-spacing: 0.01em; }
        .gc .num { font-family: var(--font-anton); letter-spacing: 0.01em; }
        .gc .label { font-family: var(--font-oswald); font-weight: 700; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; }
        .gc { font-family: var(--font-oswald); }
        .gc .grid-bg { background-image:
          linear-gradient(rgba(120,125,110,0.10) 1px, transparent 1px),
          linear-gradient(90deg, rgba(120,125,110,0.10) 1px, transparent 1px);
          background-size: 26px 26px; }
        .gc .fade { animation: gcfade .25s ease; }
        @keyframes gcfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .gc .tile:hover:not(:disabled) { transform: translateY(-1px); }
        @media (max-width: 640px) { .gc .pad-bar { padding-bottom: 84px; } }
      `}</style>

      <div className="gc grid-bg pad-bar">
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
              <Btn kind="ghost" href={WA_GEMS}><MessageCircle size={15} strokeWidth={2.4} /> Text Us</Btn>
              <Btn href={CALENDLY}><Phone size={14} strokeWidth={2.6} /> Book A Call</Btn>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>
          {/* hero */}
          <section style={{ padding: '48px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="label" style={{ color: C.goldDeep }}>Client Project</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
                <Hammer size={12} strokeWidth={2.4} /> Under Construction Now
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
                Availability As Of Sept 15
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(3rem, 9vw, 5.6rem)', marginTop: 12 }}>
              <span style={{ color: C.ink }}>Gems</span>{' '}
              <span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.goldDeep})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Creek.</span>
            </h1>
            <p style={{ marginTop: 14, fontSize: 16, fontWeight: 500, color: C.inkSoft, maxWidth: 660, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} strokeWidth={2.2} /> City Of Alton, TX - 19.40 Acres Off S. Alton Blvd (SH 107). Streets Going In Now.
            </p>

            {/* partners - front and center */}
            <div style={{ marginTop: 18, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <PartnerLogo src="/brand/elite-logo.png" alt="Elite Development" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="label" style={{ fontSize: 9, color: C.goldDeep }}>Development By</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Elite Development</span>
                </div>
              </div>
              <span aria-hidden style={{ width: 1, height: 34, background: C.border }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <PartnerLogo src="/brand/gems-logo.png" alt="GEMS Real Estate Group" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="label" style={{ fontSize: 9, color: C.goldDeep }}>Listed With</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Gema Hernandez, Realtor - GEMS Real Estate Group</span>
                </div>
              </div>
              <span aria-hidden style={{ width: 1, height: 34, background: C.border }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="label" style={{ fontSize: 9, color: C.goldDeep }}>Engineering By</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BRAND.m2} alt="M2 Engineering" style={{ height: 30, width: 'auto', display: 'block' }} />
                  <span className="label" style={{ fontSize: 9, color: C.inkSoft }}>TBPELS F-19545</span>
                </span>
              </div>
            </div>

            {/* live-style counts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
              {[
                { top: 'Available Now', big: String(AVAIL.length), sub: 'Residential Lots Open' },
                { top: 'Already Taken', big: String(RESERVED.size), sub: 'Reserved Or Sold' },
                { top: 'Commercial', big: '3', sub: 'Pads On S. Alton Blvd' },
              ].map((t) => (
                <div key={t.top} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
                  <div className="label" style={{ color: C.goldDeep, fontSize: 10 }}>{t.top}</div>
                  <div className="num" style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', lineHeight: 0.96, marginTop: 6 }}>{t.big}</div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>{t.sub}</div>
                </div>
              ))}
            </div>

            {/* reserve banner */}
            <div style={{ marginTop: 16, background: C.card, border: `2px solid ${C.goldDeep}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div className="label" style={{ color: C.goldDeep, fontSize: 10 }}>Early Pricing - It Ends When The Streets Are Paved</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 4 }}>
                  Lots From $65,000. Hold Any Open Lot With A $1,000 Reservation.
                </div>
              </div>
              <Btn kind="wa" href={wa('Hey FEREST, I Want To Reserve A Lot At Gems Creek.')}>
                <CalendarCheck size={15} strokeWidth={2.4} /> Reserve A Lot
              </Btn>
            </div>
          </section>

          {/* plat first - see the neighborhood, then pick the lot */}
          {platOk && (
            <section style={{ padding: '32px 0 0' }}>
              <span className="label" style={{ color: C.goldDeep }}>The Layout</span>
              <div style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.card, padding: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PLAT_IMG} alt="Gems Creek Subdivision Layout" style={{ width: '100%', display: 'block', borderRadius: 10 }}
                  onError={() => setPlatOk(false)} />
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
                Recorded Plat By M2 Engineering. Commercial Pads Front S. Alton Blvd (SH 107). Find Your Lot Below.
              </div>
            </section>
          )}

          {/* lot directory */}
          <section style={{ padding: '32px 0 0' }}>
            <span className="label" style={{ color: C.goldDeep }}>Pick Your Lot</span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
              <button onClick={() => setAvailOnly(!availOnly)}
                style={{ background: availOnly ? C.gold : C.card, color: availOnly ? '#1A160A' : C.inkSoft, border: `2px solid ${availOnly ? C.goldDeep : C.border}`, borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', letterSpacing: '0.05em', minHeight: 44 }}>
                {availOnly ? 'Available Only' : 'Show All 84'}
              </button>
              <div style={{ marginLeft: 'auto', fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
                <span style={{ color: C.ink }}>{shown.length}</span> {availOnly ? 'Available' : 'Shown'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 8, marginTop: 14 }}>
              {shown.map((n) => {
                const taken = RESERVED.has(n);
                const isSel = selected === n;
                return (
                  <button key={n} className="tile" disabled={taken} onClick={() => setSelected(n)}
                    aria-label={`Lot ${n}, ${taken ? 'reserved' : 'available'}`}
                    style={{ background: taken ? C.paperDeep : isSel ? C.gold : C.card, color: taken ? C.inkSoft : C.ink, border: `2px solid ${isSel ? C.goldDeep : C.border}`, borderRadius: 10, padding: '12px 6px', textAlign: 'center', cursor: taken ? 'default' : 'pointer', opacity: taken ? 0.65 : 1, fontFamily: 'var(--font-oswald)', WebkitTapHighlightColor: 'transparent' }}>
                    <div className="num" style={{ fontSize: 19, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7, marginTop: 3 }}>{taken ? 'Taken' : 'Open'}</div>
                  </button>
                );
              })}
            </div>

            {selected && !RESERVED.has(selected) && (
              <div className="fade" style={{ marginTop: 16, background: C.card, border: `2px solid ${C.goldDeep}`, borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <span className="label" style={{ color: C.goldDeep }}>Gems Creek</span>
                    <div className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginTop: 2 }}>Lot {selected}</div>
                    <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 2 }}>
                      From $65,000 · Hold It With $1,000 · Exact Price Confirmed When You Reach Out
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} aria-label="Close" style={{ color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={22} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                  <Btn kind="wa" href={wa(`Hey FEREST, I Want Lot ${selected} At Gems Creek. Is It Still Open?`)}>
                    Claim Lot {selected} <ArrowRight size={15} strokeWidth={2.6} />
                  </Btn>
                  <Btn kind="ghost" href={CALENDLY}><Phone size={14} strokeWidth={2.4} /> Book A Call</Btn>
                </div>
              </div>
            )}

            <div style={{ marginTop: 14, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
              Availability Carried From The Official Flyer, Sept 15. Confirmed Live When You Reach Out.
            </div>
          </section>

          {/* commercial pads */}
          <section style={{ padding: '32px 0 0' }}>
            <span className="label" style={{ color: C.goldDeep }}>Commercial Pads</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 12 }}>
              {COMMERCIAL.map((c) => (
                <div key={c.n} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <Store size={20} color={C.goldDeep} strokeWidth={2.2} />
                  <div className="display" style={{ fontSize: '1.4rem', marginTop: 8 }}>Lot {c.n}</div>
                  <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>{c.acres} Acres · {c.sqft} Sqft · Fronts S. Alton Blvd</div>
                  <div style={{ marginTop: 12 }}>
                    <Btn kind="ghost" href={wa(`Hey FEREST, Tell Me About Commercial Lot ${c.n} At Gems Creek.`)}>Ask About It <ArrowRight size={13} strokeWidth={2.6} /></Btn>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* who it's for */}
          <section style={{ padding: '40px 0 8px' }}>
            <span className="label" style={{ color: C.goldDeep }}>Who This Is For</span>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', marginTop: 8 }}>Builders. Investors. Families.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 20 }}>
              {[
                { icon: Hammer, title: 'For Builders', body: 'Shovel-ready inventory in the City of Alton. Take lots in blocks and start when the streets are done.', cta: 'Builder Pricing', msg: 'Hey FEREST, I Am A Builder - Send Me Gems Creek Lot Pricing.' },
                { icon: Landmark, title: 'For Investors', body: 'Early pricing while the community is still under construction. Reserve now, close as it delivers.', cta: 'Early Pricing', msg: 'Hey FEREST, Send Me Gems Creek Early Pricing.' },
                { icon: Store, title: 'Commercial Pads', body: 'Three commercial sites up to 1.302 acres at the community entrance. One conversation to hold one.', cta: 'Ask About Pads', msg: 'Hey FEREST, Tell Me About The Gems Creek Commercial Pads.' },
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
          </section>

          {/* credits */}
          <section style={{ padding: '36px 0 0' }}>
            <div style={{ background: C.paperDeep, border: `2px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>
                A Development By <span style={{ color: C.ink }}>Elite Development</span> · Listed With <span style={{ color: C.ink }}>Gema Hernandez, Realtor - GEMS Real Estate Group</span>
              </div>
              <span aria-hidden style={{ width: 1, height: 18, background: C.border }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>Engineered By</span>
                <a href="https://m2engineers.com" target="_blank" rel="noopener noreferrer" aria-label="M2 Engineering">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BRAND.m2} alt="M2 Engineering" style={{ height: 18, width: 'auto', display: 'block' }} />
                </a>
                <span className="label" style={{ fontSize: 9, color: C.goldDeep }}>TBPELS F-19545</span>
              </div>
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
          <Btn kind="wa" full href={WA_GEMS}>
            <MessageCircle size={15} strokeWidth={2.4} /> Text Us
          </Btn>
          <Btn full href={TEL}><Phone size={14} strokeWidth={2.6} /> Call</Btn>
        </div>
      </div>
    </div>
  );
}
