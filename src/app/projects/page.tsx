'use client';

import React, { useState, useMemo } from "react";
import {
  MapPin, Home, Ruler, BedDouble, Bath, Check, Phone, Calculator,
  ShieldCheck, X, ArrowRight, Building2, Layers, Clock, Star, Plus, Hammer, Search, MessageCircle
} from "lucide-react";

/*
  FEREST PORTAL — Laguna Heights buyer surface.
  Restrained dark-editorial treatment. Gold reserved for CTAs and key numbers only.
  Real PDF plat as the visual anchor.
*/

// Master gate for "Lot + build" UI. Per-lot pricing is controlled by BUILDABLE_LOTS below.
const SHOW_FINANCING = process.env.NEXT_PUBLIC_SHOW_FINANCING === 'true';

const CONTACT_URL = "https://calendly.com/ferest-info/30min";

// Format: digits only, with country code. wa.me opens WhatsApp chat directly.
const WHATSAPP_NUMBER = "19562030003";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FEREST, I'm looking at Laguna Heights — would love to chat.")}`;

const LOGO_MARK = "/ferest-logo.png";
const PLAT_IMG = "/plats/laguna-heights-plat.png";
const HERO_IMG = "/plats/laguna-heights-hero.jpg";

// Per-lot build-inventory configuration.
// Only lots in this map show the "Lot + build a home" option AND use these flat prices instead of the
// universal $/sqft rate. Add an entry per lot you actually own and want to sell as a build package.
//
// Example (Laguna Oaks 69, 70, 71 inventory):
//   "70": { lotOnly: 78000, buildPackageLot: 65000, buildPerSqft: 115 },
//   "71": { lotOnly: 78000, buildPackageLot: 65000, buildPerSqft: 115 },
//
// (These are Laguna Oaks lots, kept as inline example. Laguna Heights gets its own entries below.)
interface BuildableLotConfig {
  lotOnly: number;
  buildPackageLot: number;
  buildPerSqft: number;
}
const BUILDABLE_LOTS: Record<string, BuildableLotConfig> = {
  // Empty for Laguna Heights right now. Add entries here per lot you actually own.
};

const T = {
  ink: "#0a0b09",
  panel: "#15161412",
  panelSolid: "#15161e",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  text: "#f8f8f6",
  dim: "rgba(248,248,246,0.55)",
  dimmer: "rgba(248,248,246,0.38)",
  gold: "#e0b64a",
  goldSoft: "rgba(224,182,74,0.12)",
  green: "#4fb15e", amber: "#e0a93b", sold: "#a06257",
};

const TAGLINE = "Raw Land · Rooftops · Revenue";
const TIMELINES = ["Ready to move now", "Within 1-3 months", "3-6 months", "Just exploring"];
const PRICE_PSF = 11.75;

const SUBDIVISION = {
  name: "Laguna Heights",
  location: "Mission, TX",
  blurb: "Twenty-seven acres of the West Addition to Sharyland, platted into 142 lots and engineered in-house. Buy land. Build later. Or build with us now.",
};

const PLANS = [
  { id: "p1", name: "The Palma", beds: 3, baths: 2.5, sqft: 1034, build: 150000 },
  { id: "p2", name: "The Sabal", beds: 3, baths: 2.5, sqft: 1244, build: 178000 },
  { id: "p3", name: "The Laguna", beds: 4, baths: 2.5, sqft: 1347, build: 195000 },
];

type LotStatus = 'available' | 'reserved' | 'sold';
interface PortalLot { id: string; n: number; sqft: number; price: number; status: LotStatus; }

const LOTS_DATA: [number, number][] = [[1,7293],[2,6548],[3,6414],[4,6302],[5,6289],[6,6289],[7,6289],[8,6289],[9,6289],[10,6289],[11,6289],[12,6289],[13,6289],[14,6289],[15,6289],[16,6289],[17,6289],[18,6198],[19,5317],[20,9122],[21,5215],[22,5030],[23,5500],[24,5546],[25,5896],[26,6649],[27,7436],[28,7828],[29,5000],[30,5000],[31,5000],[32,5000],[33,5000],[34,5000],[35,5000],[36,5000],[37,5000],[38,5000],[39,5000],[40,5000],[41,5500],[42,5922],[43,5735],[44,5735],[45,5735],[46,5735],[47,5735],[48,5735],[49,5735],[50,5735],[51,5735],[52,5735],[53,5735],[54,5735],[55,5734],[56,5647],[57,6315],[58,6274],[59,6340],[60,8388],[61,5704],[62,5704],[63,5703],[64,5703],[65,5704],[66,5704],[67,5703],[68,5704],[69,5704],[70,5703],[71,5703],[72,5703],[73,5703],[74,5703],[75,5703],[76,5636],[77,6017],[78,5772],[79,5772],[80,5772],[81,5772],[82,5772],[83,5772],[84,5772],[85,5772],[86,5772],[87,5772],[88,5772],[89,5772],[90,5772],[91,5772],[92,5944],[93,5944],[94,5772],[95,5772],[96,5772],[97,5772],[98,5772],[99,5772],[100,5772],[101,5772],[102,5772],[103,5772],[104,5772],[105,5772],[106,5772],[107,5772],[108,5772],[109,5772],[110,5944],[111,5937],[112,5568],[113,5568],[114,5568],[115,5568],[116,5568],[117,5568],[118,5568],[119,5568],[120,5568],[121,5568],[122,5568],[123,5568],[124,5568],[125,5568],[126,5568],[127,5568],[128,5052],[129,5427],[130,8252],[131,6731],[132,6240],[133,5750],[134,5750],[135,5750],[136,5750],[137,5750],[138,5750],[139,5750],[140,6675],[141,5362],[142,5000]];
const RESERVED = new Set<number>([]);
const SOLD = new Set<number>([18,22,23,24,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,70,73,74,75,77,78,91,92,93,94,95,96,97,98,99,100,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,133,134,137]);

