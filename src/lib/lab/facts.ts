// Public, sourced figures for the cost of owning in each subdivision (researched Oct 13, 2026).
// Prices themselves stay in the private catalog; these are rates and market references only.

export interface Source {
  label: string;
  url: string;
}

export interface OwnershipFacts {
  /** Combined property tax rate for the tax year, as a fraction. */
  taxRate: number;
  taxNote: string;
  insurance: number;
  hoa: number;
  rentBase: number;
  rentLow: number;
  rentHigh: number;
  /** Plain-language market reference for this subdivision (closings or asks). */
  market: { es: string; en: string };
  sources: Source[];
}

const TAX_HIDALGO: Source = { label: 'Hidalgo County, resumen de tasas 2021-2025', url: 'https://www.hidalgocounty.us/DocumentCenter/View/71282/5yrsummary2021_2025' };
const TAX_MISSION: Source = { label: 'The Monitor: Mission adopta tasa 2026', url: 'https://myrgv.com/local-news/2026/09/23/mission-adopts-new-property-tax-rate-for-upcoming-fiscal-year/' };
const HOMESTEAD: Source = { label: 'Texas Comptroller: exenciones', url: 'https://comptroller.texas.gov/taxes/property-tax/exemptions/' };
const LAGUNA_COMPS: Source = { label: 'Redfin / McAllen MLS, cierres Laguna Oaks 2024-2026', url: 'https://www.redfin.com/city/12485/TX/Mission' };
const SISU: Source = { label: 'Sisu Development, Pecan Heights', url: 'https://sisudevelopment.com/pecan-heights/' };

const lagunaMarket = {
  es: 'Casas nuevas de 3 recámaras y ~1,540 ft² habitables en Laguna Oaks se han vendido entre $280,000 y $292,000 (2024-2026).',
  en: 'New 3-bedroom, ~1,540 living sq ft homes in Laguna Oaks have closed between $280,000 and $292,000 (2024-2026).',
};

export const FACTS: Record<string, OwnershipFacts> = {
  'laguna-heights': {
    taxRate: 0.025695, taxNote: 'Mission, Hidalgo County, TY2025', insurance: 3000, hoa: 550,
    rentBase: 2000, rentLow: 1850, rentHigh: 2200, market: lagunaMarket,
    sources: [TAX_HIDALGO, TAX_MISSION, HOMESTEAD, LAGUNA_COMPS],
  },
  'laguna-oaks': {
    taxRate: 0.025695, taxNote: 'Mission, Hidalgo County, TY2025', insurance: 3000, hoa: 550,
    rentBase: 2000, rentLow: 1850, rentHigh: 2200, market: lagunaMarket,
    sources: [TAX_HIDALGO, TAX_MISSION, HOMESTEAD, LAGUNA_COMPS],
  },
  'one-place-pecan': {
    taxRate: 0.022797, taxNote: 'McAllen, Hidalgo County, TY2025', insurance: 3000, hoa: 456,
    rentBase: 1850, rentLow: 1750, rentHigh: 1950,
    market: {
      es: 'El desarrollador vecino pide $348,000 por un townhouse de 1,474 ft² en el mismo fraccionamiento (precio de lista; aún sin cierres registrados).',
      en: 'The neighboring developer asks $348,000 for a 1,474 sq ft townhome in the same subdivision (asking price; no recorded closings yet).',
    },
    sources: [TAX_HIDALGO, HOMESTEAD, SISU],
  },
};

export const APPRECIATION = {
  es: 'En el área McAllen-Mission los valores subieron ~6.4-6.8% anual en 10 años y se han mantenido estables en los últimos 12 meses.',
  en: 'McAllen-Mission values rose ~6.4-6.8% a year over 10 years and have been flat over the last 12 months.',
  source: { label: 'FHFA HPI, McAllen-Edinburg-Mission MSA', url: 'https://www.fhfa.gov/data/hpi' } as Source,
};

export interface AnnualCost {
  tax: number;
  insurance: number;
  hoa: number;
  total: number;
}

export function annualCost(price: number, f: OwnershipFacts, built: boolean): AnnualCost {
  const tax = Math.round(price * f.taxRate);
  const insurance = built ? f.insurance : 0;
  const total = tax + insurance + f.hoa;
  return { tax, insurance, hoa: f.hoa, total };
}

/** Net rental income: 11 months rented, 10% management, half a month leasing fee, then tax, insurance and HOA. */
export function rentalNet(price: number, f: OwnershipFacts, rent = f.rentBase) {
  const collected = rent * 11;
  const management = Math.round(collected * 0.1);
  const leasing = Math.round(rent * 0.5);
  const cost = annualCost(price, f, true);
  const net = collected - management - leasing - cost.total;
  return { rent, collected, management, leasing, ...cost, net, yieldPct: net / price };
}
