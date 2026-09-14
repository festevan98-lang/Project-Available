'use client';

/*
  Conway duplex site - our own listing page (no third-party realtor links).
  Facts carried from the public MLS listing (487215) and the FEREST concept
  layout (TBPELS F-27520). Share: projects.ferest.dev/conway
*/

import React, { useState } from 'react';
import {
  MapPin, Phone, MessageCircle, ArrowRight, Landmark, Droplets, FileCheck, Map as MapIcon,
} from 'lucide-react';

const CALENDLY = 'https://calendly.com/ferest-info/30min';
const WA_BASE = 'https://wa.me/19562030003';
const TEL = 'tel:+19562030003';
const wa = (text: string) => `${WA_BASE}?text=${encodeURIComponent(text)}`;
const WA_CONWAY = wa('Hey FEREST, I Want The Conway Duplex Site Numbers.');

const BRAND = { mark: '/brand/ferest-mark.webp', wordmark: '/brand/ferest-wordmark.webp' };
const LAYOUT_IMG = '/plats/conway-layout.png';

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

export default function ConwayClient() {
  const [layoutOk, setLayoutOk] = useState(true);

  return (
    <div style={{ background: C.paper, minHeight: '100vh', color: C.ink }}>
      <style>{`
        .cw * { box-sizing: border-box; }
        .cw .display { font-family: var(--font-anton); text-transform: uppercase; line-height: 0.94; letter-spacing: 0.01em; }
        .cw .num { font-family: var(--font-anton); letter-spacing: 0.01em; }
        .cw .label { font-family: var(--font-oswald); font-weight: 700; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; }
        .cw { font-family: var(--font-oswald); }
        .cw .grid-bg { background-image:
          linear-gradient(rgba(120,125,110,0.10) 1px, transparent 1px),
          linear-gradient(90deg, rgba(120,125,110,0.10) 1px, transparent 1px);
          background-size: 26px 26px; }
        @media (max-width: 640px) { .cw .pad-bar { padding-bottom: 84px; } }
      `}</style>

      <div className="cw grid-bg pad-bar">
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
              <Btn kind="ghost" href={WA_CONWAY}><MessageCircle size={15} strokeWidth={2.4} /> Text Us</Btn>
              <Btn href={CALENDLY}><Phone size={14} strokeWidth={2.6} /> Book A Call</Btn>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>
          {/* hero */}
          <section style={{ padding: '48px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="label" style={{ color: C.goldDeep }}>For Sale - The Whole Site</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
                One Buyer Takes All 48 Lots
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(2.8rem, 8.5vw, 5.2rem)', marginTop: 12 }}>
              <span style={{ color: C.ink }}>The Conway</span>{' '}
              <span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.goldDeep})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Duplex Site.</span>
            </h1>
            <p style={{ marginTop: 14, fontSize: 16, fontWeight: 500, color: C.inkSoft, maxWidth: 660, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} strokeWidth={2.2} /> N Conway Ave At Mile 3 (Buddy Owens Blvd), Mission, TX - 9.15 Acres.
            </p>

            {/* price banner */}
            <div style={{ marginTop: 24, background: C.card, border: `3px solid ${C.goldDeep}`, borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="label" style={{ color: C.goldDeep, fontSize: 10 }}>Asking Price</div>
                <div className="num" style={{ fontSize: 'clamp(2.6rem, 8vw, 3.8rem)', lineHeight: 0.94, marginTop: 6 }}>$1,350,000</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.inkSoft, marginTop: 8 }}>Short-Term Owner Financing Available. Ask Us How.</div>
              </div>
              <Btn kind="wa" href={WA_CONWAY}>Get The Numbers <ArrowRight size={15} strokeWidth={2.6} /></Btn>
            </div>

            {/* stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
              {[
                { top: 'Duplex Lots', big: '48', sub: 'Concept Layout Done' },
                { top: 'Units Possible', big: '96', sub: 'Two Per Lot' },
                { top: 'Land', big: '9.15', sub: 'Acres On Conway (SH 107)' },
              ].map((t) => (
                <div key={t.top} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
                  <div className="label" style={{ color: C.goldDeep, fontSize: 10 }}>{t.top}</div>
                  <div className="num" style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', lineHeight: 0.96, marginTop: 6 }}>{t.big}</div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </section>

          {/* what is already done */}
          <section style={{ padding: '36px 0 0' }}>
            <span className="label" style={{ color: C.goldDeep }}>Work Already Done</span>
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', marginTop: 8 }}>You Skip The Slow Part.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginTop: 20 }}>
              {[
                { icon: FileCheck, title: 'Feasibility Complete', body: 'The homework on this dirt is done and it checks out.' },
                { icon: MapIcon, title: 'Concept Layout Drawn', body: '48-lot utility layout by FEREST, TBPELS F-27520.' },
                { icon: Droplets, title: 'City Sewer Available', body: 'Tie in to the City of Mission sewer system.' },
                { icon: Landmark, title: 'No Rezoning Required', body: 'ETJ location - build duplex, flex, commercial, or single-family.' },
              ].map((w) => (
                <div key={w.title} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <w.icon size={22} color={C.goldDeep} strokeWidth={2.2} />
                  <div style={{ fontWeight: 700, fontSize: 19, color: C.ink, marginTop: 10 }}>{w.title}</div>
                  <p style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500, marginTop: 6, lineHeight: 1.5 }}>{w.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* layout */}
          {layoutOk && (
            <section style={{ padding: '36px 0 0' }}>
              <span className="label" style={{ color: C.goldDeep }}>The Layout</span>
              <div style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.card, padding: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LAYOUT_IMG} alt="Conway duplex site concept layout" style={{ width: '100%', display: 'block', borderRadius: 10 }}
                  onError={() => setLayoutOk(false)} />
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
                Proposed Concept Layout By FEREST (TBPELS F-27520) - For Review Only, Not For Construction. Final Design Is The Buyer's Call.
              </div>
            </section>
          )}

          {/* why this corner */}
          <section style={{ padding: '36px 0 0' }}>
            <div style={{ background: C.paperDeep, border: `2px solid ${C.border}`, borderRadius: 18, padding: 'clamp(20px, 4vw, 28px)' }}>
              <span className="label" style={{ color: C.goldDeep }}>Why This Corner</span>
              <p className="display" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: C.ink, marginTop: 8, maxWidth: 780 }}>
                H-E-B And Walmart Are Minutes Away. Mission Keeps Growing North.
              </p>
              <p style={{ marginTop: 10, fontSize: 15, color: C.inkSoft, fontWeight: 500, maxWidth: 700, lineHeight: 1.5 }}>
                Frontage life on the Conway (SH 107) corridor at Mile 3, surrounded by the retail
                that renters want to live near. Rentals, flex, commercial, or houses - the dirt
                does not lock you in.
              </p>
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
          <Btn kind="wa" full href={WA_CONWAY}>
            <MessageCircle size={15} strokeWidth={2.4} /> Text Us
          </Btn>
          <Btn full href={TEL}><Phone size={14} strokeWidth={2.6} /> Call</Btn>
        </div>
      </div>
    </div>
  );
}
