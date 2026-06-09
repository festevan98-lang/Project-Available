import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendLeadEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

interface LeadInput {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  timeline?: unknown;
  context?: unknown;
  lot_number?: unknown;
  project_slug?: unknown;
  source?: unknown;
}

function s(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
}

export async function POST(req: Request) {
  let body: LeadInput;
  try {
    body = (await req.json()) as LeadInput;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const name = s(body.name);
  const phone = s(body.phone);
  const context = s(body.context) ?? 'General inquiry';

  if (!name) return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
  if (!phone || phone.length < 7) return NextResponse.json({ ok: false, error: 'Phone is required' }, { status: 400 });

  const email = s(body.email);
  const timeline = s(body.timeline);
  const lot_number = s(body.lot_number);
  const project_slug = s(body.project_slug);
  const source = s(body.source) ?? 'portal';

  const supabase = createAdminClient();
  const { data: row, error: dbError } = await supabase
    .from('leads')
    .insert({ name, phone, email, timeline, context, lot_number, project_slug, source })
    .select('id, created_at')
    .single();

  if (dbError) {
    return NextResponse.json(
      { ok: false, error: 'Could not save lead', errorDetail: dbError.message },
      { status: 500 }
    );
  }

  const emailResult = await sendLeadEmail({
    name,
    phone,
    email,
    timeline,
    context,
    lotNumber: lot_number,
    projectSlug: project_slug,
  });

  return NextResponse.json({
    ok: true,
    id: row?.id,
    createdAt: row?.created_at,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? null : emailResult.error,
  });
}
