import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LotStatus } from '@/lib/supabase/types';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const required = ['project_id', 'lot_number', 'polygon_points'];
  for (const k of required) {
    if (!body[k]) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  }

  const insert = {
    project_id: body.project_id,
    lot_number: String(body.lot_number),
    status: (body.status as LotStatus) ?? 'available',
    polygon_points: body.polygon_points,
    size_sqft: body.size_sqft ?? null,
    price: body.price ?? null,
    phase: body.phase ?? null,
    dimensions: body.dimensions ?? null,
    notes: body.notes ?? null,
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('lots').insert(insert).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lot: data });
}