const LOTS: PortalLot[] = LOTS_DATA.map(([n, sqft]) => ({
  id: String(n), n, sqft,
  price: Math.round(sqft * PRICE_PSF * 100) / 100,
  status: SOLD.has(n) ? "sold" : RESERVED.has(n) ? "reserved" : "available",
}));
const FROM_PRICE = Math.min(...LOTS.filter((l) => l.status === "available").map((l) => l.price));

const PIPELINE = [
  { id: "ad2", name: "Angelica's Dream V2", loc: "Weslaco · Border Ave", units: "47 single-family lots", stage: "In Design · For Sale", eta: "Q3 2026", from: 315000 },
  { id: "lmc", name: "Los Milagros on Conway", loc: "Conway Ave & SH 107 · Mission, TX", units: "48 lots · 96 duplex units", stage: "Engineering", eta: "Q1 2027", from: 1250000 },
  { id: "aug", name: "Augusta Townhomes", loc: "Golf Course · Mission, TX", units: "Townhome community", stage: "Entitlement", eta: "TBD", from: 0 },
];
const PARTNERS = [
  {
    id: "pecan",
    name: "Pecan Heights",
    builder: "Sisu Development",
    loc: "McAllen, TX",
    units: "14 modern townhomes · 3 BR / 2.5 BA · 1,474 sf",
    from: 275000,
    featured: true,
    slot: false,
    url: "https://sisudevelopment.com/pecan-heights/",
  },
  { id: "ext", name: "Your project here", builder: "Open feature slot", loc: "RGV", units: "", from: 0, featured: false, slot: true, url: "" },
];

