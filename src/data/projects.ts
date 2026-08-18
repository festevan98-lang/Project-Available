// Single source of truth for FEREST subdivisions + engineering portfolio (revamp v3).
// Every block on /projects renders from this file. Adding one is a one-line edit.
// Never invent numbers - only carry stats we can back from a recorded plat.
//
// COPY RULES enforced here:
//  - Title Case labels, ASCII only, no em-dashes.
//  - The Conway duplex deal is shown only by its publicName below, never the
//    private project name it carries in our files.
//  - No return-math / projected / risk language. Stats are Lots / Acres / Units
//    / Sqft / status only.

export type ProjectStatus = 'Selling' | 'Ready' | 'In Design';

// The development lifecycle every FEREST subdivision moves through.
export const STAGES = ['Feasibility', 'Plans', 'Construction', 'Sales'] as const;
export type Stage = (typeof STAGES)[number];

export interface ProjectStat {
  /** Short Title Case label: Lots, Acres, Units, Typical Lot, etc. */
  label: string;
  /** Value string, carried exactly from site/plat data. */
  value: string;
}

/* ------------------------------------------------------------------ pipeline */
// FEREST-controlled deals: for sale or actively being built.

export interface Subdivision {
  id: string;
  name: string;
  /** Public-facing name. Falls back to name when omitted. */
  publicName?: string;
  city: string;
  status: ProjectStatus;
  /** Current position in the STAGES lifecycle (0 = Feasibility ... 3 = Sales). */
  stageIndex: number;
  /** Development type chip: Single-Family, Townhomes, Duplex, etc. */
  devType: string;
  /** Up to three numeric chips shown in the pipeline row. No prices. */
  stats: ProjectStat[];
  audience: Array<'retail' | 'pipeline'>;
  flags?: { hidden?: boolean; ownerConfirm?: boolean };
}

export const SUBDIVISIONS: Subdivision[] = [
  {
    id: 'laguna-heights',
    name: 'Laguna Heights',
    city: 'Mission, TX',
    status: 'Selling',
    stageIndex: 3,
    devType: 'Single-Family',
    stats: [
      { label: 'Lots', value: '141' },
      { label: 'Acres', value: '27' },
    ],
    audience: ['retail', 'pipeline'],
  },
  {
    id: 'laguna-oaks-2',
    name: 'Laguna Oaks Phase II',
    city: 'Mission, TX',
    status: 'Selling',
    stageIndex: 3,
    devType: 'Single-Family',
    stats: [
      { label: 'FEREST Lots', value: '3' },
      { label: 'Acres', value: '15.8' },
    ],
    audience: ['retail', 'pipeline'],
  },
  {
    id: 'augusta',
    name: 'Augusta Townhomes',
    city: 'Mission, TX',
    status: 'Ready',
    stageIndex: 2,
    devType: 'Townhomes',
    stats: [
      { label: 'Lots', value: '30' },
      { label: 'Acres', value: '2.727' },
    ],
    audience: ['pipeline'],
  },
  {
    id: 'conway-duplex',
    name: 'Conway Duplex (private ref)', // internal only - never rendered
    publicName: 'Duplex Development, Conway Corridor',
    city: 'Mission, TX',
    status: 'Ready',
    stageIndex: 2,
    devType: 'Duplex',
    stats: [
      { label: 'Lots', value: '48' },
      { label: 'Units', value: '96' },
      { label: 'Acres', value: '9.37' },
    ],
    audience: ['pipeline'],
  },
];

/** Public-facing name, honoring the publicName override. */
export function publicNameOf(p: Subdivision): string {
  return p.publicName ?? p.name;
}

/** Pipeline rows: visible projects tagged for the pipeline block. */
export const PIPELINE_ROWS: Subdivision[] = SUBDIVISIONS.filter(
  (p) => p.audience.includes('pipeline') && !p.flags?.hidden,
);

/* ------------------------------------------------------------------ portfolio */
// Recorded subdivisions platted + engineered by the FEREST / M2 team. Proof of
// work only - these are owned by other developers. NO ownership claim, no prices.

export interface PortfolioProject {
  id: string;
  name: string;
  city: string;
  /** Optional status chip, e.g. "Success Story" or "Sold". */
  tag?: string;
  stats: ProjectStat[];
  /** Apple Maps search query. */
  mapsQuery?: string;
  /** Optional availability note (e.g. a built unit for rent or sale). */
  note?: string;
  /** Optional WhatsApp CTA tied to the note. */
  noteCta?: { label: string; waText: string };
}

