// Partner pro forma: hard and soft costs for one home, the exit, and the total for an order.
// Pure math. Prices come from the private catalog; the partner edits the assumptions.

import type { OwnershipFacts } from './facts';

export type Exit = 'list' | 'market' | 'rent';

/** Assumptions the partner can change (highlighted in the table). */
export interface Assumptions {
  units: number;
  exit: Exit;
  salePrice: number;
  rent: number;
  sellingPct: number;
  extras: number;
  contingencyPct: number;
  closingBuy: number;
  financePct: number;
  ratePct: number;
  pointsPct: number;
  months: number;
  structure: number;
}

export interface Unit {
  living: number;
  total: number;
  lot: { retail: number; partner: number };
  /** Build price per total sq ft. */
  build: { retail: number; partner: number };
}

export const DEFAULTS: Omit<Assumptions, 'salePrice' | 'rent'> = {
  units: 15,
  exit: 'list',
  sellingPct: 2,
  extras: 0,
  contingencyPct: 3,
  closingBuy: 2000,
  financePct: 0,
  ratePct: 9.5,
  pointsPct: 3.5,
  months: 10,
  structure: 3500,
};

/** Selling cost when the partner sells to his own clients vs. through a local agent. */
export const SELLING_DEFAULT: Record<Exit, number> = { list: 2, market: 6, rent: 0 };

/** Construction loans are drawn as work advances; interest runs on about 60% of the loan on average. */
export const AVG_DRAW = 0.6;

/** Typical build time. Builder's risk is in the build contract; the owner insures from delivery. */
export const BUILD_MONTHS = 8;

export type LineKey =
  | 'lot' | 'build' | 'extras' | 'contingency'
  | 'closingBuy' | 'points' | 'interest' | 'taxHold' | 'insurance' | 'hoa' | 'structure' | 'selling';

export interface Line {
  key: LineKey;
  group: 'hard' | 'soft';
  value: number;
}

export interface Result {
  partnerTier: boolean;
  lotPrice: number;
  buildPrice: number;
  lines: Line[];
  hard: number;
  soft: number;
  cost: number;
  loan: number;
  cash: number;
  sale: number;
  profit: number;
  margin: number;
  roi: number;
  annualRoi: number;
  /** List minus partner price for this home: the room the partner sells into. */
  spread: number;
  rent: null | {
    collected: number;
    expenses: number;
    net: number;
    debt: number;
    cashFlow: number;
    yieldOnCost: number;
    cashOnCash: number;
  };
  order: { units: number; cost: number; cash: number; profit: number; rentNet: number };
}

const r = (n: number) => Math.round(n);

export function proforma(u: Unit, a: Assumptions, f: OwnershipFacts, volumeMin: number): Result {
  const units = Math.max(1, Math.floor(a.units || 1));
  const partnerTier = units >= volumeMin;
  const lotPrice = partnerTier ? u.lot.partner : u.lot.retail;
  const buildPrice = r(u.total * (partnerTier ? u.build.partner : u.build.retail));
  const months = Math.max(1, a.months);
  const renting = a.exit === 'rent';

  const contingency = r((buildPrice + a.extras) * a.contingencyPct / 100);
  const hard = lotPrice + buildPrice + a.extras + contingency;
  const loan = r(hard * a.financePct / 100);
  const points = r(loan * a.pointsPct / 100);
  const interest = r(loan * a.ratePct / 100 * months / 12 * AVG_DRAW);
  // Property tax while held, on the lot plus about half the finished value on average.
  const taxHold = r(f.taxRate * (lotPrice + buildPrice / 2) * months / 12);
  const insurance = r(f.insurance * Math.max(0, months - BUILD_MONTHS) / 12);
  const hoa = r(f.hoa * months / 12);
  const structure = r(a.structure / units);
  const sale = renting ? 0 : a.salePrice;
  const selling = r(sale * a.sellingPct / 100);

  const lines: Line[] = [
    { key: 'lot', group: 'hard', value: lotPrice },
    { key: 'build', group: 'hard', value: buildPrice },
    { key: 'extras', group: 'hard', value: a.extras },
    { key: 'contingency', group: 'hard', value: contingency },
    { key: 'closingBuy', group: 'soft', value: a.closingBuy },
    { key: 'points', group: 'soft', value: points },
    { key: 'interest', group: 'soft', value: interest },
    { key: 'taxHold', group: 'soft', value: taxHold },
    { key: 'insurance', group: 'soft', value: insurance },
    { key: 'hoa', group: 'soft', value: hoa },
    { key: 'structure', group: 'soft', value: structure },
    ...(renting ? [] : [{ key: 'selling' as const, group: 'soft' as const, value: selling }]),
  ];
  const soft = lines.filter((l) => l.group === 'soft').reduce((s, l) => s + l.value, 0);
  const cost = hard + soft;
  const cash = cost - loan;
  const profit = renting ? 0 : sale - cost;

  let rent: Result['rent'] = null;
  if (renting) {
    const collected = a.rent * 11;
    const expenses = r(collected * 0.1 + a.rent * 0.5 + f.taxRate * hard + f.insurance + f.hoa);
    const net = collected - expenses;
    const debt = r(loan * a.ratePct / 100);
    const cashFlow = net - debt;
    rent = { collected, expenses, net, debt, cashFlow, yieldOnCost: net / cost, cashOnCash: cash > 0 ? cashFlow / cash : 0 };
  }

  const roi = cash > 0 ? profit / cash : 0;
  const spread = (u.lot.retail - u.lot.partner) + r(u.total * (u.build.retail - u.build.partner));
  return {
    partnerTier, lotPrice, buildPrice, lines, hard, soft, cost, loan, cash, sale, profit,
    margin: sale > 0 ? profit / sale : 0,
    roi,
    annualRoi: roi * 12 / months,
    spread,
    rent,
    order: { units, cost: cost * units, cash: cash * units, profit: profit * units, rentNet: (rent?.net ?? 0) * units },
  };
}

/** FEREST's margin on one home at the prices the partner pays (owner view only). */
export function ferestMargin(u: Unit, res: Result, buildCost: number, lotCost: number | null) {
  const build = res.buildPrice - r(u.total * buildCost);
  const lot = lotCost != null ? res.lotPrice - lotCost : null;
  return { build, lot, unit: build + (lot ?? 0), order: (build + (lot ?? 0)) * res.order.units };
}
