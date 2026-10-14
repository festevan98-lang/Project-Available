import { NextRequest, NextResponse } from 'next/server';
import { canManage, currentAccount, listLeads, listLinks } from '@/lib/lab/store';

export const dynamic = 'force-dynamic';

const cell = (v: unknown) => {
  const s = String(v ?? '');
  // Neutralize spreadsheet formulas and quote every cell.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

/** CSV of the partner's clients and requests, ready to import into Google Sheets. */
export async function GET(request: NextRequest) {
  const partner = request.nextUrl.searchParams.get('partner') ?? '';
  if (!canManage(await currentAccount(), partner)) return new NextResponse('Forbidden', { status: 403 });
  const [links, leads] = await Promise.all([listLinks(partner), listLeads(partner)]);
  const rows: unknown[][] = [
    ['tipo', 'cliente', 'creado', 'aperturas', 'ultima_apertura', 'interes', 'estado', 'whatsapp', 'correo', 'mensaje', 'enlace_id'],
    ...links.map((l) => ['enlace', l.label, l.createdAt, l.opens, l.lastOpenedAt ?? '', l.events.filter((e) => e.type.startsWith('cta:') || e.type.startsWith('lead:')).length, l.revokedAt ? 'desactivado' : 'activo', '', '', '', l.id]),
    ...leads.map((d) => [`solicitud:${d.kind}`, d.name, d.createdAt, '', '', d.interest.join(' '), '', d.phone, d.email, d.message, d.linkId ?? '']),
  ];
  const csv = rows.map((r) => r.map(cell).join(',')).join('\r\n');
  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${partner}-clientes.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
