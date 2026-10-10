// Investor portal data shapes. The data itself lives in the private Vercel Blob
// store (portal/...), never in this repo.

export interface InvestorPosition {
  invested: number | null;
  status: string;
}

export type Lang = 'es' | 'en';
export type L10n = Record<Lang, string>;

export interface Investor {
  id: string;
  name: string;
  role: 'owner' | 'investor';
  codeHash: string;
  projects: Record<string, InvestorPosition>;
  company?: string;
  /** Default portal language for this investor. */
  lang?: Lang;
  /** Id of a private price catalog (portal/catalogs/<id>/catalog.json). */
  catalog?: string;
}

/** A home that can be built on a catalog lot. Prices exclude the lot. */
export interface CatalogHome {
  id: string;
  name: string;
  type?: L10n;
  beds: number;
  baths: number;
  sqft: number;
  garage?: L10n;
  retail: number | null;
  price: number | null;
  /** Placeholder figures still under review; shown to the investor as preliminary. */
  preliminary?: boolean;
}

export interface CatalogLot {
  lot: string | null;
  sqft?: number | null;
  preliminary?: boolean;
  /** FEREST's list price; required for lots that show as sold on the live map. */
  retail?: number | null;
}

export interface CatalogProject {
  slug: string;
  name: string;
  place: L10n;
  blurb: L10n;
  /** "/public/path.jpg" or "media/<file>" inside the catalog's private folder. */
  image: string;
  caption?: L10n;
  /** Pull lot size and retail price from the live map for this subdivision. */
  live?: 'laguna-heights';
  lots: CatalogLot[];
  homes: CatalogHome[];
}

export interface Catalog {
  id: string;
  updatedAt: string;
  /** Investor discount on the lot price, as a fraction (0-1). */
  lotDiscount: number;
  intro: L10n;
  projects: CatalogProject[];
}

export interface PortalFile {
  file: string;
  caption: string;
}

export interface PortalProject {
  slug: string;
  name: string;
  unit: string;
  subtitle: string;
  address: string;
  stage: string;
  updatedAt: string;
  hero: PortalFile;
  glance: { label: string; value: string }[];
  terms: {
    dealSize: number;
    prefRate: number;
    investorSplit: number;
    projectedInvestorProfit: number;
    minInvest?: number;
    maxInvest?: number;
    summary: string;
    waterfall: string[];
  };
  budget: { item: string; budget: number; spent: number }[];
  projection: { label: string; value: number; strong?: boolean }[];
  milestones: { label: string; status: 'done' | 'current' | 'next'; date?: string }[];
  updates: { date: string; title: string; body: string }[];
  home: {
    plan: string;
    specs: [string, string][];
    features: string[];
    nearby: string;
    gallery: PortalFile[];
  };
  docs: { label: string; file: string | null; note?: string }[];
  risks: string[];
}