export const PORTFOLIO: PortfolioProject[] = [
  {
    id: 'angelica-2',
    name: "Angelica's Dream V2",
    city: 'Weslaco / Alamo, TX',
    tag: 'Success Story',
    stats: [
      { label: 'Lots', value: '68' },
      { label: 'Acres', value: '10' },
    ],
    mapsQuery: "Angelica's Dream Subdivision, Weslaco, TX",
    note: 'Designed By Our Team. Sold And Now Being Built By The Buyer.',
  },
  {
    id: 'las-cumbres',
    name: 'Las Cumbres Terrace',
    city: 'Mission, TX',
    stats: [
      { label: 'Lots', value: '12' },
      { label: 'Acres', value: '4.5' },
    ],
    mapsQuery: 'Las Cumbres Terrace Subdivision, Mission, TX',
    note: 'Lots Sold Out. A Fourplex Is Available To Rent Or Buy.',
    noteCta: { label: 'Fourplex - Rent Or Buy', waText: 'Hi FEREST, Tell Me About The Las Cumbres Fourplex (Rent Or Buy).' },
  },
  {
    id: 'garden-path',
    name: 'Garden Path Subdivision',
    city: 'Mission, TX',
    stats: [
      { label: 'Lots', value: '~80' },
      { label: 'Acres', value: '8.867' },
    ],
    mapsQuery: 'Garden Path Subdivision, Mission, TX',
  },
  {
    id: 'one-place-pecan',
    name: 'One Place Pecan',
    city: 'McAllen, TX',
    stats: [
      { label: 'Lots', value: '14' },
      { label: 'Acres', value: '1.515' },
    ],
    mapsQuery: 'One Place Pecan Subdivision, McAllen, TX',
  },
  {
    id: 'laguna-oaks-1',
    name: 'Laguna Oaks Phase I',
    city: 'Mission, TX',
    stats: [
      { label: 'Acres', value: '11.861' },
      { label: 'Type', value: 'Single-Family' },
    ],
    mapsQuery: 'Laguna Oaks Subdivision, Mission, TX',
  },
];

/* ------------------------------------------------------------------ design + build */
// Vertical construction - homes under way and commercial spaces FEREST builds.

export interface BuildProject {
  id: string;
  name: string;
  location: string;
  type: 'Home' | 'Commercial';
  image: string;
  /** Sold / Concept / Open, etc. */
  status?: string;
  /** Live site for operating businesses. */
  website?: string;
  /** Apple Maps search query. */
  mapsQuery?: string;
}

export const CONSTRUCTION: BuildProject[] = [
  { id: 'lot64', name: 'Lot 64, Laguna Oaks', location: '809 La Laguna Rd, Mission TX', type: 'Home', image: '/models/ferest-model-ext-1.webp', status: 'Sold', mapsQuery: '809 La Laguna Rd, Mission, TX' },
  { id: 'lot77', name: 'Lot 77, Garden Path', location: 'Mission, TX', type: 'Home', image: '/construction/lot77-garden-path.webp', status: 'Sold', mapsQuery: 'Garden Path Subdivision, Mission, TX' },
  { id: 'luma', name: 'LUMA Cocktail Lounge', location: 'McAllen, TX', type: 'Commercial', image: '/construction/luma.webp', status: 'Open', website: 'https://lumalounge.co', mapsQuery: 'LUMA Cocktail Lounge, 7001 N 10th St, McAllen, TX' },
  { id: 'mil-besos', name: 'Mil Besos Cocktail Bar', location: 'Rio Grande Valley, TX', type: 'Commercial', image: '/construction/mil-besos.webp', status: 'Concept' },
];

/* ------------------------------------------------------------------ land pipeline */
// Raw-land deals in diligence. Vague by design - detail lives in the deal sheet.

export interface LandDeal {
  id: string;
  area: string;
  city: string;
}

export const LAND_PIPELINE: LandDeal[] = [
  { id: 'san-benito-10', area: '10 Acres', city: 'San Benito, TX' },
  { id: 'san-benito-12', area: '12.22 Acres', city: 'San Benito, TX' },
  { id: 'hick-hill-7', area: '7 Acres', city: 'Harlingen, TX' },
  { id: 'paloma', area: 'Paloma Lane', city: 'Harlingen, TX' },
];

/* ------------------------------------------------------------------ map */
// Approximate parcel locations for the "Where We Build" map. Coordinates are
// vicinity-level (city / corridor), not surveyed boundaries - refine anytime.

export interface MapParcel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'built' | 'developed';
}

export const MAP_PARCELS: MapParcel[] = [
  { id: 'laguna-heights', name: 'Laguna Heights', lat: 26.1575, lng: -98.2885, kind: 'developed' },
  { id: 'laguna-oaks', name: 'Laguna Oaks I & II', lat: 26.1605, lng: -98.2835, kind: 'developed' },
  { id: 'garden-path', name: 'Garden Path', lat: 26.2015, lng: -98.2805, kind: 'developed' },
  { id: 'las-cumbres', name: 'Las Cumbres Terrace', lat: 26.1925, lng: -98.3125, kind: 'developed' },
  { id: 'augusta', name: 'Augusta Townhomes', lat: 26.2360, lng: -98.2915, kind: 'developed' },
  { id: 'one-place-pecan', name: 'One Place Pecan', lat: 26.2230, lng: -98.2435, kind: 'developed' },
  { id: 'conway-duplex', name: 'Conway Corridor Duplex', lat: 26.1910, lng: -98.2720, kind: 'developed' },
  { id: 'angelica', name: "Angelica's Dream V2", lat: 26.1590, lng: -98.0200, kind: 'developed' },
  { id: 'lot64', name: 'Lot 64 (Built)', lat: 26.1600, lng: -98.2830, kind: 'built' },
  { id: 'luma', name: 'LUMA Lounge', lat: 26.2430, lng: -98.2350, kind: 'built' },
];
