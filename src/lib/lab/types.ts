import type { CostModel } from './fullProforma';

// White-label partner portal ("lab"). All data lives in the private Blob store
// under portal/lab/, separate from the live investor portal's files.

export interface LabPartner {
  slug: string;
  name: string;
  /** Catalog media path, e.g. "media/partner-logo.png" (served through the catalog's share link). */
  logo?: string;
  /** Live portal catalog that holds this partner's prices (read-only here). */
  catalogId: string;
  /** Investor record in the live portal that owns the catalog; used to sign media links. */
  investorId: string;
  /** Digits with country code; clients message the partner here. */
  whatsapp: string;
  contactName: string;
  /** Where the partner is based, shown on the public page. */
  city: string;
  /** Larger opportunities shown beside the catalog (e.g. land for an operating business). */
  opportunities?: Opportunity[];
  /** Partner pro forma inputs: plans, volume tier and client pricing. */
  numbers?: LabNumbers;
}

export interface Opportunity {
  id: string;
  title: string;
  place: { es: string; en: string };
  summary: { es: string; en: string };
  facts: { label: { es: string; en: string }; value: string | { es: string; en: string } }[];
  fit: { es: string; en: string };
  /** Public image path. */
  image?: string;
}

export interface LabAccount {
  id: string;
  name: string;
  /** owner = FEREST, partner = the partner's panel, client = a shared code that opens the partner's client view. */
  role: 'owner' | 'partner' | 'client';
  /** Partner slug this account manages; owners may manage any partner. */
  partner: string;
  /** For client codes: the client link the code opens (so visits are tracked like any link). */
  linkId?: string;
  codeHash: string;
}

export interface LabEvent {
  t: string;
  type: string;
  detail?: string;
}

export interface ClientLink {
  id: string;
  partner: string;
  /** Who the partner sent it to (name or note); private to the partner and FEREST. */
  label: string;
  createdAt: string;
  createdBy: string;
  revokedAt?: string;
  opens: number;
  lastOpenedAt?: string;
  events: LabEvent[];
}

export interface LabLead {
  id: string;
  partner: string;
  kind: 'access' | 'visit' | 'interest';
  name: string;
  phone: string;
  email: string;
  interest: string[];
  message: string;
  /** Client link the request came through, if any. */
  linkId?: string;
  createdAt: string;
}

/** A floor plan FEREST can build on the partner's lots (sizes may be pending final plans). */
export interface LabPlan {
  id: string;
  name: string;
  style: { es: string; en: string };
  beds: number;
  baths: number;
  garage?: { es: string; en: string };
  /** Living (heated) sq ft: what banks appraise. */
  living: number;
  /** Total sq ft under roof: what construction is priced on. */
  total: number;
  /** Catalog media paths. */
  images?: string[];
  /** Subdivision slugs where this plan is offered. */
  communities: string[];
  /** Already built and photographed. */
  real?: boolean;
  /** Dimensions pending final plans. */
  review?: boolean;
}

export interface LabNumbers {
  /** Units per order that unlock partner pricing; below it, list prices apply. */
  volumeMin: number;
  plans: LabPlan[];
  /** Prices the partner's clients see on client links (default until the partner sets their own). */
  clientPrice: 'list' | 'partner';
  /** Lab build price per sq ft (list and partner) and the area it applies to. Overrides the catalog rate. */
  buildRate?: { retail: number; price: number };
  buildBasis?: 'living' | 'total';
  /** Plat recording status per subdivision slug, shown in the build tab. */
  platStatus?: Record<string, { es: string; en: string }>;
  /** Full pro forma cost lines (private; from FEREST's bank budget). */
  costModel?: CostModel;
}

/** FEREST's own costs, readable only by owner accounts. */
export interface OwnerEconomics {
  /** Actual build cost per total sq ft. */
  buildCost: number;
  buildCostNote: string;
  /** FEREST cost basis per lot, by subdivision slug. */
  lotCost: Record<string, number>;
  /** Line items from the bank package, for reference. */
  lines?: { label: string; amount: number }[];
}

/** What the partner's clients see on client links and the brochure. */
export interface ClientPricing {
  mode: 'partner' | 'list' | 'markup';
  /** Percent added to the partner's own price when mode is 'markup'. */
  markupPct: number;
}

/** Settings the partner controls from their panel. */
export interface PartnerSettings {
  clientPricing: ClientPricing;
  updatedAt: string;
  updatedBy: string;
}

/** One market comparable (public listing or MLS export). */
export interface Comp {
  address: string;
  subdivision?: string;
  city: string;
  kind: 'home' | 'townhome' | 'lot' | 'rental';
  status: 'sold' | 'active' | 'pending' | 'leased' | 'unknown';
  price: number;
  date?: string;
  beds?: number;
  baths?: number;
  livingSqft?: number;
  lotSqft?: number;
  yearBuilt?: number;
  newConstruction?: boolean;
  builder?: string;
  sourceUrl?: string;
  notes?: string;
  /** Partner subdivision slug this comp is compared against. */
  community: string;
}

export interface MarketData {
  updatedAt: string;
  /** Where the comps came from (public listings, MLS export from a licensed agent, ...). */
  source: string;
  comps: Comp[];
  /** Plain-language note per subdivision slug (e.g. where its comps come from). */
  notes?: Record<string, string>;
}

export type StageStatus = 'pending' | 'scheduled' | 'passed' | 'failed';

/** A home under construction, tracked by city inspection stage. */
export interface Build {
  id: string;
  partner: string;
  /** Shown to the partner, e.g. "Laguna Heights · Lot 36 · Laguna". */
  label: string;
  community: string;
  stages: Partial<Record<import('./permits').StageKey, { status: StageStatus; date?: string; note?: string }>>;
  createdAt: string;
  updatedAt: string;
}
