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
    devType: 'Single-Family',
    stats: [
      { label: 'Lots', value: '142' },
      { label: 'Acres', value: '27' },
    ],
    audience: ['retail', 'pipeline'],
  },
  {
    id: 'laguna-oaks-2',
    name: 'Laguna Oaks Phase II',
    city: 'Mission, TX',
    status: 'Selling',
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
      { label: 'Type', value: 'Single-Family' },
    ],
    note: 'Designed By Our Team. Sold And Now Being Built By The Buyer.',
  },
  {
    id: 'las-cumbres',
    name: 'Las Cumbres Terrace',
    city: 'Mission, TX',
    stats: [
      { label: 'Lots', value: '12' },
      { label: 'Acres', value: '4.5' },
      { label: 'Recorded', value: 'Vol 1 Pg 56' },
    ],
    note: 'Lots Sold Out. A Fourplex Is Available To Rent Or Buy.',
    noteCta: { label: 'Fourplex - Rent Or Buy', waText: 'Hi FEREST, Tell Me About The Las Cumbres Fourplex (Rent Or Buy).' },
  },
  {
    id: 'garden-path',
    name: 'Garden Path Subdivision',
    city: 'Mission, TX',
    stats: [
      { label: 'Acres', value: '8.867' },
      { label: 'Type', value: 'Single-Family' },
    ],
  },
  {
    id: 'one-place-pecan',
    name: 'One Place Pecan',
    city: 'McAllen, TX',
    stats: [
      { label: 'Lots', value: '14' },
      { label: 'Acres', value: '1.515' },
    ],
  },
  {
    id: 'laguna-oaks-1',
    name: 'Laguna Oaks Phase I',
    city: 'Mission, TX',
    stats: [
      { label: 'Acres', value: '11.861' },
      { label: 'Type', value: 'Single-Family' },
    ],
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
  status?: string;
}

export const CONSTRUCTION: BuildProject[] = [
  { id: 'lot64', name: 'Lot 64, Laguna Oaks', location: '809 La Laguna Rd, Mission TX', type: 'Home', image: '/models/ferest-model-ext-1.webp', status: 'Under Construction' },
  { id: 'lot77', name: 'Lot 77, Garden Path', location: 'Mission, TX', type: 'Home', image: '/construction/lot77-garden-path.webp', status: 'Under Construction' },
  { id: 'luma', name: 'Luma Cocktail Bar', location: 'Rio Grande Valley, TX', type: 'Commercial', image: '/construction/luma.webp' },
  { id: 'mil-besos', name: 'Mil Besos Cocktail Bar', location: 'Rio Grande Valley, TX', type: 'Commercial', image: '/construction/mil-besos.webp' },
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
