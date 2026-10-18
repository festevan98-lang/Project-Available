// Market comparables: summary stats and a tolerant CSV reader for MLS exports. Pure; safe in client code.

import type { Comp } from './types';

export const median = (xs: number[]): number | null => {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

export const perLiving = (c: Comp) => (c.livingSqft && c.price ? c.price / c.livingSqft : null);

export interface CommunityStats {
  community: string;
  soldNew: { median: number | null; low: number | null; high: number | null; count: number };
  active: { median: number | null; count: number };
  rent: { low: number | null; high: number | null; count: number };
  lotPerSqft: { median: number | null; count: number };
}

export function statsFor(comps: Comp[], community: string): CommunityStats {
  const mine = comps.filter((c) => c.community === community);
  const homes = mine.filter((c) => c.kind === 'home' || c.kind === 'townhome');
  const sold = homes.filter((c) => c.status === 'sold' && c.newConstruction !== false).map(perLiving).filter((x): x is number => x != null);
  const active = homes.filter((c) => c.status === 'active' || c.status === 'pending').map(perLiving).filter((x): x is number => x != null);
  const rents = mine.filter((c) => c.kind === 'rental').map((c) => c.price);
  const lots = mine.filter((c) => c.kind === 'lot' && c.lotSqft).map((c) => c.price / c.lotSqft!);
  return {
    community,
    soldNew: { median: median(sold), low: sold.length ? Math.min(...sold) : null, high: sold.length ? Math.max(...sold) : null, count: sold.length },
    active: { median: median(active), count: active.length },
    rent: { low: rents.length ? Math.min(...rents) : null, high: rents.length ? Math.max(...rents) : null, count: rents.length },
    lotPerSqft: { median: median(lots), count: lots.length },
  };
}

/** Splits one CSV line, honoring quotes. */
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const num = (s: string | undefined) => {
  if (!s) return undefined;
  const v = Number(s.replace(/[$,\s]/g, ''));
  return Number.isFinite(v) && v > 0 ? v : undefined;
};

/**
 * Reads an MLS or listing-site CSV export into comps. Column names vary between exports,
 * so each field is matched by name; rows without an address or a price are skipped.
 */
export function parseCompsCsv(text: string, community: string, city: string): { comps: Comp[]; skipped: number; columns: string[] } {
  const rows = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (rows.length < 2) return { comps: [], skipped: 0, columns: [] };
  const head = splitCsv(rows[0]).map((h) => h.toLowerCase());
  const col = (re: RegExp, not?: RegExp) => head.findIndex((h) => re.test(h) && !(not && not.test(h)));
  const ix = {
    address: col(/^address$|full address|street address|dirección|direccion/),
    stNum: col(/street ?(number|#|no)/),
    stName: col(/street ?name/),
    city: col(/^city$|ciudad/),
    sub: col(/subdiv|legal sub|fraccionamiento/),
    status: col(/status|estatus/),
    closePrice: col(/close price|sold price|sale price|closed price|precio de venta/),
    listPrice: col(/list price|asking|^price$|precio/),
    date: col(/close date|sold date|closing date|fecha/),
    listDate: col(/list date|listing date/),
    beds: col(/bed|rec[aá]maras/),
    bathsFull: col(/bath.*full|full bath|^baths?$|baños/),
    bathsHalf: col(/half/),
    living: col(/sq ?ft|sqft|living|heated|square feet|area/, /lot|acre/),
    lot: col(/lot.*(sq|size|area)|lot sqft/),
    acres: col(/acre/),
    year: col(/year built|año/),
    type: col(/property type|prop type|type|tipo/),
    url: col(/url|link/),
  };
  const get = (cells: string[], i: number) => (i >= 0 ? cells[i] : undefined);
  const comps: Comp[] = [];
  let skipped = 0;
  for (const line of rows.slice(1)) {
    const c = splitCsv(line);
    const address = get(c, ix.address) || [get(c, ix.stNum), get(c, ix.stName)].filter(Boolean).join(' ');
    const statusRaw = (get(c, ix.status) ?? '').toLowerCase();
    const status: Comp['status'] = /closed|sold|vendid/.test(statusRaw) ? 'sold' : /pend|contract|option|contingent/.test(statusRaw) ? 'pending'
      : /leased|rented/.test(statusRaw) ? 'leased' : /active|activ/.test(statusRaw) ? 'active' : 'unknown';
    const price = (status === 'sold' ? num(get(c, ix.closePrice)) : undefined) ?? num(get(c, ix.listPrice)) ?? num(get(c, ix.closePrice));
    if (!address || !price) { skipped++; continue; }
    const typeRaw = (get(c, ix.type) ?? '').toLowerCase();
    const kind: Comp['kind'] = /lease|rent/.test(typeRaw) || status === 'leased' ? 'rental' : /land|lot|terreno/.test(typeRaw) ? 'lot' : /town|condo/.test(typeRaw) ? 'townhome' : 'home';
    const year = num(get(c, ix.year));
    const acres = num(get(c, ix.acres));
    const half = num(get(c, ix.bathsHalf)) ?? 0;
    const full = num(get(c, ix.bathsFull));
    comps.push({
      address,
      city: get(c, ix.city) || city,
      subdivision: get(c, ix.sub) || undefined,
      kind,
      status,
      price,
      date: get(c, ix.date) || get(c, ix.listDate) || undefined,
      beds: num(get(c, ix.beds)),
      baths: full != null ? full + half / 2 : undefined,
      livingSqft: num(get(c, ix.living)),
      lotSqft: num(get(c, ix.lot)) ?? (acres ? Math.round(acres * 43560) : undefined),
      yearBuilt: year,
      newConstruction: year ? year >= new Date().getFullYear() - 2 : undefined,
      sourceUrl: get(c, ix.url) || undefined,
      community,
    });
  }
  return { comps, skipped, columns: head };
}
