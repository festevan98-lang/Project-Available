import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const allowed = [
    'lot_number', 'status', 'polygon_points', 'size_sqft', 'price',
    'phase', 'dimensions', 'notes',
  ] as const;
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('lots').update(update).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lot: data });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('lots').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
