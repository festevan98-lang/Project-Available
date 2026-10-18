// Complete pro forma for one home, in the partner's own section order:
// 1 project, 2 land, 3 design & permits, 4 construction, 5 financing, 6 holding, 7 sale.
// Pure math. Every amount comes from the private cost model; the partner edits the gold inputs.

import type { OwnershipFacts } from './facts';

export type Exit = 'clients' | 'market' | 'rent';

export type Section = 'acq' | 'design' | 'hard' | 'finance' | 'hold' | 'sale';
export type Basis =
  | 'fixed'      // dollars per home
  | 'perTotal'   // dollars per total (under-roof) sq ft
  | 'perLiving'  // dollars per living sq ft
  | 'pctLoan'    // percent of the construction loan
  | 'pctSale'    // percent of the sale price
  | 'perMonth'   // dollars per month held
  | 'titleOwner' // Texas owner's title policy premium on the sale price (TDI basic rate)
  | 'titleLoan';  // Texas loan title policy premium on the construction loan (TDI basic rate)

export interface Bi { es: string; en: string }

export interface CostLine {
  key: string;
  section: Section;
  label: Bi;
  basis: Basis;
  /** Dollars, $/sq ft, percent or $/month depending on basis. */
  amount: number;
  /** Part of FEREST's turnkey contract (design & permits, construction). */
  inContract?: boolean;
  /** The partner can change it (shown gold). */
  editable?: boolean;
  /** Escalate from the cost model's base year (construction costs only). */
  escalate?: boolean;
  /** Bank draw this line is paid in, for the draw schedule. */
  draw?: number;
  /** Default amount per exit when it differs (e.g. no agent commission selling to your own clients). */
  byExit?: Partial<Record<Exit, number>>;
  note?: Bi;
}

export interface DrawStage {
  n: number;
  label: Bi;
  /** City inspection that releases the draw. */
  inspection: Bi;
}

export interface CostModel {
  /** Where the base amounts come from, e.g. "Lot 64 bank budget, June 2024". */
  source: Bi;
  /** Construction cost change from the base year to today, percent. */
  escalationPct: number;
  lines: CostLine[];
  draws: DrawStage[];
  /** Show the builder's administration and margin as its own line in the contract breakdown. */
  showBuilderMargin: boolean;
}

/** Shape check for uploaded models, so a partial one is skipped instead of breaking the page. */
export function isCostModel(m: unknown): m is CostModel {
  const x = m as Partial<CostModel> | null;
  return !!x && typeof x === 'object' && Array.isArray(x.lines) && Array.isArray(x.draws) && typeof x.escalationPct === 'number' && !!x.source && typeof x.source === 'object';
}

/** The first valid model among the keys ("community/plan", plan id, community slug), else the default. */
export function pickCostModel(fallback: CostModel | null | undefined, by: Record<string, CostModel> | null | undefined, keys: string[]): { model: CostModel; key: string | null } | null {
  for (const k of keys) {
    const m = by?.[k];
    if (isCostModel(m)) return { model: m, key: k };
  }
  return isCostModel(fallback) ? { model: fallback, key: null } : null;
}

export interface Inputs {
  units: number;
  exit: Exit;
  salePrice: number;
  rent: number;
  /** Months from lot purchase to sale (or to rent-ready). */
  months: number;
  /** Months of construction (builder's risk, interest draw curve). */
  buildMonths: number;
  /** Loan as a percent of land + contract. 0 = all cash. */
  loanPct: number;
  ratePct: number;
  /** Per-line overrides the partner typed (key -> amount in the line's basis). */
  overrides: Record<string, number>;
}

export interface Home {
  living: number;
  total: number;
  lot: { list: number; partner: number };
  /** Contract price per sq ft of the basis area. */
  rate: { list: number; partner: number };
  /** Area the contract rate applies to (living or total under roof). */
  rateBasis: 'living' | 'total';
}

export interface Row {
  key: string;
  section: Section;
  label: Bi;
  value: number;
  basis: Basis;
  amount: number;
  editable: boolean;
  inContract: boolean;
  draw?: number;
  note?: Bi;
  /** Builder administration and margin (contract minus its cost lines). */
  margin?: boolean;
}

