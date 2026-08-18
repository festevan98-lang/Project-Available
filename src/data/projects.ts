// Single source of truth for the FEREST subdivision pipeline (revamp v3).
// Every block on /projects renders from this file. Adding a subdivision is a
// one-line edit. Never invent numbers - only carry stats we can back.
//
// COPY RULES enforced here:
//  - Title Case labels, ASCII only, no em-dashes.
//  - "Los Milagros" is never used publicly. Conway duplex deal = publicName below.
//  - No ROI / return / projected / risk language. Stats are Lots / Acres / Units
//    / Sqft / price-per-lot / status only.

export type ProjectStatus = 'Selling' | 'Ready' | 'In Design';

export interface ProjectStat {
  /** Short Title Case label: Lots, Acres, Units, Typical Lot, etc. */
  label: string;
  /** Value string, carried exactly from site data. */
  value: string;
}

export interface Subdivision {
  id: string;
  /** Internal name. */
  name: string;
  /** Public-facing name. Falls back to name when omitted. */
  publicName?: string;
  city: string;
  status: ProjectStatus;
  /** Up to three chips shown in the pipeline row. */
  stats: ProjectStat[];
  /** Which surfaces this project appears on. */
  audience: Array<'retail' | 'pipeline'>;
  flags?: {
    /** Hidden entirely until owner confirms data. */
    hidden?: boolean;
    /** Data is provisional / pending owner confirmation. */
    ownerConfirm?: boolean;
  };
}

export const SUBDIVISIONS: Subdivision[] = [
  {
    id: 'laguna-heights',
    name: 'Laguna Heights',
    city: 'Mission, TX',
    status: 'Selling',
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
    stats: [
      { label: 'FEREST Lots', value: '3' },
      { label: 'Typical Lot', value: '6,000 Sqft' },
    ],
    audience: ['retail', 'pipeline'],
  },
  {
    id: 'augusta',
    name: 'Augusta Townhomes',
    city: 'Mission, TX',
    status: 'Ready',
    stats: [
      { label: 'Lots', value: '30' },
      { label: 'Acres', value: '2.727' },
    ],
    audience: ['pipeline'],
  },
  {
    id: 'conway-duplex',
    name: 'Los Milagros on Conway', // internal only - never rendered
    publicName: 'Duplex Development, Conway Corridor',
    city: 'Mission, TX',
    status: 'Ready',
    stats: [
      { label: 'Lots', value: '48' },
      { label: 'Units', value: '96' },
      { label: 'Acres', value: '9.37' },
    ],
    audience: ['pipeline'],
  },
  {
    id: 'angelica-2',
    name: "Angelica's Dream V2",
    city: 'Weslaco / Alamo, TX',
    status: 'In Design',
    stats: [
      { label: 'Lots', value: '68' },
      { label: 'Acres', value: '10' },
    ],
    audience: ['pipeline'],
  },
  {
    id: 'las-cumbres',
    name: 'Las Cumbres',
    city: 'RGV, TX',
    status: 'In Design',
    stats: [{ label: 'Stats', value: 'Owner Confirm' }],
    audience: ['pipeline'],
    flags: { hidden: true, ownerConfirm: true },
  },
];

/** Public-facing name, honoring the publicName override. */
export function publicNameOf(p: Subdivision): string {
  return p.publicName ?? p.name;
}

/** Pipeline rows: visible (not hidden) projects tagged for the pipeline block. */
export const PIPELINE_ROWS: Subdivision[] = SUBDIVISIONS.filter(
  (p) => p.audience.includes('pipeline') && !p.flags?.hidden,
);
