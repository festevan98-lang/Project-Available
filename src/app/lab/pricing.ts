// Client-facing prices under the partner's pricing choice. Pure: safe in client components.

import type { ClientPricing } from '@/lib/lab/types';
import type { AppProject } from '../portal/catalogData';

type Priced = { retail: number | null; price: number | null; rate: { retail: number; price: number } | null; sqft?: number | null; totalSqft?: number | null };

/** Price shown to clients for one item under the partner's pricing choice. */
export function clientPrice<X extends Priced>(x: X, pricing: ClientPricing): X {
  if (pricing.mode === 'partner') return x;
  if (pricing.mode === 'list') return { ...x, price: x.retail ?? x.price, rate: x.rate ? { ...x.rate, price: x.rate.retail } : null };
  const f = 1 + Math.max(0, pricing.markupPct) / 100;
  // With a per-sq-ft rate, price = rounded rate x sq ft so the client's breakdown multiplies out exactly.
  const area = x.totalSqft ?? x.sqft ?? null;
  if (x.rate && area) {
    const rate = Math.round(x.rate.price * f * 100) / 100;
    return { ...x, price: Math.round(rate * area), rate: { ...x.rate, price: rate } };
  }
  return { ...x, price: x.price != null ? Math.round(x.price * f) : null, rate: x.rate ? { ...x.rate, price: Math.round(x.rate.price * f * 100) / 100 } : null };
}

/** What a client link shows, per the partner's pricing choice. */
export function clientProjects(projects: AppProject[], pricing: ClientPricing): AppProject[] {
  return projects.map((p) => ({ ...p, lots: p.lots.map((l) => clientPrice(l, pricing)), homes: p.homes.map((h) => clientPrice(h, pricing)) }));
}