export interface Result {
  partnerTier: boolean;
  /** Contract shown split into cost lines plus builder margin. */
  showSplit: boolean;
  lotPrice: number;
  contract: number;
  /** Contract cost lines at cost, before builder margin. */
  contractCost: number;
  builderMargin: number;
  rows: Row[];
  bySection: Record<Section, number>;
  loan: number;
  cash: number;
  cost: number;
  sale: number;
  profit: number;
  margin: number;
  roi: number;
  roiCash: number;
  annualRoi: number;
  breakEven: number;
  rent: null | { collected: number; expenses: number; net: number; debt: number; cashFlow: number; yieldOnCost: number; cashOnCash: number };
  order: { units: number; cost: number; cash: number; profit: number; rentNet: number };
  draws: { n: number; label: Bi; inspection: Bi; amount: number; cumulative: number; pct: number }[];
}

export const SECTIONS: Section[] = ['acq', 'design', 'hard', 'finance', 'hold', 'sale'];

/** Average share of a construction loan outstanding over the build (draws come in stages). */
export const AVG_DRAW = 0.6;

const r = (n: number) => Math.round(n);

/** Published TDI 2026 basic premiums up to $100,000 (policy amount, premium), interpolated between points. */
const TITLE_POINTS: [number, number][] = [[50000, 465], [60000, 529], [75000, 625], [100000, 780]];
const TITLE_MIN = 308;

/**
 * Texas title policy basic premium (TDI rate schedule effective Mar 1, 2026). Over $100,000:
 * $780 plus $4.94 per $1,000 above $100,000. At or below, the published table points, interpolated,
 * with the $308 minimum. Source: tdi.texas.gov/title/documents/titlerates2026.pdf
 */
export function titlePremium(amount: number): number {
  if (amount <= 0) return 0;
  if (amount > 100000) return Math.round((amount - 100000) * 0.00494) + 780;
  if (amount <= TITLE_POINTS[0][0]) return Math.max(TITLE_MIN, Math.round(TITLE_POINTS[0][1] * amount / TITLE_POINTS[0][0]));
  for (let i = 1; i < TITLE_POINTS.length; i++) {
    const [a1, p1] = TITLE_POINTS[i];
    const [a0, p0] = TITLE_POINTS[i - 1];
    if (amount <= a1) return Math.round(p0 + (p1 - p0) * (amount - a0) / (a1 - a0));
  }
  return 780;
}

function lineValue(l: CostLine, amount: number, home: Home, ctx: { loan: number; sale: number; months: number; esc: number }): number {
  const k = l.escalate ? 1 + ctx.esc / 100 : 1;
  switch (l.basis) {
    case 'fixed': return amount * k;
    case 'perTotal': return amount * home.total * k;
    case 'perLiving': return amount * home.living * k;
    case 'pctLoan': return ctx.loan * amount / 100;
    case 'pctSale': return ctx.sale * amount / 100;
    case 'perMonth': return amount * ctx.months;
    case 'titleOwner': return amount ? titlePremium(ctx.sale) : 0;
    case 'titleLoan': return amount ? titlePremium(ctx.loan) : 0;
  }
}