const money = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function monthlyPI(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12, n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
const STATUS_META: Record<LotStatus, { label: string; color: string }> = {
  available: { label: "Available", color: T.green },
  reserved: { label: "Reserved", color: T.amber },
  sold: { label: "Sold", color: T.sold },
};
const STAGE_COLOR: Record<string, string> = { "Selling Soon": T.green, "In Design · For Sale": T.green, "Under Construction": T.gold, "Engineering": T.gold, "Entitlement": T.dim };
const TABS = [
  { id: "now", label: "Available Now", icon: Home },
  { id: "pipeline", label: "Pipeline", icon: Layers },
  { id: "partners", label: "Partner Projects", icon: Building2 },
];

export default function App() {
  const [tab, setTab] = useState("now");
  const [selectedLot, setSelectedLot] = useState<PortalLot | null>(null);
  const [productMode, setProductMode] = useState<'lot' | 'build'>("lot");
  const [planId, setPlanId] = useState("p1");
  const [filterAvail, setFilterAvail] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("num");

  const [financeMode, setFinanceMode] = useState<'bank' | 'owner'>("bank");
  const [down, setDown] = useState(0);
  const [rate, setRate] = useState(6.75);
  const [term, setTerm] = useState(30);
  const setMode = (m: 'bank' | 'owner') => {
    setFinanceMode(m);
    if (m === "bank") { setDown(0); setRate(6.75); setTerm(30); }
    else { setDown(10); setRate(9.9); setTerm(20); }
  };

  const [lead, setLead] = useState({ name: "", phone: "", email: "", timeline: TIMELINES[0] });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submitLead() {
    if (!selectedLot || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email || undefined,
          timeline: lead.timeline,
          context: lotIsBuildable
            ? `Lot ${selectedLot.id} · ${productMode === 'build' ? `${plan.name} build · ` : 'Lot only · '}${money(totalPrice)} · ${financeMode === 'bank' ? 'Bank' : 'Owner finance'}`
            : `Lot ${selectedLot.id} reservation`,
          lot_number: selectedLot.id,
          project_slug: 'laguna-heights',
          source: 'portal',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.errorDetail ?? data.error ?? `Server error (${res.status})`);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const buildableConfig = selectedLot ? BUILDABLE_LOTS[selectedLot.id] : null;
  const lotIsBuildable = SHOW_FINANCING && !!buildableConfig;
  // For buildable lots, lot price depends on whether buyer takes the build package (discounted lot)
  // or the lot-only flat price. Non-buildable lots use the universal $/sqft.
  const lotPrice = selectedLot
    ? (buildableConfig
        ? (productMode === "build" ? buildableConfig.buildPackageLot : buildableConfig.lotOnly)
        : selectedLot.price)
    : 0;
  const buildCost = lotIsBuildable && productMode === "build" && buildableConfig
    ? Math.round(buildableConfig.buildPerSqft * plan.sqft)
    : 0;
  const totalPrice = lotPrice + buildCost;
  const downAmt = (down / 100) * totalPrice;
  const monthly = monthlyPI(totalPrice - downAmt, rate, term);

  const shownLots = useMemo(() => {
    let arr = LOTS;
    if (filterAvail) arr = arr.filter((l) => l.status === "available");
    if (query.trim()) arr = arr.filter((l) => l.id.includes(query.trim()));
    arr = [...arr];
    if (sort === "num") arr.sort((a, b) => a.n - b.n);
    if (sort === "priceup") arr.sort((a, b) => a.price - b.price);
    if (sort === "size") arr.sort((a, b) => b.sqft - a.sqft);
    return arr;
  }, [filterAvail, query, sort]);

  const availCount = LOTS.filter((l) => l.status === "available").length;

  const openLot = (l: PortalLot) => {
    if (l.status === "sold") return;
    setSelectedLot(l); setSubmitted(false); setProductMode("lot");
    setTimeout(() => { const el = document.getElementById("lot-detail"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
  };
  const canSubmit = lead.name.trim() && lead.phone.trim().length >= 7;

  return (
    <div style={{ background: T.ink, color: T.text, minHeight: "100vh", fontFamily: '"Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif', WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { background: ${T.ink}; }
        .hdg { font-family: "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
        .display { letter-spacing: -0.035em; line-height: 0.96; }
        .eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: ${T.dim}; font-weight: 600; }
        .lotbtn { transition: transform 180ms cubic-bezier(.2,.8,.2,1), border-color 180ms ease, background 180ms ease; }
        .lotbtn:hover:not(:disabled) { transform: translateY(-1px); }
        .fade { animation: fade .6s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        input, select, button { font-family: inherit; }
        input::placeholder { color: ${T.dimmer}; }
        .range { accent-color: ${T.gold}; }
        .noscroll::-webkit-scrollbar { display: none; }
        .ferestbg::before {
          content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(ellipse 800px 600px at 50% -180px, rgba(224,182,74,0.06), transparent 70%);
        }
      `}</style>

      <div className="ferestbg" style={{ position: "relative", zIndex: 1 }}>
        <header className="sticky top-0 z-30" style={{ background: "rgba(10,11,9,0.84)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 24px" }} className="flex items-center justify-between">
            <a href="/projects" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_MARK} alt="FEREST" style={{ height: 30, width: 30, objectFit: "contain" }} />
              <span className="hdg" style={{ fontSize: 14, letterSpacing: "0.32em", fontWeight: 700, color: T.text }}>FEREST</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Text us on WhatsApp"
                className="inline-flex items-center justify-center rounded-full"
                style={{ border: `1px solid ${T.line}`, color: T.text, padding: "8px 12px" }}
              >
                <MessageCircle size={14} strokeWidth={2.2} />
                <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, marginLeft: 6 }}>Text us</span>
              </a>
              <a
                href={CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full"
                style={{ background: T.gold, color: T.ink, fontSize: 13, fontWeight: 600, padding: "9px 16px" }}
              >
                <Phone size={13} strokeWidth={2.4} /> Book a call
              </a>
            </div>
          </div>
          <div className="noscroll" style={{ overflowX: "auto", maxWidth: 1180, margin: "0 auto" }}>
            <div className="flex gap-6 px-6 pb-3" style={{ minWidth: "max-content" }}>
              {TABS.map((t) => {
                const on = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="relative pb-1.5 text-sm transition"
                    style={{ color: on ? T.text : T.dim, fontWeight: on ? 600 : 500 }}>
                    {t.label}
                    {on && <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: T.gold }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {tab === "now" && (
          <NowView {...{ shownLots, availCount, selectedLot, openLot, setSelectedLot, filterAvail, setFilterAvail,
            query, setQuery, sort, setSort, plan, planId, setPlanId, productMode, setProductMode,
            lotPrice, buildCost, totalPrice, financeMode, setMode, down, setDown, rate, setRate, term, setTerm,
            downAmt, monthly, lead, setLead, canSubmit, submitted, setSubmitted, submitting, submitError, submitLead,
            lotIsBuildable }} />
        )}
        {tab === "pipeline" && <PipelineView />}
        {tab === "partners" && <PartnersView />}

        <footer style={{ borderTop: `1px solid ${T.line}`, marginTop: 96 }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px", color: T.dim }}>
            <div className="eyebrow" style={{ color: T.gold }}>{TAGLINE}</div>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 24, fontSize: 13, justifyContent: "space-between" }}>
              <div>FEREST Development · Rio Grande Valley, TX</div>
              <div>Engineered by M2 Engineering, PLLC (F-19545)</div>
              <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.gold }}>calendly.com/ferest-info</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NowView(p: any) {
  const { shownLots, availCount, selectedLot, openLot, setSelectedLot, filterAvail, setFilterAvail,
    query, setQuery, sort, setSort, plan, planId, setPlanId, productMode, setProductMode,
    lotPrice, buildCost, totalPrice, financeMode, setMode, down, setDown, rate, setRate, term, setTerm,
    downAmt, monthly, lead, setLead, canSubmit, submitted, setSubmitted, submitting, submitError, submitLead,
    lotIsBuildable } = p;
  const minSqft = Math.min(...LOTS.map(l => l.sqft));
  const maxSqft = Math.max(...LOTS.map(l => l.sqft));
  return (
    <>
      {/* HERO - aerial photo behind the headline */}
      <section className="fade" style={{ position: "relative", overflow: "hidden", marginBottom: 24 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.55, zIndex: 0,
        }} aria-hidden />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: `linear-gradient(180deg, rgba(10,11,9,0.35) 0%, rgba(10,11,9,0.55) 45%, ${T.ink} 100%)`,
        }} aria-hidden />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "120px 24px 80px" }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="eyebrow" style={{ color: T.text, opacity: 0.85 }}>{SUBDIVISION.name}</span>
            <span style={{ width: 18, height: 1, background: "rgba(255,255,255,0.4)" }} />
            <span style={{ fontSize: 12, color: T.text, opacity: 0.7 }}>{SUBDIVISION.location}</span>
          </div>
          <h1 className="hdg display" style={{ fontSize: "clamp(3rem, 8vw, 6.4rem)", fontWeight: 700, maxWidth: 920, textShadow: "0 2px 32px rgba(0,0,0,0.45)" }}>
            Own the lot.<br />
            <span style={{ color: T.gold }}>Build the home.</span>
          </h1>
          <p style={{ color: T.text, opacity: 0.85, maxWidth: 620, marginTop: 32, fontSize: 19, lineHeight: 1.5, fontWeight: 400, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>
            {SUBDIVISION.blurb}
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 48px" }}>
        <div className="flex flex-wrap gap-x-12 gap-y-6" style={{ borderTop: `1px solid ${T.line}`, paddingTop: 28 }}>
          <Stat label="Starting at" value={money(FROM_PRICE)} accent />
          <Stat label="Available" value={`${availCount} lots`} />
          <Stat label="Range" value={`${minSqft.toLocaleString()}–${maxSqft.toLocaleString()} sqft`} />
          <Stat label="Land" value="$11.75 / sqft" />
        </div>
      </section>

      {/* PLAT */}
      <section className="fade" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div className="flex items-end justify-between mb-6" style={{ maxWidth: 1180, margin: "0 auto", width: "100%" }}>
          <div>
            <div className="eyebrow" style={{ color: T.gold }}>Recorded plat</div>
            <h2 className="hdg" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600, marginTop: 8 }}>The site plan</h2>
          </div>
          <div style={{ fontSize: 12, color: T.dim, textAlign: "right", maxWidth: 280 }}>
            Filed by M2 Engineering (F-19545). Tap a lot below to see size and price.
          </div>
        </div>
        <div style={{ background: T.text, borderRadius: 16, padding: 8, position: "relative", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PLAT_IMG} alt="Laguna Heights recorded plat" style={{ width: "100%", display: "block", borderRadius: 10 }} />
        </div>
      </section>

      {/* LOT DIRECTORY */}
      <section className="fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 24px" }}>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="eyebrow" style={{ color: T.gold }}>Lot Directory</div>
            <h2 className="hdg" style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)", fontWeight: 600, marginTop: 8 }}>Pick your lot</h2>
          </div>
          <div className="flex gap-5 text-xs" style={{ color: T.dim }}>
            {Object.entries(STATUS_META).map(([k, m]) => (
              <span key={k} className="flex items-center gap-2">
                <span style={{ width: 9, height: 9, borderRadius: 2, background: m.color, display: "inline-block" }} />
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <div className="flex items-center gap-2 rounded-full" style={{ border: `1px solid ${T.line}`, padding: "10px 16px" }}>
            <Search size={14} color={T.dim} strokeWidth={2} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lot #" inputMode="numeric"
              style={{ background: "transparent", border: "none", outline: "none", color: T.text, width: 64, fontSize: 16 }} />
          </div>
          <button onClick={() => setFilterAvail((s: boolean) => !s)} className="rounded-full transition"
            style={{ fontSize: 14, fontWeight: 500, padding: "10px 18px", background: filterAvail ? T.text : "transparent", color: filterAvail ? T.ink : T.text, border: `1px solid ${filterAvail ? T.text : T.line}`, minHeight: 44 }}>
            {filterAvail ? "Available only" : "Show all 142"}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full transition"
            style={{ fontSize: 14, fontWeight: 500, padding: "10px 18px", background: "transparent", color: T.text, border: `1px solid ${T.line}`, appearance: "none", minHeight: 44 }}>
            <option value="num" style={{ color: "#000" }}>Lot number</option>
            <option value="priceup" style={{ color: "#000" }}>Price · low to high</option>
            <option value="size" style={{ color: "#000" }}>Size · largest first</option>
          </select>
          <div className="ml-auto text-sm" style={{ color: T.dim }}>
            <span style={{ color: T.text, fontWeight: 600 }}>{shownLots.length}</span> {filterAvail ? "available" : "shown"}
          </div>
        </div>

        <LotGrid lots={shownLots} selectedLot={selectedLot} onOpen={openLot} />
      </section>

      {selectedLot && (
        <section id="lot-detail" className="fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 64px" }}>
          <div style={{ background: T.panelSolid, border: `1px solid ${T.line}`, borderRadius: 20, overflow: "hidden" }}>
            <div className="flex items-start justify-between" style={{ padding: "28px 32px", borderBottom: `1px solid ${T.line}` }}>
              <div>
                <div className="eyebrow" style={{ color: T.gold }}>Laguna Heights</div>
                <div className="hdg" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, marginTop: 6 }}>
                  Lot {selectedLot.id}
                </div>
                <div style={{ color: T.dim, fontSize: 15, marginTop: 4 }}>
                  {selectedLot.sqft.toLocaleString()} sqft · {money(selectedLot.price)}
                </div>
              </div>
              <button onClick={() => setSelectedLot(null)} aria-label="Close" style={{ color: T.dim, padding: 4 }}>
                <X size={22} />
              </button>
            </div>

            {lotIsBuildable && (
              <div style={{ padding: "20px 32px 0" }}>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)", maxWidth: 380 }}>
                  {([["lot", "Lot only"], ["build", "Lot + build"]] as const).map(([k, lbl]) => {
                    const on = productMode === k;
                    return (
                      <button key={k} onClick={() => setProductMode(k)} className="rounded-full transition"
                        style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, background: on ? T.text : "transparent", color: on ? T.ink : T.dim }}>{lbl}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {lotIsBuildable ? (
              <div className="grid md:grid-cols-2">
                <div style={{ padding: "28px 32px", borderRight: `1px solid ${T.line}` }}>
                  {productMode === "build" ? (
                    <>
                      <div className="eyebrow mb-5">Floor plan</div>
                      <div className="space-y-3">
                        {PLANS.map((pl) => {
                          const active = pl.id === planId;
                          return (
                            <button key={pl.id} onClick={() => setPlanId(pl.id)} className="w-full text-left rounded-2xl px-5 py-5 lotbtn"
                              style={{ background: active ? T.goldSoft : "transparent", border: `1px solid ${active ? T.gold : T.line}` }}>
                              <div className="flex items-center justify-between">
                                <span className="hdg" style={{ fontSize: 19, fontWeight: 600 }}>{pl.name}</span>
                                {active && <Check size={18} color={T.gold} />}
                              </div>
                              <div className="flex gap-5 mt-2 text-sm" style={{ color: T.dim }}>
                                <span className="flex items-center gap-1.5"><BedDouble size={14} /> {pl.beds}</span>
                                <span className="flex items-center gap-1.5"><Bath size={14} /> {pl.baths}</span>
                                <span className="flex items-center gap-1.5"><Ruler size={14} /> {pl.sqft} sf</span>
                              </div>
                              <div style={{ marginTop: 10, fontSize: 13, color: T.dim }}>Build estimate <strong style={{ color: T.text, fontWeight: 600 }}>{money(pl.build)}</strong></div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="eyebrow mb-5">The lot</div>
                      <div className="space-y-3" style={{ fontSize: 15 }}>
                        <Row label="Lot" value={`#${selectedLot.id}`} />
                        <Row label="Area" value={`${selectedLot.sqft.toLocaleString()} sqft`} />
                        <Row label="Land rate" value="$11.75 / sqft" />
                        <div style={{ height: 1, background: T.line, margin: "16px 0" }} />
                        <Row label="Lot price" value={money(selectedLot.price)} strong />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ padding: "28px 32px" }}>
                  <div className="eyebrow mb-5">Estimate payment</div>
                  <div className="grid grid-cols-2 gap-1 mb-5 p-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {([["bank", "Bank"], ["owner", "Owner finance"]] as const).map(([k, lbl]) => {
                      const on = financeMode === k;
                      return (<button key={k} onClick={() => setMode(k)} className="rounded-full transition"
                        style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, background: on ? T.text : "transparent", color: on ? T.ink : T.dim }}>{lbl}</button>);
                    })}
                  </div>
                  <div className="space-y-3 mb-5" style={{ fontSize: 14 }}>
                    <Row label="Lot price" value={money(lotPrice)} />
                    {productMode === "build" && <Row label={`${plan.name} build est.`} value={money(buildCost)} />}
                    <div style={{ height: 1, background: T.line, margin: "12px 0" }} />
                    <Row label="Total" value={money(totalPrice)} strong />
                  </div>
                  <Control label={`Down payment · ${down}% (${money(downAmt)})`}>
                    <input type="range" min="0" max="30" step="1" value={down} onChange={(e) => setDown(Number(e.target.value))} className="range w-full" />
                  </Control>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Control label="Rate %">
                      <input type="number" step="0.125" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full rounded-lg px-3 py-2.5" style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 16 }} />
                    </Control>
                    <Control label="Term">
                      <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full rounded-lg px-3 py-2.5"
                        style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 14, appearance: "none" }}>
                        <option value={15} style={{ color: "#000" }}>15 years</option>
                        <option value={20} style={{ color: "#000" }}>20 years</option>
                        <option value={30} style={{ color: "#000" }}>30 years</option>
                      </select>
                    </Control>
                  </div>
                  <div className="rounded-2xl mt-6" style={{ padding: "24px 28px", background: T.goldSoft, border: `1px solid ${T.gold}` }}>
                    <div className="eyebrow">Principal + interest</div>
                    <div className="hdg" style={{ fontSize: 44, fontWeight: 700, color: T.gold, lineHeight: 1.05, marginTop: 4 }}>
                      {money(Math.round(monthly))}<span style={{ fontSize: 16, color: T.dim, fontWeight: 400, marginLeft: 4 }}>/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.dim, marginTop: 8 }}>
                      {financeMode === "bank" ? "Estimate only. Excludes taxes, insurance, HOA." : "Owner-financed estimate. In-house terms. Subject to approval."}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "32px" }}>
                <div className="eyebrow mb-5">The lot</div>
                <div className="space-y-3" style={{ fontSize: 15, maxWidth: 480 }}>
                  <Row label="Lot" value={`#${selectedLot.id}`} />
                  <Row label="Area" value={`${selectedLot.sqft.toLocaleString()} sqft`} />
                  <Row label="Land rate" value="$11.75 / sqft" />
                  <div style={{ height: 1, background: T.line, margin: "16px 0" }} />
                  <Row label="Lot price" value={money(selectedLot.price)} strong />
                </div>
              </div>
            )}

            <div style={{ borderTop: `1px solid ${T.line}`, padding: "32px", background: "rgba(255,255,255,0.015)" }}>
              {!submitted ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={18} color={T.gold} strokeWidth={2} />
                    <h3 className="hdg" style={{ fontSize: 22, fontWeight: 600 }}>
                      {SHOW_FINANCING ? "Reserve and request financing" : `Reserve Lot ${selectedLot.id}`}
                    </h3>
                  </div>
                  <p style={{ color: T.dim, fontSize: 14, marginBottom: 20, maxWidth: 620 }}>
                    {lotIsBuildable
                      ? `Lot ${selectedLot.id} · ${productMode === "build" ? `${plan.name} build · ` : "Lot only · "}${money(totalPrice)} · ${financeMode === "bank" ? "Bank / partner lender" : "Owner finance"}.`
                      : <>
                          {selectedLot.sqft.toLocaleString()} sqft at {money(lotPrice)}. Or{' '}
                          <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.gold, borderBottom: `1px solid ${T.gold}` }}>
                            book a 30-min call
                          </a>{' '}instead.
                        </>}
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <input placeholder="Full name" autoComplete="name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="rounded-lg px-4 py-3.5" style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 16 }} />
                    <input placeholder="Phone" type="tel" inputMode="tel" autoComplete="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} className="rounded-lg px-4 py-3.5" style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 16 }} />
                    <input placeholder="Email (optional)" type="email" inputMode="email" autoComplete="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className="rounded-lg px-4 py-3.5" style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 16 }} />
                  </div>
                  <Control label="How fast do you want to move?">
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map((t) => {
                        const on = lead.timeline === t;
                        return (<button key={t} onClick={() => setLead({ ...lead, timeline: t })} className="rounded-full transition"
                          style={{ padding: "7px 14px", fontSize: 13, fontWeight: 500, background: on ? T.text : "transparent", color: on ? T.ink : T.dim, border: `1px solid ${on ? T.text : T.line}` }}>
                          <Clock size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />{t}</button>);
                      })}
                    </div>
                  </Control>
                  <div className="mt-6 flex items-center gap-3 flex-wrap">
                    <button onClick={submitLead} disabled={!canSubmit || submitting} className="inline-flex items-center gap-2 rounded-full transition"
                      style={{ background: canSubmit && !submitting ? T.gold : "rgba(224,182,74,0.3)", color: T.ink, padding: "13px 24px", fontSize: 14, fontWeight: 600, cursor: canSubmit && !submitting ? "pointer" : "not-allowed" }}>
                      {submitting ? "Sending..." : (lotIsBuildable ? "Request financing" : "Reserve interest")} <ArrowRight size={15} strokeWidth={2.4} />
                    </button>
                    {submitError && (
                      <span style={{ color: "#e0573f", fontSize: 13 }}>{submitError}</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center fade" style={{ padding: "24px 0" }}>
                  <div className="inline-flex items-center justify-center rounded-full mb-4" style={{ width: 56, height: 56, background: T.goldSoft }}>
                    <Check size={28} color={T.gold} strokeWidth={2.4} />
                  </div>
                  <h3 className="hdg" style={{ fontSize: 24, fontWeight: 600 }}>Got it, {lead.name.split(" ")[0]}.</h3>
                  <p style={{ color: T.dim, marginTop: 10, maxWidth: 520, marginInline: "auto", fontSize: 15 }}>
                    Lot {selectedLot.id} · {selectedLot.sqft.toLocaleString()} sqft · {money(lotPrice)} · {lead.timeline}. We&rsquo;ll reach out at {lead.phone}.
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                    <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full"
                      style={{ background: T.gold, color: T.ink, padding: "11px 20px", fontSize: 14, fontWeight: 600 }}>
                      <Phone size={14} strokeWidth={2.4} /> Book a 30-min call
                    </a>
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full"
                      style={{ border: `1px solid ${T.line}`, color: T.text, padding: "11px 20px", fontSize: 14, fontWeight: 600 }}>
                      <MessageCircle size={14} strokeWidth={2.4} /> Text us
                    </a>
                    <button onClick={() => { setSelectedLot(null); setLead({ name: "", phone: "", email: "", timeline: TIMELINES[0] }); }} className="rounded-full"
                      style={{ border: `1px solid ${T.line}`, color: T.dim, padding: "11px 20px", fontSize: 14, fontWeight: 500 }}>
                      Browse more lots
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="hdg tabular-nums" style={{ fontSize: 26, fontWeight: 600, color: accent ? T.gold : T.text, marginTop: 6, letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}

function PipelineView() {
  return (
    <section className="fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px 48px" }}>
      <div className="eyebrow" style={{ color: T.gold }}>What&rsquo;s coming</div>
      <h1 className="hdg display" style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700, marginTop: 12 }}>The pipeline</h1>
      <p style={{ color: T.dim, maxWidth: 580, marginTop: 20, fontSize: 17 }}>
        Claim a unit before it lists. Tell us how fast you want to move and we prioritize early movers.
      </p>
      <div className="grid md:grid-cols-2 gap-5" style={{ marginTop: 56 }}>
        {PIPELINE.map((proj) => <PipelineCard key={proj.id} proj={proj} />)}
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PipelineCard({ proj }: { proj: any }) {
  const [open, setOpen] = useState(false);
  const color = STAGE_COLOR[proj.stage] || T.dim;
  return (
    <div style={{ background: T.panelSolid, border: `1px solid ${T.line}`, borderRadius: 18, padding: 28 }}>
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color, padding: "5px 12px", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
          <Hammer size={11} />{proj.stage}
        </span>
        <span style={{ fontSize: 12, color: T.dim }}>{proj.eta}</span>
      </div>
      <h3 className="hdg" style={{ fontSize: 26, fontWeight: 600 }}>{proj.name}</h3>
      <div className="flex items-center gap-2 mt-2" style={{ color: T.dim, fontSize: 14 }}><MapPin size={14} /> {proj.loc}</div>
      <div style={{ fontSize: 14, color: T.dim, marginTop: 8 }}>
        {proj.units}{proj.from ? ` · from ${money(proj.from)}` : ""}
      </div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-full" style={{ background: T.gold, color: T.ink, padding: "10px 18px", fontSize: 13, fontWeight: 600 }}>
          Reserve early interest <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      ) : <InterestForm context={`Pipeline · ${proj.name}`} />}
    </div>
  );
}

