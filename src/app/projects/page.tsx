'use client';

import React, { useState, useMemo } from "react";
import {
  MapPin, Home, Ruler, BedDouble, Bath, Check, Phone, Calculator,
  ShieldCheck, X, ArrowRight, Building2, Layers, Clock, Star, Plus, Hammer, Search
} from "lucide-react";

/*
  FEREST PORTAL — Laguna Heights (real plat data) + Pipeline + Partner Projects.
  Locked FEREST brand: dark gradient + gold #e0b64a, blueprint grid, gold glow,
  corner brackets, Helvetica Neue heavy, RAW LAND · ROOFTOPS · REVENUE.
  Lot data from recorded M2 Engineering plat (142 lots, land at $11.75/sqft).
*/

const SHOW_FINANCING = process.env.NEXT_PUBLIC_SHOW_FINANCING === 'true';
// TODO: replace with real Calendly URL when you have it.
// Used by the header CTA and lead-form "book a call instead" link.
const CONTACT_URL = "https://www.ferest.dev";

const LOGO_MARK = "/ferest-logo.png";
const LOGO_WORD = "/ferest-logo.png";
const PLAT_IMG = "/plats/laguna-heights-plat.svg";

const T = {
  bg: "linear-gradient(167deg,#1a1c1a 0%,#111210 60%,#0a0b09 100%)",
  ink: "#0f100e", panel: "#191b17", panelSoft: "#1b1d1a",
  line: "rgba(224,182,74,0.18)", text: "#ffffff", dim: "rgba(255,255,255,0.6)",
  gold: "#e0b64a", goldDeep: "#b8922f", green: "#4fb15e", amber: "#e0a93b", sold: "#e0573f",
};
const TAGLINE = "RAW LAND · ROOFTOPS · REVENUE";
const TIMELINES = ["Ready to move now", "Within 1-3 months", "3-6 months", "Just exploring"];
const PRICE_PSF = 11.75;

const SUBDIVISION = {
  name: "Laguna Heights",
  location: "Mission, TX",
  blurb: "27.07 acres, 142 lots out of the West Addition to Sharyland. Lots priced at $11.75 per square foot. Buy the lot, or build with us and see your monthly in minutes.",
};

// Build-cost estimates per plan (editable). Lot price is land only.
const PLANS = [
  { id: "p1", name: "The Palma", beds: 3, baths: 2.5, sqft: 1034, build: 150000 },
  { id: "p2", name: "The Sabal", beds: 3, baths: 2.5, sqft: 1244, build: 178000 },
  { id: "p3", name: "The Laguna", beds: 4, baths: 2.5, sqft: 1347, build: 195000 },
];

type LotStatus = 'available' | 'reserved' | 'sold';
interface PortalLot {
  id: string;
  n: number;
  sqft: number;
  price: number;
  status: LotStatus;
}

