import { Resend } from 'resend';

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export interface LeadEmailPayload {
  name: string;
  phone: string;
  email?: string;
  timeline?: string;
  context: string;
  lotNumber?: string;
  projectSlug?: string;
}

export async function sendLeadEmail(payload: LeadEmailPayload): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const to = process.env.INTEREST_NOTIFY_EMAIL || 'fernando@ferest.dev';
  const from = process.env.RESEND_FROM || 'FEREST Portal <portal@ferest.dev>';

  const subject = payload.lotNumber
    ? `New lead - ${payload.context} (Lot ${payload.lotNumber})`
    : `New lead - ${payload.context}`;

  const rows: [string, string][] = [
    ['Name', payload.name],
    ['Phone', payload.phone],
  ];
  if (payload.email) rows.push(['Email', payload.email]);
  if (payload.timeline) rows.push(['Timeline', payload.timeline]);
  rows.push(['Context', payload.context]);
  if (payload.lotNumber) rows.push(['Lot', payload.lotNumber]);
  if (payload.projectSlug) rows.push(['Project', payload.projectSlug]);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<table style="font-family:Helvetica,Arial,sans-serif;border-collapse:collapse">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#666">${k}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`).join('')}
  </table>
  <p style="margin-top:24px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999">FEREST Portal lead. Saved to Supabase leads table.</p>`;

  try {
    const result = await client.emails.send({ from, to, subject, text, html });
    if (result.error) return { ok: false, error: result.error.message ?? 'Resend rejected the send' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
