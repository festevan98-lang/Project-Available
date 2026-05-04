import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { Resend } from 'resend';

const InterestSchema = z.object({
  projectSlug: z.string().min(1),
  lotId: z.string().nullable(),
  lotNumber: z.string().nullable(),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().nullable(),
  intent: z.enum(['buyer', 'builder', 'investor', 'unspecified']).default('unspecified'),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = InterestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Use service role to bypass RLS for the project lookup
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: project, error: projError } = await admin
    .from('projects')
    .select('id, name')
    .eq('slug', data.projectSlug)
    .single();

  if (projError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { error: insertError } = await admin.from('lot_interest').insert({
    project_id: project.id,
    lot_id: data.lotId,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    intent: data.intent,
    notes: data.notes ?? null,
    source: 'web',
  });

  if (insertError) {
    console.error('insert interest error', insertError);
    return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  }

  // Send email notification (best-effort)
  if (process.env.RESEND_API_KEY && process.env.INTEREST_NOTIFY_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const subjectLot = data.lotNumber ? ` lot ${data.lotNumber}` : '';
      await resend.emails.send({
        from: 'Ferest Projects <noreply@ferest.dev>',
        to: process.env.INTEREST_NOTIFY_EMAIL,
        subject: `[Ferest] New interest — ${project.name}${subjectLot}`,
        text: [
          `Project: ${project.name}`,
          data.lotNumber ? `Lot: ${data.lotNumber}` : 'Lot: (project-level)',
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone ?? '—'}`,
          `Intent: ${data.intent}`,
          `Notes: ${data.notes ?? '—'}`,
        ].join('\n'),
      });
    } catch (e) {
      console.error('resend error', e);
      // do not fail the request — lead is already saved
    }
  }

  return NextResponse.json({ ok: true });
}