// [lotNumber, squareFeet] from recorded plat
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
  { id: "ad2", name: "Angelica's Dream V2", loc: "Weslaco / Border Ave", units: "47 single-family lots", stage: "Under Construction", eta: "Q3 2026", from: 209900 },
  { id: "lmc", name: "Los Milagros on Conway", loc: "Conway Ave & SH 107, Mission", units: "48 lots / 96 duplex units", stage: "Engineering", eta: "Q1 2027", from: 0 },
  { id: "aug", name: "Augusta Townhomes", loc: "Rio Grande Valley", units: "Townhome community", stage: "Entitlement", eta: "TBD", from: 0 },
];
const PARTNERS = [
  { id: "opp", name: "One Place Pecan", builder: "Terraform Development", loc: "McAllen, TX", units: "Single-family", from: 215000, featured: true, slot: false },
  { id: "ext", name: "Your project here", builder: "Open feature slot", loc: "RGV", units: "", from: 0, featured: false, slot: true },
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
const STAGE_COLOR: Record<string, string> = { "Selling Soon": T.green, "Under Construction": T.gold, "Engineering": T.goldDeep, "Entitlement": T.dim };
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
  const [filterAvail, setFilterAvail] = useState(false);
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

  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const lotPrice = selectedLot ? selectedLot.price : 0;
  const buildCost = SHOW_FINANCING && productMode === "build" ? plan.build : 0;
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
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", position: "relative", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .hdg { font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; font-weight:800; letter-spacing:-0.015em; }
        .lotbtn { transition: transform .12s ease, background .12s ease; }
        .lotbtn:hover:not(:disabled) { transform: translateY(-2px); }
        .fade { animation: fade .5s ease both; }
        @keyframes fade { from { opacity:0; transform:translateY(12px);} to {opacity:1; transform:none;} }
        input, select { font-family: inherit; }
        input::placeholder { color: rgba(255,255,255,0.38); }
        .range { accent-color: ${T.gold}; }
        .noscroll::-webkit-scrollbar { display:none; }
        .grid-bg { position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image: linear-gradient(rgba(224,182,74,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(224,182,74,0.05) 1px,transparent 1px);
          background-size:56px 56px; }
        .glow-bg { position:fixed; top:-220px; left:50%; transform:translateX(-50%); width:900px; height:520px; z-index:0; pointer-events:none;
          background: radial-gradient(ellipse at center, rgba(224,182,74,0.14) 0%, rgba(224,182,74,0.04) 38%, transparent 70%); }
      `}</style>
      <div className="grid-bg" />
      <div className="glow-bg" />

      <div style={{ position: "relative", zIndex: 1 }}>
        <header className="sticky top-0 z-30" style={{ background: "rgba(15,16,14,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.line}` }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_MARK} alt="FEREST" style={{ height: 34, width: 34, objectFit: "contain", display: "block" }} />
              <span className="hdg" style={{ fontSize: 18, letterSpacing: "0.18em", fontWeight: 800, color: T.text }}>FEREST</span>
            </div>
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: T.gold, color: T.ink }}
            >
              <Phone size={14} /> Book a call
            </a>
          </div>
          <div className="noscroll" style={{ overflowX: "auto", maxWidth: 1100, margin: "0 auto" }}>
            <div className="flex gap-1 px-4 pb-2" style={{ minWidth: "max-content" }}>
              {TABS.map((t) => {
                const on = tab === t.id; const I = t.icon;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ background: on ? T.gold : "transparent", color: on ? T.ink : T.dim, border: `1px solid ${on ? T.gold : T.line}` }}>
                    <I size={15} /> {t.label}
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
            downAmt, monthly, lead, setLead, canSubmit, submitted, setSubmitted }} />
        )}
        {tab === "pipeline" && <PipelineView />}
        {tab === "partners" && <PartnersView />}

        <footer className="px-5 py-10 text-center" style={{ borderTop: `1px solid ${T.line}`, color: T.dim, fontSize: 12 }}>
          <div style={{ color: T.gold, letterSpacing: "0.22em", fontSize: 11, fontWeight: 700 }}>{TAGLINE}</div>
          <div style={{ marginTop: 8 }}>FEREST Development Services · {SUBDIVISION.name}, {SUBDIVISION.location} · Civil engineering by M2 Engineering, PLLC (F-19545). Prototype, pricing subject to contract.</div>
        </footer>
      </div>
    </div>
  );
}