export function fullProforma(model: CostModel, home: Home, inp: Inputs, f: OwnershipFacts, volumeMin: number): Result {
  const units = Math.max(1, Math.floor(inp.units || 1));
  const partnerTier = units >= volumeMin;
  const lotPrice = partnerTier ? home.lot.partner : home.lot.list;
  const priceArea = home.rateBasis === 'living' ? home.living : home.total;
  const contract = r(priceArea * (partnerTier ? home.rate.partner : home.rate.list));
  const months = Math.max(1, inp.months);
  const renting = inp.exit === 'rent';
  const sale = renting ? 0 : inp.salePrice;
  const loan = r((lotPrice + contract) * Math.max(0, Math.min(90, inp.loanPct)) / 100);
  const ctx = { loan, sale, months, esc: model.escalationPct };
  const amountOf = (l: CostLine) =>
    l.editable && inp.overrides[l.key] != null ? inp.overrides[l.key] : l.byExit?.[inp.exit] ?? l.amount;

  const rows: Row[] = [];
  const push = (l: CostLine, value: number, extra: Partial<Row> = {}) =>
    rows.push({ key: l.key, section: l.section, label: l.label, value: r(value), basis: l.basis, amount: amountOf(l), editable: !!l.editable, inContract: !!l.inContract, draw: l.draw, note: l.note, ...extra });

  // 2. Land: the lot price itself, then the buyer's closing lines.
  rows.push({ key: 'lot', section: 'acq', label: { es: 'Precio del terreno', en: 'Lot price' }, value: lotPrice, basis: 'fixed', amount: lotPrice, editable: false, inContract: false });

  // 3-4. Contract, itemized like a bank draw budget. With a positive builder margin (and the model allowing it),
  // lines at cost plus the builder's line; otherwise each line's share of the contract price, with no margin line.
  const contractLines = model.lines.filter((l) => l.inContract);
  const contractCost = contractLines.reduce((s, l) => s + r(lineValue(l, l.amount, home, ctx)), 0);
  const builderMargin = contract - contractCost;
  // No split without cost lines, or the whole contract would read as builder margin.
  const showSplit = model.showBuilderMargin && contractCost > 0 && builderMargin > 0;
  if (contractLines.length && contractCost > 0) {
    // Shares of the unrounded cost, so a rescaled model (as partners receive it) splits exactly the same.
    const exact = contractLines.reduce((s, l) => s + lineValue(l, l.amount, home, ctx), 0);
    const share = showSplit ? 1 : exact > 0 ? contract / exact : 0;
    const first = rows.length;
    for (const l of contractLines) push(l, lineValue(l, l.amount, home, ctx) * share);
    if (showSplit) {
      rows.push({
        key: 'builderMargin', section: 'hard', inContract: true, editable: false, basis: 'fixed', amount: builderMargin, value: builderMargin, margin: true,
        label: { es: 'Administración, garantía y utilidad del constructor', en: 'Builder administration, warranty and margin' },
      });
    } else {
      // Rounding remainder on the largest line, so the lines add up to the contract exactly.
      const added = rows.slice(first);
      const diff = contract - added.reduce((t, x) => t + x.value, 0);
      if (diff) added.reduce((a, b) => (b.value > a.value ? b : a)).value += diff;
    }
  } else {
    rows.push({
      key: 'contract', section: 'hard', inContract: true, editable: false, basis: home.rateBasis === 'living' ? 'perLiving' : 'perTotal', amount: partnerTier ? home.rate.partner : home.rate.list, value: contract,
      label: { es: 'Contrato llave en mano FEREST', en: 'FEREST turnkey contract' },
    });
  }

  // 2, 5, 6, 7: everything outside the contract.
  for (const l of model.lines.filter((x) => !x.inContract)) {
    if (l.section === 'finance' && loan === 0) { push(l, 0); continue; }
    if (l.section === 'sale' && renting) continue;
    push(l, lineValue(l, amountOf(l), home, ctx));
  }

  // 5. Interest on a construction loan drawn in stages, then carried to sale.
  // The lot share is funded in full at closing; the construction share is drawn as work advances.
  if (loan > 0) {
    const build = Math.min(months, Math.max(1, inp.buildMonths));
    const lotLoan = Math.min(loan, lotPrice * Math.max(0, Math.min(90, inp.loanPct)) / 100);
    const buildLoan = loan - lotLoan;
    const interest = inp.ratePct / 100 / 12 * (lotLoan * months + buildLoan * (build * AVG_DRAW + Math.max(0, months - build)));
    rows.push({ key: 'interest', section: 'finance', label: { es: 'Intereses (obra + venta)', en: 'Interest (build + sale)' }, value: r(interest), basis: 'fixed', amount: inp.ratePct, editable: false, inContract: false });
  }

  // 6. Holding: property tax on the lot plus about half the finished value while building, full value after.
  const build = Math.min(months, Math.max(1, inp.buildMonths));
  const tax = f.taxRate * ((lotPrice + contract / 2) * build + (lotPrice + contract) * Math.max(0, months - build)) / 12;
  rows.push({ key: 'taxHold', section: 'hold', label: { es: 'Predial mientras es suya', en: 'Property tax while held' }, value: r(tax), basis: 'fixed', amount: f.taxRate * 100, editable: false, inContract: false });
  rows.push({ key: 'insHold', section: 'hold', label: { es: 'Seguro de la casa desde la entrega', en: 'Home insurance from delivery' }, value: r(f.insurance * Math.max(0, months - build) / 12), basis: 'fixed', amount: f.insurance, editable: false, inContract: false });
  rows.push({ key: 'hoaHold', section: 'hold', label: { es: 'Cuota HOA', en: 'HOA dues' }, value: r(f.hoa * months / 12), basis: 'fixed', amount: f.hoa, editable: false, inContract: false });

  const bySection = Object.fromEntries(SECTIONS.map((s) => [s, rows.filter((x) => x.section === s).reduce((t, x) => t + x.value, 0)])) as Record<Section, number>;
  const cost = SECTIONS.reduce((t, s) => t + bySection[s], 0);
  const cash = cost - loan;
  const profit = renting ? 0 : sale - cost;
  const roi = cost > 0 ? profit / cost : 0;
  const roiCash = cash > 0 ? profit / cash : 0;

  // Break-even sale price: costs that do not move with the price, plus the percent-of-sale costs and the
  // buyer's title premium, which do. Solved by a few fixed-point steps (the premium is nearly linear).
  const pctSale = model.lines.filter((l) => l.section === 'sale' && l.basis === 'pctSale').reduce((t, l) => t + amountOf(l), 0);
  const priceLinked = rows.filter((x) => x.section === 'sale' && (x.basis === 'pctSale' || x.basis === 'titleOwner'));
  const titleOn = priceLinked.some((x) => x.basis === 'titleOwner' && x.amount);
  const base = cost - priceLinked.reduce((t, x) => t + x.value, 0);
  let be = base / Math.max(0.01, 1 - pctSale / 100);
  for (let i = 0; i < 6; i++) be = (base + (titleOn ? titlePremium(be) : 0)) / Math.max(0.01, 1 - pctSale / 100);
  const breakEven = r(be);

  let rent: Result['rent'] = null;
  if (renting) {
    const collected = inp.rent * 11;
    const expenses = r(collected * 0.1 + inp.rent * 0.5 + f.taxRate * (lotPrice + contract) + f.insurance + f.hoa);
    const net = collected - expenses;
    const debt = r(loan * inp.ratePct / 100);
    rent = { collected, expenses, net, debt, cashFlow: net - debt, yieldOnCost: net / cost, cashOnCash: cash > 0 ? (net - debt) / cash : 0 };
  }

  // Draw schedule: contract lines grouped by the draw they are paid in, scaled to the contract price.
  // Lines shown at their share of the contract are summed as shown, so each draw matches its tagged lines.
  const scale = contractCost > 0 ? contract / contractCost : 1;
  const allocated = !showSplit && contractCost > 0;
  let cumulative = 0;
  const draws = model.draws.map((d, i) => {
    // The last draw takes the rounding remainder so the draws always add up to the contract.
    const amount = i === model.draws.length - 1 ? contract - cumulative
      : allocated ? rows.filter((x) => x.inContract && x.draw === d.n).reduce((t, x) => t + x.value, 0)
      : r(contractLines.filter((l) => l.draw === d.n).reduce((t, l) => t + lineValue(l, l.amount, home, ctx), 0) * scale);
    cumulative += amount;
    return { n: d.n, label: d.label, inspection: d.inspection, amount, cumulative, pct: contract ? cumulative / contract : 0 };
  });

  return {
    partnerTier, showSplit, lotPrice, contract, contractCost, builderMargin, rows, bySection, loan, cash, cost, sale, profit,
    margin: sale > 0 ? profit / sale : 0,
    roi, roiCash,
    annualRoi: roiCash * 12 / months,
    breakEven,
    rent,
    order: { units, cost: cost * units, cash: cash * units, profit: profit * units, rentNet: (rent?.net ?? 0) * units },
    draws,
  };
}
