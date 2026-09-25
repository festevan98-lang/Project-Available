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

// Proof bar numbers - conservative floors derived from the published projects.
// Attribution: the engineering track record is Fernando's (P.E.), delivered
// under M2 Engineering, PLLC - never claim FEREST engineered the recorded work.
// Subdivisions: LH, Laguna Oaks (ph 1+2 together), Augusta, Conway, Gems Creek,
//   Angelica, Las Cumbres, Garden Path, One Place Pecan = 9.
// Lots: 140 + 104 + 30 + 48 + 84 + 68 + 12 + ~80 + 14 = 570+ (floor).
// Acres: 27 + 27 + 2.727 + 9.15 + 19.4 + 10 + 4.5 + 8.867 + 1.515 = 110+.
export const PROOF = {
  subdivisions: '9',
  lots: '570+',
  acres: '110+',
} as const;

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
  /** One plain-English line under the name - what this is, third-grade simple. */
  hook?: string;
  /** Up to three numeric chips shown in the pipeline row. */
  stats: ProjectStat[];
  /** One-paragraph detail shown when the development row is expanded. */
  detail?: string;
  /** Short highlight bullets shown in the expanded panel. */
  features?: string[];
  /** Location line shown in the expanded panel. */
  locationNote?: string;
  /** Apple Maps query for the expanded panel. */
  mapsQuery?: string;
  /** Internal page with live availability, e.g. /laguna-heights. */
  liveHref?: string;
  /** Our own dedicated project page, e.g. /conway. Never a third-party link. */
  pageHref?: string;
  /** Plat or layout image shown in the expanded panel. */
  platImg?: string;
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
    hook: 'Only 37 Lots Left. Streets Being Paved Right Now.',
    stats: [
      { label: 'Lots', value: '140' },
      { label: 'Acres', value: '27' },
    ],
    detail: 'A new neighborhood in Mission with 140 home lots. The streets are being paved right now and lots are selling, starting in the $60s. FEREST also holds 5 lots here to build homes on for clients. Engineering by our founder under M2 Engineering, PLLC.',
    features: ['140 single-family lots', '27 acres', 'Paving underway', 'FEREST holds 5 lots to build on'],
    locationNote: 'La Laguna Rd, Mission, TX',
    mapsQuery: 'Laguna Heights, Mission, TX',
    liveHref: '/laguna-heights',
    platImg: '/plats/laguna-heights-plat.png',
    audience: ['retail', 'pipeline'],
  },
  {
    id: 'laguna-oaks',
    name: 'Laguna Oaks',
    city: 'Mission, TX',
    status: 'Selling',
    stageIndex: 3,
    devType: 'Single-Family',
    hook: 'Both Phases Built. We Still Hold Lots 69, 70, And 71.',
    stats: [
      { label: 'Lots', value: '104' },
      { label: 'Acres', value: '27' },
      { label: 'FEREST-Held', value: '3' },
    ],
    detail: 'A finished neighborhood in Mission - phases one and two were developed together: 104 home lots on about 27 acres off La Laguna Road. FEREST still holds lots 69, 70, and 71. Buy one outright, or we build your home on it. Engineering by our founder under M2 Engineering, PLLC.',
    features: ['104 residential lots', 'About 27 acres', 'Both phases delivered', 'FEREST holds lots 69-71'],
    locationNote: '909 La Laguna Rd, Mission, TX',
    mapsQuery: 'Laguna Oaks, Mission, TX',
    platImg: '/plats/laguna-oaks-plat.png',
    audience: ['retail', 'pipeline'],
  },
  {
    id: 'augusta',
    name: 'Augusta Townhomes',
    city: 'Mission, TX',
    status: 'In Design',
    stageIndex: 1,
    devType: 'Townhomes',
    hook: '30 Townhomes On The Drawing Board.',
    stats: [
      { label: 'Lots', value: '30' },
      { label: 'Acres', value: '2.727' },
    ],
    detail: 'A townhome project at FM-495 and Augusta Drive in Mission. The plans and city approvals are being worked on right now, with engineering under M2 Engineering, PLLC.',
    features: ['30 townhome lots', '2.727 acres', 'In design & entitlement', 'FM-495 frontage'],
    locationNote: 'FM-495 & Augusta Dr, Mission, TX',
    mapsQuery: 'FM-495 & Augusta Dr, Mission, TX',
    platImg: '/plats/augusta-plat.png',
    audience: ['pipeline'],
  },
  {
    id: 'conway-duplex',
    name: 'Conway Duplex (private ref)', // internal only - never rendered
    publicName: 'Duplex Development, Conway Corridor',
    city: 'Mission, TX',
    status: 'Selling',
    stageIndex: 1,
    devType: 'Duplex',
    hook: 'The Whole 48-Lot Site Is For Sale. $1.35M.',
    // Listed publicly, so the asking price is public for this one.
    stats: [
      { label: 'Lots', value: '48' },
      { label: 'Acres', value: '9.15' },
      { label: 'Asking', value: '$1.35M' },
    ],
    detail: 'A 48-lot duplex site on N Conway Avenue in Mission, listed at $1,350,000. Feasibility and the concept layout are done, city sewer is available, and no rezoning is required. Short-term owner financing is available, and the site also works for flex, commercial, or single-family product.',
    features: ['48 duplex lots - 96 units possible', 'ETJ - no rezoning required', 'City sewer available', 'Owner financing available', 'By H-E-B and Walmart at Mile 3'],
    locationNote: 'N Conway Ave at Mile 3 (Buddy Owens Blvd), Mission, TX',
    mapsQuery: 'N Conway Ave & Buddy Owens Blvd, Mission, TX',
    pageHref: '/conway',
    platImg: '/plats/conway-layout.png',
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
  /** Internal info page, e.g. /gems-creek. */
  pageHref?: string;
  /** Plat image shown at the top of the card. */
  platImg?: string;
  /** Optional availability note (e.g. a built unit for rent or sale). */
  note?: string;
  /** Optional WhatsApp CTA tied to the note. */
  noteCta?: { label: string; waText: string };
}