function CornerBrackets() {
  const s: React.CSSProperties = { position: "absolute", width: 22, height: 22, borderColor: T.gold, borderStyle: "solid", borderWidth: 0, pointerEvents: "none" };
  return (<>
    <span style={{ ...s, top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 }} />
    <span style={{ ...s, top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 }} />
    <span style={{ ...s, bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 }} />
    <span style={{ ...s, bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 }} />
  </>);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NowView(p: any) {
  const { shownLots, availCount, selectedLot, openLot, setSelectedLot, filterAvail, setFilterAvail,
    query, setQuery, sort, setSort, plan, planId, setPlanId, productMode, setProductMode,
    lotPrice, buildCost, totalPrice, financeMode, setMode, down, setDown, rate, setRate, term, setTerm,
    downAmt, monthly, lead, setLead, canSubmit, submitted, setSubmitted } = p;
  return (
    <>
      <section className="px-5 pt-12 pb-6 fade" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: T.gold, letterSpacing: "0.22em", fontSize: 11, fontWeight: 700 }}>{TAGLINE}</div>
        <div className="flex items-center gap-2 text-sm mt-4" style={{ color: T.dim }}>
          <MapPin size={14} color={T.gold} /> {SUBDIVISION.name} · {SUBDIVISION.location}
        </div>
        <h1 className="hdg" style={{ fontSize: "clamp(2.4rem,7vw,4.6rem)", lineHeight: 0.98, fontWeight: 800, marginTop: 12 }}>
          Own the lot.<br /><span style={{ color: T.gold }}>Build the home.</span>
        </h1>
        <p style={{ color: T.dim, maxWidth: 580, marginTop: 18, fontSize: 17, lineHeight: 1.55 }}>{SUBDIVISION.blurb}</p>
        <div className="flex flex-wrap gap-3 mt-7">
          {[["Lots from", money(FROM_PRICE)], ["Inventory", `${availCount} available`], ["Price", "$11.75 / sqft"]].map(([k, v]) => (
            <div key={k} className="px-4 py-3 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: T.dim }}>{k}</div>
              <div className="hdg" style={{ fontSize: 22, fontWeight: 800, color: T.gold }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: T.gold }}>Recorded Plat</div>
        <h2 className="hdg" style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>The site plan</h2>
        <div className="rounded-2xl p-3" style={{ background: T.panel, border: `1px solid ${T.line}`, position: "relative" }}>
          <CornerBrackets />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PLAT_IMG} alt="Laguna Heights recorded plat" style={{ width: "100%", borderRadius: 12, display: "block", background: "#fff" }} />
        </div>
        <div style={{ color: T.dim, fontSize: 12, marginTop: 8 }}>Laguna Heights Subdivision · M2 Engineering, PLLC (F-19545). Find your lot number on the plat, then pick it below.</div>
      </section>

      <section className="px-5 py-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
          <div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: T.gold }}>Lot Directory</div>
            <h2 className="hdg" style={{ fontSize: 28, fontWeight: 800 }}>Pick your lot</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
            <Search size={15} color={T.dim} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lot #" inputMode="numeric"
              style={{ background: "transparent", border: "none", outline: "none", color: T.text, width: 70, fontSize: 14 }} />
          </div>
          <button onClick={() => setFilterAvail((s: boolean) => !s)} className="text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: filterAvail ? T.gold : "transparent", color: filterAvail ? T.ink : T.text, border: `1px solid ${filterAvail ? T.gold : T.line}` }}>
            {filterAvail ? "Available only" : "All lots"}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm font-semibold px-3 py-2 rounded-full"
            style={{ background: "transparent", color: T.text, border: `1px solid ${T.line}` }}>
            <option value="num" style={{ color: "#000" }}>Sort: Lot #</option>
            <option value="priceup" style={{ color: "#000" }}>Sort: Price low to high</option>
            <option value="size" style={{ color: "#000" }}>Sort: Largest</option>
          </select>
          <div className="flex gap-3 text-xs ml-auto" style={{ color: T.dim }}>
            {Object.entries(STATUS_META).map(([k, m]) => (
              <span key={k} className="flex items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: m.color, display: "inline-block" }} />{m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
          <LotGrid lots={shownLots} selectedLot={selectedLot} onOpen={openLot} />
          <div style={{ color: T.dim, fontSize: 12, marginTop: 12 }}>{shownLots.length} lots shown</div>
        </div>
      </section>

      {selectedLot && (
        <section id="lot-detail" className="px-5 py-8 fade" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: T.panel, border: `1px solid ${T.line}`, position: "relative" }}>
            <CornerBrackets />
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${T.line}` }}>
              <div>
                <div style={{ fontSize: 12, color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>Laguna Heights</div>
                <div className="hdg" style={{ fontSize: 26, fontWeight: 800 }}>Lot {selectedLot.id} <span style={{ color: T.dim, fontSize: 16, fontWeight: 400 }}>· {selectedLot.sqft.toLocaleString()} sqft</span></div>
              </div>
              <button onClick={() => setSelectedLot(null)} style={{ color: T.dim }}><X size={22} /></button>
            </div>

            {SHOW_FINANCING && (
              <div className="px-6 pt-5">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  {([["lot", "Lot only"], ["build", "Lot + build a home"]] as const).map(([k, lbl]) => {
                    const on = productMode === k;
                    return (
                      <button key={k} onClick={() => setProductMode(k)} className="rounded-lg py-2 font-semibold"
                        style={{ background: on ? T.gold : "transparent", color: on ? T.ink : T.dim, fontSize: 13 }}>{lbl}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {SHOW_FINANCING ? (
              <div className="grid md:grid-cols-2 gap-0">
                <div className="px-6 py-6" style={{ borderRight: `1px solid ${T.line}` }}>
                  {productMode === "build" ? (
                    <>
                      <div className="flex items-center gap-2 mb-4"><Home size={16} color={T.gold} /><span className="font-semibold">Choose your floor plan</span></div>
                      <div className="space-y-3">
                        {PLANS.map((pl) => {
                          const active = pl.id === planId;
                          return (
                            <button key={pl.id} onClick={() => setPlanId(pl.id)} className="w-full text-left rounded-xl px-4 py-4 lotbtn"
                              style={{ background: active ? "rgba(224,182,74,0.12)" : T.panelSoft, border: `1.5px solid ${active ? T.gold : T.line}` }}>
                              <div className="flex items-center justify-between">
                                <span className="hdg" style={{ fontSize: 18, fontWeight: 800 }}>{pl.name}</span>
                                {active && <Check size={18} color={T.gold} />}
                              </div>
                              <div className="flex gap-4 mt-2 text-sm" style={{ color: T.dim }}>
                                <span className="flex items-center gap-1"><BedDouble size={14} /> {pl.beds} bd</span>
                                <span className="flex items-center gap-1"><Bath size={14} /> {pl.baths} ba</span>
                                <span className="flex items-center gap-1"><Ruler size={14} /> {pl.sqft} sf</span>
                              </div>
                              <div style={{ marginTop: 8, fontSize: 14 }}>Build est. <strong>{money(pl.build)}</strong></div>
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 11, color: T.dim, marginTop: 12 }}>Build costs are estimates for modeling. Final scope and price are set in your build contract.</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4"><MapPin size={16} color={T.gold} /><span className="font-semibold">Your lot</span></div>
                      <div className="rounded-xl px-4 py-5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                        <Row label="Lot number" value={`Lot ${selectedLot.id}`} />
                        <Row label="Lot size" value={`${selectedLot.sqft.toLocaleString()} sqft`} />
                        <Row label="Price per sqft" value={"$11.75"} />
                        <div style={{ borderTop: `1px solid ${T.line}`, margin: "10px 0" }} />
                        <Row label="Lot price" value={money(selectedLot.price)} strong />
                      </div>
                      <div style={{ fontSize: 12, color: T.dim, marginTop: 12 }}>Want a home on it? Switch to &ldquo;Lot + build a home&rdquo; to model construction and payment.</div>
                    </>
                  )}
                </div>

                <div className="px-6 py-6">
                  <div className="flex items-center gap-2 mb-4"><Calculator size={16} color={T.gold} /><span className="font-semibold">Estimate your payment</span></div>
                  <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    {([["bank", "Bank / Partner Lender"], ["owner", "Owner Finance · in-house"]] as const).map(([k, lbl]) => {
                      const on = financeMode === k;
                      return (<button key={k} onClick={() => setMode(k)} className="rounded-lg py-2 font-semibold"
                        style={{ background: on ? T.gold : "transparent", color: on ? T.ink : T.dim, fontSize: 13 }}>{lbl}</button>);
                    })}
                  </div>
                  <div className="rounded-xl px-4 py-4 mb-4" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                    <Row label="Lot price" value={money(lotPrice)} />
                    {productMode === "build" && <Row label={`${plan.name} build est.`} value={money(buildCost)} />}
                    <div style={{ borderTop: `1px solid ${T.line}`, margin: "10px 0" }} />
                    <Row label="Total" value={money(totalPrice)} strong />
                  </div>
                  <Control label={`Down payment · ${down}% (${money(downAmt)})`}>
                    <input type="range" min="0" max="30" step="1" value={down} onChange={(e) => setDown(Number(e.target.value))} className="range w-full" />
                  </Control>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Control label="Rate %">
                      <input type="number" step="0.125" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full rounded-lg px-3 py-2" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.text }} />
                    </Control>
                    <Control label="Term">
                      <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full rounded-lg px-3 py-2"
                        style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.text }}>
                        <option value={15}>15 years</option><option value={20}>20 years</option><option value={30}>30 years</option>
                      </select>
                    </Control>
                  </div>
                  <div className="rounded-xl px-5 py-5 mt-5 text-center" style={{ background: "rgba(224,182,74,0.1)", border: `1px solid ${T.gold}` }}>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: T.dim }}>Est. principal + interest</div>
                    <div className="hdg" style={{ fontSize: 40, fontWeight: 800, color: T.gold, lineHeight: 1.1 }}>
                      {money(Math.round(monthly))}<span style={{ fontSize: 16, color: T.dim, fontWeight: 400 }}>/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.dim, marginTop: 6 }}>
                      {financeMode === "bank" ? "Estimate only. Excludes taxes, insurance, HOA. Not a commitment to lend."
                        : "Owner-financed estimate. In-house terms, no third-party bank. Subject to approval."}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 py-6">
                <div className="flex items-center gap-2 mb-4"><MapPin size={16} color={T.gold} /><span className="font-semibold">Your lot</span></div>
                <div className="rounded-xl px-4 py-5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <Row label="Lot number" value={`Lot ${selectedLot.id}`} />
                  <Row label="Lot size" value={`${selectedLot.sqft.toLocaleString()} sqft`} />
                  <Row label="Price per sqft" value={"$11.75"} />
                  <div style={{ borderTop: `1px solid ${T.line}`, margin: "10px 0" }} />
                  <Row label="Lot price" value={money(selectedLot.price)} strong />
                </div>
              </div>
            )}

            <div className="px-6 py-7" style={{ borderTop: `1px solid ${T.line}`, background: T.panelSoft }}>
              {!submitted ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={18} color={T.gold} />
                    <h3 className="hdg" style={{ fontSize: 22, fontWeight: 800 }}>
                      {SHOW_FINANCING ? "Lock this lot. Request financing." : `Reserve interest in Lot ${selectedLot.id}.`}
                    </h3>
                  </div>
                  <p style={{ color: T.dim, fontSize: 14, marginBottom: 16 }}>
                    {SHOW_FINANCING
                      ? `Lot ${selectedLot.id} · ${productMode === "build" ? `${plan.name} build · ` : "Lot only · "}${money(totalPrice)} · ${financeMode === "bank" ? "Bank / partner lender" : "Owner finance"}.`
                      : <>
                          Lot {selectedLot.id} · {selectedLot.sqft.toLocaleString()} sqft · {money(lotPrice)}. Or{' '}
                          <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.gold, textDecoration: "underline" }}>
                            book a call instead
                          </a>.
                        </>}
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input placeholder="Full name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="rounded-lg px-4 py-3" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.text }} />
                    <input placeholder="Phone" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} className="rounded-lg px-4 py-3" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.text }} />
                    <input placeholder="Email (optional)" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className="rounded-lg px-4 py-3" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.text }} />
                  </div>
                  <div className="mt-3">
                    <Control label="How fast do you want to move?">
                      <div className="flex flex-wrap gap-2">
                        {TIMELINES.map((t) => {
                          const on = lead.timeline === t;
                          return (<button key={t} onClick={() => setLead({ ...lead, timeline: t })} className="px-3 py-2 rounded-full text-sm font-semibold"
                            style={{ background: on ? T.gold : "transparent", color: on ? T.ink : T.dim, border: `1px solid ${on ? T.gold : T.line}` }}>
                            <Clock size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />{t}</button>);
                        })}
                      </div>
                    </Control>
                  </div>
                  <button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit} className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full font-semibold"
                    style={{ background: canSubmit ? T.gold : "rgba(224,182,74,0.4)", color: T.ink, cursor: canSubmit ? "pointer" : "not-allowed" }}>
                    {SHOW_FINANCING ? "Request financing" : "Reserve interest"} <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center py-4 fade">
                  <div className="inline-flex items-center justify-center rounded-full mb-3" style={{ width: 56, height: 56, background: "rgba(224,182,74,0.15)" }}><Check size={28} color={T.gold} /></div>
                  <h3 className="hdg" style={{ fontSize: 24, fontWeight: 800 }}>You&rsquo;re on the list, {lead.name.split(" ")[0]}.</h3>
                  <p style={{ color: T.dim, marginTop: 8 }}>
                    {SHOW_FINANCING
                      ? `Lot ${selectedLot.id} · ${productMode === "build" ? `${plan.name} build · ` : "Lot only · "}${money(totalPrice)} · ${financeMode === "bank" ? "Bank / partner lender" : "Owner finance"} · ${lead.timeline}. We'll reach out at ${lead.phone}.`
                      : `Lot ${selectedLot.id} · ${selectedLot.sqft.toLocaleString()} sqft · ${money(lotPrice)} · ${lead.timeline}. We'll reach out at ${lead.phone}.`}
                  </p>
                  <button onClick={() => { setSelectedLot(null); setLead({ name: "", phone: "", email: "", timeline: TIMELINES[0] }); }} className="mt-5 px-5 py-2 rounded-full font-semibold" style={{ border: `1px solid ${T.line}`, color: T.text }}>Browse more lots</button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function PipelineView() {
  return (
    <section className="px-5 pt-12 pb-8 fade" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: T.gold }}>What&rsquo;s Coming</div>
      <h1 className="hdg" style={{ fontSize: "clamp(2rem,6vw,3.4rem)", fontWeight: 800, marginTop: 8 }}>The pipeline</h1>
      <p style={{ color: T.dim, maxWidth: 540, marginTop: 12, fontSize: 16 }}>Claim a unit before it lists. Tell us how fast you want to move and we prioritize early movers.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-8">{PIPELINE.map((proj) => <PipelineCard key={proj.id} proj={proj} />)}</div>
    </section>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PipelineCard({ proj }: { proj: any }) {
  const [open, setOpen] = useState(false);
  const color = STAGE_COLOR[proj.stage] || T.dim;
  return (
    <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${T.line}` }}>
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(0,0,0,0.25)", color, border: `1px solid ${color}` }}>
          <Hammer size={12} style={{ display: "inline", marginRight: 5, verticalAlign: "-1px" }} />{proj.stage}
        </span>
        <span style={{ fontSize: 13, color: T.dim }}>Est. {proj.eta}</span>
      </div>
      <h3 className="hdg" style={{ fontSize: 24, fontWeight: 800, marginTop: 14 }}>{proj.name}</h3>
      <div className="flex items-center gap-2 mt-1" style={{ color: T.dim, fontSize: 14 }}><MapPin size={14} /> {proj.loc}</div>
      <div style={{ fontSize: 14, marginTop: 8 }}>{proj.units}{proj.from ? ` · from ${money(proj.from)}` : ""}</div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold" style={{ background: T.gold, color: T.ink }}>
          Reserve early interest <ArrowRight size={15} />
        </button>
      ) : <InterestForm context={`Pipeline · ${proj.name}`} />}
    </div>
  );
}
function PartnersView() {
  return (
    <section className="px-5 pt-12 pb-8 fade" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: T.gold }}>Marketplace</div>
      <h1 className="hdg" style={{ fontSize: "clamp(2rem,6vw,3.4rem)", fontWeight: 800, marginTop: 8 }}>Partner projects</h1>
      <p style={{ color: T.dim, maxWidth: 560, marginTop: 12, fontSize: 16 }}>Developments from builders and developers we work with across the Valley. One feed, every option.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-8">{PARTNERS.map((proj) => proj.slot ? <ListSlot key={proj.id} /> : <PartnerCard key={proj.id} proj={proj} />)}</div>
    </section>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PartnerCard({ proj }: { proj: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${proj.featured ? T.gold : T.line}`, position: "relative" }}>
      {proj.featured && (<span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit" style={{ background: "rgba(224,182,74,0.15)", color: T.gold, border: `1px solid ${T.gold}` }}><Star size={12} /> Featured</span>)}
      <h3 className="hdg" style={{ fontSize: 24, fontWeight: 800, marginTop: proj.featured ? 12 : 0 }}>{proj.name}</h3>
      <div style={{ fontSize: 13, color: T.dim, marginTop: 2 }}>by {proj.builder}</div>
      <div className="flex items-center gap-2 mt-2" style={{ color: T.dim, fontSize: 14 }}><MapPin size={14} /> {proj.loc}</div>
      <div style={{ fontSize: 14, marginTop: 8 }}>{proj.units}{proj.from ? ` · from ${money(proj.from)}` : ""}</div>
      {!open ? (<button onClick={() => setOpen(true)} className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold" style={{ background: T.gold, color: T.ink }}>I&rsquo;m interested <ArrowRight size={15} /></button>) : <InterestForm context={`Partner · ${proj.name}`} />}
    </div>
  );
}
function ListSlot() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl p-6 flex flex-col justify-center" style={{ background: "transparent", border: `1.5px dashed ${T.line}` }}>
      <div className="flex items-center gap-2"><Plus size={18} color={T.gold} /><h3 className="hdg" style={{ fontSize: 22, fontWeight: 800 }}>List your project</h3></div>
      <p style={{ color: T.dim, fontSize: 14, marginTop: 8 }}>Developers and builders: feature your inventory in this feed and get matched buyers, sorted by how fast they want to move.</p>
      {!open ? (<button onClick={() => setOpen(true)} className="mt-5 px-5 py-2.5 rounded-full font-semibold w-fit" style={{ background: T.gold, color: T.ink }}>Get featured</button>) : <InterestForm context="List a project" partner />}
    </div>
  );
}
function InterestForm({ context, partner }: { context: string; partner?: boolean }) {
  const [f, setF] = useState({ name: "", phone: "", timeline: TIMELINES[0] });
  const [done, setDone] = useState(false);
  const ok = f.name.trim() && f.phone.trim().length >= 7;
  if (done) return (
    <div className="mt-4 fade">
      <div className="flex items-center gap-2" style={{ color: T.gold }}><Check size={18} /><span className="font-semibold">Got it, {f.name.split(" ")[0]}.</span></div>
      <p style={{ color: T.dim, fontSize: 14, marginTop: 4 }}>{context} · {f.timeline}. We&rsquo;ll reach out at {f.phone}.</p>
    </div>
  );
  return (
    <div className="mt-4 space-y-3 fade">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder={partner ? "Your name" : "Full name"} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.text }} />
        <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="rounded-lg px-3 py-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.text }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {TIMELINES.map((t) => { const on = f.timeline === t;
          return (<button key={t} onClick={() => setF({ ...f, timeline: t })} className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: on ? T.gold : "transparent", color: on ? T.ink : T.dim, border: `1px solid ${on ? T.gold : T.line}` }}>{t}</button>); })}
      </div>
      <button onClick={() => ok && setDone(true)} disabled={!ok} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold"
        style={{ background: ok ? T.gold : "rgba(224,182,74,0.4)", color: T.ink, cursor: ok ? "pointer" : "not-allowed" }}>Submit <ArrowRight size={15} /></button>
    </div>
  );
}