function PartnersView() {
  return (
    <section className="fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px 48px" }}>
      <div className="eyebrow" style={{ color: T.gold }}>Marketplace</div>
      <h1 className="hdg display" style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700, marginTop: 12 }}>Partner projects</h1>
      <p style={{ color: T.dim, maxWidth: 580, marginTop: 20, fontSize: 17 }}>
        Developments from builders and developers we work with across the Valley. One feed, every option.
      </p>
      <div className="grid md:grid-cols-2 gap-5" style={{ marginTop: 56 }}>
        {PARTNERS.map((proj) => proj.slot ? <ListSlot key={proj.id} /> : <PartnerCard key={proj.id} proj={proj} />)}
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PartnerCard({ proj }: { proj: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: T.panelSolid, border: `1px solid ${proj.featured ? T.gold : T.line}`, borderRadius: 18, padding: 28 }}>
      {proj.featured && (
        <span className="inline-flex items-center gap-1.5 rounded-full mb-4" style={{ background: T.goldSoft, color: T.gold, padding: "5px 12px", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
          <Star size={11} /> Featured
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="hdg" style={{ fontSize: 26, fontWeight: 600 }}>{proj.name}</h3>
        {proj.url && (
          <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full transition"
            style={{ border: `1px solid ${T.line}`, color: T.dim, padding: "6px 12px", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
            Visit site <ArrowRight size={12} strokeWidth={2.4} />
          </a>
        )}
      </div>
      <div style={{ fontSize: 13, color: T.dim, marginTop: 4 }}>by {proj.builder}</div>
      <div className="flex items-center gap-2 mt-3" style={{ color: T.dim, fontSize: 14 }}><MapPin size={14} /> {proj.loc}</div>
      <div style={{ fontSize: 14, color: T.dim, marginTop: 6 }}>{proj.units}{proj.from ? ` · from ${money(proj.from)}` : ""}</div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-full" style={{ background: T.gold, color: T.ink, padding: "10px 18px", fontSize: 13, fontWeight: 600 }}>
          I&rsquo;m interested <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      ) : <InterestForm context={`Partner · ${proj.name}`} />}
    </div>
  );
}

function ListSlot() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col justify-center" style={{ background: "transparent", border: `1.5px dashed ${T.line}`, borderRadius: 18, padding: 28 }}>
      <div className="flex items-center gap-2">
        <Plus size={18} color={T.gold} strokeWidth={2.2} />
        <h3 className="hdg" style={{ fontSize: 22, fontWeight: 600 }}>List your project</h3>
      </div>
      <p style={{ color: T.dim, fontSize: 14, marginTop: 12, maxWidth: 380 }}>
        Developers and builders: feature your inventory in this feed and get matched buyers, sorted by how fast they want to move.
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-full w-fit" style={{ background: T.gold, color: T.ink, padding: "10px 18px", fontSize: 13, fontWeight: 600 }}>
          Get featured <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      ) : <InterestForm context="List a project" partner />}
    </div>
  );
}