export const PORTFOLIO: PortfolioProject[] = [
  {
    id: 'gems-creek',
    name: 'Gems Creek',
    city: 'Alton, TX',
    tag: 'Under Construction',
    stats: [
      { label: 'SF Lots', value: '84' },
      { label: 'Commercial Pads', value: '3' },
      { label: 'Acres', value: '19.40' },
    ],
    mapsQuery: 'S Alton Blvd, Alton, TX',
    pageHref: '/gems-creek',
    platImg: '/plats/gems-creek.png',
    note: 'A Client Development - Engineering By M2 Engineering. Lots From $65,000 - Reserve With $1,000.',
    noteCta: { label: 'Gems Creek Info', waText: 'Hey FEREST, Send Me Info On Gems Creek.' },
  },
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
    platImg: '/plats/las-cumbres-plat.png',
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
    platImg: '/plats/garden-path-plat.png',
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
    platImg: '/plats/one-place-pecan-plat.png',
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
  { id: 'laguna-oaks', name: 'Laguna Oaks', lat: 26.1605, lng: -98.2835, kind: 'developed' },
  { id: 'garden-path', name: 'Garden Path', lat: 26.2015, lng: -98.2805, kind: 'developed' },
  { id: 'las-cumbres', name: 'Las Cumbres Terrace', lat: 26.1925, lng: -98.3125, kind: 'developed' },
  { id: 'augusta', name: 'Augusta Townhomes', lat: 26.2360, lng: -98.2915, kind: 'developed' },
  { id: 'one-place-pecan', name: 'One Place Pecan', lat: 26.2230, lng: -98.2435, kind: 'developed' },
  { id: 'conway-duplex', name: 'Conway Corridor Duplex', lat: 26.1910, lng: -98.2720, kind: 'developed' },
  { id: 'angelica', name: "Angelica's Dream V2", lat: 26.1590, lng: -98.0200, kind: 'developed' },
  { id: 'gems-creek', name: 'Gems Creek', lat: 26.2780, lng: -98.3065, kind: 'developed' },
  { id: 'lot64', name: 'Lot 64 (Built)', lat: 26.1600, lng: -98.2830, kind: 'built' },
  { id: 'luma', name: 'LUMA Lounge', lat: 26.2430, lng: -98.2350, kind: 'built' },
];