function LotGrid({ lots, selectedLot, onOpen }: { lots: PortalLot[]; selectedLot: PortalLot | null; onOpen: (l: PortalLot) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))", gap: 8 }}>
      {lots.map((l) => {
        const m = STATUS_META[l.status];
        const sel = selectedLot && selectedLot.id === l.id;
        const sold = l.status === "sold";
        const showTip = hover === l.id;
        return (
          <div key={l.id} style={{ position: "relative" }}>
            {showTip && (
              <div className="fade" style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: T.ink, border: `1px solid ${m.color}`, borderRadius: 8, padding: "6px 10px", whiteSpace: "nowrap", zIndex: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", pointerEvents: "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>Lot {l.id}</div>
                <div style={{ fontSize: 10, color: T.dim }}>{l.sqft.toLocaleString()} sqft</div>
                {!sold && <div style={{ fontSize: 11, color: T.text }}>{money(l.price)}</div>}
              </div>
            )}
            <button disabled={sold} onClick={() => onOpen(l)} onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)}
              className="lotbtn rounded-lg flex flex-col items-center justify-center w-full"
              style={{ background: sel ? T.gold : "rgba(255,255,255,0.04)", border: `1.5px solid ${sel ? T.gold : m.color}`, opacity: sold ? 0.45 : 1, cursor: sold ? "not-allowed" : "pointer", minHeight: 52, padding: "6px 2px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: sel ? T.ink : T.text }}>{l.id}</span>
              {!sold && <span style={{ fontSize: 9, color: sel ? T.ink : T.dim, marginTop: 1 }}>{Math.round(l.price / 1000)}k</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span style={{ color: T.dim, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: strong ? 800 : 500, fontSize: strong ? 17 : 14, color: strong ? T.gold : T.text }}>{value}</span>
    </div>
  );
}
function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span style={{ fontSize: 12, color: T.dim, display: "block", marginBottom: 6 }}>{label}</span>{children}</label>);
}