function InterestForm({ context, partner }: { context: string; partner?: boolean }) {
  const [f, setF] = useState({ name: "", phone: "", timeline: TIMELINES[0] });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ok = f.name.trim() && f.phone.trim().length >= 7;

  async function submit() {
    if (!ok || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name,
          phone: f.phone,
          timeline: f.timeline,
          context,
          source: 'portal',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.errorDetail ?? data.error ?? `Server error (${res.status})`);
        return;
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) return (
    <div className="mt-5 fade">
      <div className="flex items-center gap-2" style={{ color: T.gold }}>
        <Check size={18} strokeWidth={2.4} /><span style={{ fontSize: 14, fontWeight: 600 }}>Got it, {f.name.split(" ")[0]}.</span>
      </div>
      <p style={{ color: T.dim, fontSize: 13, marginTop: 6 }}>{context} · {f.timeline}. We&rsquo;ll reach out at {f.phone}.</p>
    </div>
  );
  return (
    <div className="mt-5 space-y-3 fade">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder={partner ? "Your name" : "Full name"} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="rounded-lg px-3 py-2.5" style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 16 }} />
        <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="rounded-lg px-3 py-2.5" style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontSize: 16 }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {TIMELINES.map((t) => { const on = f.timeline === t;
          return (<button key={t} onClick={() => setF({ ...f, timeline: t })} className="rounded-full transition"
            style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: on ? T.text : "transparent", color: on ? T.ink : T.dim, border: `1px solid ${on ? T.text : T.line}` }}>{t}</button>); })}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={submit} disabled={!ok || busy} className="inline-flex items-center gap-2 rounded-full"
          style={{ background: ok && !busy ? T.gold : "rgba(224,182,74,0.3)", color: T.ink, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: ok && !busy ? "pointer" : "not-allowed" }}>
          {busy ? "Sending..." : "Submit"} <ArrowRight size={14} strokeWidth={2.4} />
        </button>
        {err && <span style={{ color: "#e0573f", fontSize: 12 }}>{err}</span>}
      </div>
    </div>
  );
}

