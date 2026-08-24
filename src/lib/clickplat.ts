// Laguna Heights availability, synced from the official ClickPlat tracker.
// ClickPlat's public viewer is backed by a public (anon-role) Supabase view;
// we read the same payload the viewer ships to every visitor, so our site
// always mirrors the real availability without sharing the ClickPlat link.

const CLICKPLAT_MAP_ID = 'a6ef6429-7e02-4efc-a2d7-0ba73d04a62f';
const CLICKPLAT_REST = 'https://ptrsstztfcirhfdkjabi.supabase.co/rest/v1/public_plat_maps';
// Public anon key served inside ClickPlat's own browser bundle (not a secret).
const CLICKPLAT_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cnNzdHp0ZmNpcmhmZGtqYWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjY1OTAsImV4cCI6MjA4MDkwMjU5MH0.BzFgmyg8Ivy3CTXRtOnp3EgaP6Y4d9sY2eoTg9n0VV4';

export type LhStatus = 'available' | 'reserved' | 'sold';

export interface LhLot {
  n: number;
  sqft: number;
  price: number;
  status: LhStatus;
  /** 'polygon' (3+ points) or 'rectangle' (2 opposite corners). */
  shape?: 'polygon' | 'rectangle';
  /** Normalized 0-1 coordinates over the plat image, for the interactive map. */
  points?: { x: number; y: number }[];
}

export interface LhData {
  title: string;
  updatedAt: string;
  imageUrl: string | null;
  counts: { available: number; reserved: number; sold: number; total: number };
  lots: LhLot[];
}

interface RawLot {
  lotNumber?: string;
  size?: string;
  price?: string;
  status?: string;
  shapeType?: string;
  points?: { x: number; y: number }[];
}

function normalizeStatus(s: string | undefined): LhStatus {
  const v = (s || '').toLowerCase();
  if (v === 'available') return 'available';
  if (v === 'sold') return 'sold';
  return 'reserved';
}

export function normalizeLots(raw: RawLot[]): LhLot[] {
  return raw
    .map((l) => ({
      n: parseInt(String(l.lotNumber || '').replace(/[^0-9]/g, ''), 10),
      sqft: parseInt(String(l.size || '').replace(/[^0-9]/g, ''), 10) || 0,
      price: parseFloat(String(l.price || '').replace(/[^0-9.]/g, '')) || 0,
      status: normalizeStatus(l.status),
      shape: (l.shapeType === 'rectangle' ? 'rectangle' : 'polygon') as 'polygon' | 'rectangle',
      points: l.points,
    }))
    .filter((l) => Number.isFinite(l.n) && l.n > 0)
    .sort((a, b) => a.n - b.n);
}

/** Server-side fetch of the live Laguna Heights plat. Revalidates every 10 min. */
export async function fetchLagunaHeights(): Promise<LhData | null> {
  try {
    const url = `${CLICKPLAT_REST}?select=title,image_url,lots,updated_at&id=eq.${CLICKPLAT_MAP_ID}`;
    const res = await fetch(url, {
      headers: { apikey: CLICKPLAT_ANON, Authorization: `Bearer ${CLICKPLAT_ANON}` },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      title: string; image_url: string | null; lots: RawLot[] | string; updated_at: string;
    }>;
    const row = rows[0];
    if (!row) return null;
    const rawLots: RawLot[] = typeof row.lots === 'string' ? JSON.parse(row.lots) : row.lots;
    const lots = normalizeLots(rawLots || []);
    const counts = {
      available: lots.filter((l) => l.status === 'available').length,
      reserved: lots.filter((l) => l.status === 'reserved').length,
      sold: lots.filter((l) => l.status === 'sold').length,
      total: lots.length,
    };
    return { title: row.title, updatedAt: row.updated_at, imageUrl: row.image_url, counts, lots };
  } catch {
    return null;
  }
}
