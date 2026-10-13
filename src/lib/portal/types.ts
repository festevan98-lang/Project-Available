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
  /** Set false to stop this investor's share links from opening. */
  share?: boolean;
  /** WhatsApp number, digits with country code; people he shares with contact him here. */
  whatsapp?: string;
}

/** Map pin for Apple Maps (satellite view). */
export interface MapPin {
  lat?: number;
  lng?: number;
  /** Street address, used when there are no coordinates. */
  address?: string;
}

/** Price per square foot: list (retail) and the investor's price. */
export interface Rate {
  retail: number;
  price: number;
}

/** A home that can be built on a catalog lot. Prices exclude the lot. */
export interface CatalogHome {
  id: string;
  name: string;
  type?: L10n;
  beds?: number;
  baths?: number;
  /** Living (air-conditioned) area; banks appraise on this. */
  sqft?: number;
  /** Total area under roof (living + garage, porch, patio); builders price per this. */
  totalSqft?: number;
  garage?: L10n;
  /** One short line shown under the name. */
  note?: L10n;
  /** "/public/path.jpg" or "media/<file>" inside the catalog's private folder. */
  image?: string;
  /** Extra photos for the detail gallery (real photos and renders). */
  gallery?: { src: string; caption?: L10n }[];
  /** Build price excluding the lot; when null, computed from the project's buildRate x sqft. */
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
  /** The investor's price; defaults to lotRate x sqft, else the list price less the catalog discount. */
  price?: number | null;
  address?: string;
  map?: MapPin;
}

export interface CatalogProject {
  slug: string;
  name: string;
  place: L10n;
  blurb?: L10n;
  /** "/public/path.jpg" or "media/<file>" inside the catalog's private folder. */
  image: string;
  caption?: L10n;
  /** Image for the lot screens (the land itself); falls back to image. */
  lotImage?: string;
  lotCaption?: L10n;
  /** Pull lot size and retail price from the live map for this subdivision. */
  live?: 'laguna-heights';
  map?: MapPin;
  /** Lot price per sqft of land. */
  lotRate?: Rate;
  /** Build price per sqft of total area under roof. */
  buildRate?: Rate;
  /** Appraisal value per living sqft for the area, used to show estimated value. */
  appraisal?: { perSqft: number; note: L10n };
  lots: CatalogLot[];
  homes: CatalogHome[];
}

export interface Catalog {
  id: string;
  updatedAt: string;
  /** Investor discount on the lot price, as a fraction (0-1). */
  lotDiscount: number;
  intro: L10n;
  /** The investor's own brand, shown next to FEREST and on pages he shares. */
  brand?: { name: string; logo?: string };
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