function LotGrid({ lots, selectedLot, onOpen }: { lots: PortalLot[]; selectedLot: PortalLot | null; onOpen: (l: PortalLot) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <>
      <style>{`
        .lot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap: 5px; }
        @media (min-width: 640px) { .lot-grid { grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 6px; } }
      `}</style>
      <div className="lot-grid">
        {lots.map((l) => {
          const m = STATUS_META[l.status];
          const sel = selectedLot && selectedLot.id === l.id;
          const sold = l.status === "sold";
          const showTip = hover === l.id;
          return (
            <div key={l.id} style={{ position: "relative" }}>
              {showTip && !sold && (
                <div className="fade" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: T.ink, border: `1px solid ${T.lineStrong}`, borderRadius: 8, padding: "8px 12px", whiteSpace: "nowrap", zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.6)", pointerEvents: "none" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>Lot {l.id}</div>
                  <div style={{ fontSize: 10, color: T.dim, marginTop: 2 }}>{l.sqft.toLocaleString()} sqft · {money(l.price)}</div>
                </div>
              )}
              <button disabled={sold} onClick={() => onOpen(l)} onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)}
                aria-label={sold ? `Lot ${l.id} sold` : `Lot ${l.id}, ${l.sqft.toLocaleString()} sqft, ${money(l.price)}`}
                className="lotbtn rounded-lg flex flex-col items-center justify-center w-full"
                style={{
                  background: sel ? T.gold : "transparent",
                  border: `1px solid ${sel ? T.gold : sold ? "rgba(255,255,255,0.06)" : m.color + "55"}`,
                  opacity: sold ? 0.32 : 1,
                  cursor: sold ? "not-allowed" : "pointer",
                  minHeight: 46,
                  padding: "6px 2px",
                  position: "relative",
                  WebkitTapHighlightColor: "transparent",
                }}>
                {!sel && !sold && <span style={{ position: "absolute", top: 4, right: 4, width: 4, height: 4, borderRadius: 2, background: m.color }} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: sel ? T.ink : T.text, lineHeight: 1 }}>{l.id}</span>
                {!sold && <span style={{ fontSize: 10, color: sel ? T.ink : T.dim, marginTop: 3, fontWeight: 500 }}>{Math.round(l.price / 1000)}k</span>}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: T.dim, fontSize: 14 }}>{label}</span>
      <span className="tabular-nums" style={{ fontWeight: strong ? 700 : 500, fontSize: strong ? 19 : 14, color: strong ? T.gold : T.text, letterSpacing: strong ? "-0.01em" : "0" }}>{value}</span>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow" style={{ display: "block", marginBottom: 8 }}>{label}</span>
      {children}
    </label>
  );
}
