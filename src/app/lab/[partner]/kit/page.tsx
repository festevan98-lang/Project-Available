import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { canManage, clientPricingFor, currentAccount } from '@/lib/lab/store';
import type { AppHome } from '../../../portal/catalogData';
import { money } from '../../../portal/i18n';
import { resolveLang } from '../../../portal/lang';
import { clientProjects, loadPartner } from '../../context';
import { L, type LabKey } from '../../copy';
import { labCss, T } from '../../ui';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

const printCss = `
  @page { size: letter; margin: 0.45in; }
  @media (max-width: 480px) { .sheet { padding: 22px 18px !important; } }
  @media print {
    .no-print { display: none !important; }
    .lx { background: #fff !important; padding: 0 !important; }
    .sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: none !important; }
    .avoid { break-inside: avoid; }
    .kit-plans { grid-template-columns: repeat(3, 1fr) !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

/** One-page brochure with the partner's brand, for clients. Saved as PDF from the browser. */
export default async function PartnerKit({ params }: { params: Promise<{ partner: string }> }) {
  const { partner: slug } = await params;
  if (!canManage(await currentAccount(), slug)) redirect(`/lab/${slug}/acceso`);
  const lang = await resolveLang(null, 'es');
  const ctx = await loadPartner(slug, lang, true);
  if (!ctx) notFound();
  const { partner, brand } = ctx;
  const projects = clientProjects(ctx.projects, await clientPricingFor(partner));
  const host = (await headers()).get('host') ?? '';
  const site = process.env.LAB_HOME === `/lab/${slug}` ? host : `${host}/lab/${slug}`;

  // Each plan once, at its lowest starting price across subdivisions (lot + build).
  const plans = new Map<string, { home: AppHome; from: number; places: string[] }>();
  for (const p of projects) {
    const lotMin = Math.min(...p.lots.map((l) => l.price ?? Infinity));
    if (!Number.isFinite(lotMin)) continue;
    for (const home of p.homes) {
      if (home.price == null) continue;
      const from = home.price + lotMin;
      const prev = plans.get(home.id);
      if (!prev) plans.set(home.id, { home, from, places: [p.name] });
      else {
        prev.places.push(p.name);
        if (from < prev.from) prev.from = from;
      }
    }
  }
  // The partner's own floor plans first, then other homes, cheapest first.
  const own = new Set((partner.numbers?.plans ?? []).map((x) => x.id));
  const planList = [...plans.values()]
    .sort((a, b) => Number(!own.has(a.home.id)) - Number(!own.has(b.home.id)) || a.from - b.from)
    .slice(0, 3);
  const wa = partner.whatsapp.replace(/^52(1)?(\d{2})(\d{4})(\d{4})$/, '+52 $2 $3 $4');
  const steps: LabKey[] = ['buy1', 'buy2', 'buy3', 'buy4', 'buy5', 'buy6'];
  const pillars: [LabKey, LabKey][] = [['pillar1', 'pillar1d'], ['pillar2', 'pillar2d'], ['pillar3', 'pillar3d']];
  const stepText: Record<string, LabKey> = { buy1: 'buy1d', buy2: 'buy2d', buy3: 'buy3d', buy4: 'buy4d', buy5: 'buy5d', buy6: 'buy6d' };

  return (
    <div className="lx" lang={lang} style={{ background: T.soft, minHeight: '100dvh', padding: '24px 12px' }}>
      <style>{labCss + printCss}</style>
      <PrintButton label={lang === 'es' ? 'Guardar como PDF' : 'Save as PDF'} />
      <div className="sheet" style={{ maxWidth: 780, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '36px 40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.line}`, paddingBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {brand.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="" width={40} height={40} style={{ borderRadius: 8 }} />
            )}
            <span style={{ fontWeight: 600, fontSize: 17 }}>{brand.name}</span>
          </span>
          <span style={{ fontSize: 12, color: T.muted, textAlign: 'right' }}>
            {lang === 'es' ? 'con' : 'with'} <b style={{ color: T.ink }}>FEREST Development</b><br />Mission, Texas
          </span>
        </header>

        <div className="kicker" style={{ marginTop: 22 }}>{lang === 'es' ? 'Selección privada · Valle de Texas' : 'Private selection · Texas Valley'}</div>
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.12, margin: '8px 0 0' }}>{L(lang, 'homeTitle')}</h1>
        <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: '10px 0 0' }}>{L(lang, 'homeLead')}</p>

        <div className="kit-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
          {planList.map(({ home, from, places }) => (
            <div key={home.id} className="avoid" style={{ border: `1px solid ${T.line}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={home.images[0]?.src} alt="" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '10px 12px 12px' }}>
                <div className="serif" style={{ fontSize: 20 }}>{home.name}</div>
                {home.sub && <div style={{ fontSize: 12, color: T.muted }}>{home.sub}</div>}
                {home.specs && <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'pre-line', marginTop: 4, lineHeight: 1.4 }}>{home.specs}</div>}
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{places.join(' · ')}</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  {L(lang, 'homesFrom')} <span className="serif" style={{ fontSize: 20 }}>{money(from)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="avoid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 22 }}>
          <div>
            <div className="kicker">{lang === 'es' ? 'Desarrollos' : 'Developments'}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gap: 8 }}>
              {projects.map((p) => {
                const lotMin = Math.min(...p.lots.map((l) => l.price ?? Infinity));
                return (
                  <li key={p.slug} style={{ fontSize: 14 }}>
                    <b>{p.name}</b> · <span style={{ color: T.muted }}>{p.place}</span>
                    {Number.isFinite(lotMin) && (
                      <div style={{ fontSize: 13, color: T.muted }}>
                        {L(lang, 'lotsFrom')} {money(lotMin)} · {p.lots.length} {lang === 'es' ? 'disponibles' : 'available'}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="kicker" style={{ marginTop: 18 }}>{lang === 'es' ? 'Por qué aquí' : 'Why here'}</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13, lineHeight: 1.45 }}>
              {pillars.map(([t, d]) => <li key={t}><b>{L(lang, t)}.</b> {L(lang, d)}</li>)}
            </ul>
          </div>
          <div>
            <div className="kicker">{L(lang, 'buyTitle')}</div>
            <ol style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13, lineHeight: 1.45 }}>
              {steps.map((k) => <li key={k}><b>{L(lang, k)}.</b> {L(lang, stepText[k])}</li>)}
            </ol>
          </div>
        </div>

        <div className="avoid" style={{ marginTop: 22, background: T.accent, color: '#fff', borderRadius: 12, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{lang === 'es' ? 'Informes y recorridos' : 'Information and visits'}</div>
            <div className="serif" style={{ fontSize: 22 }}>{partner.contactName} · {partner.name}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 15, lineHeight: 1.5 }}>
            <div>WhatsApp <b>{wa}</b></div>
            <div style={{ opacity: 0.85, fontSize: 13 }}>{site}</div>
          </div>
        </div>
        <p style={{ fontSize: 10.5, color: T.muted, lineHeight: 1.5, marginTop: 12 }}>
          {L(lang, 'privateNote')} {L(lang, 'visaNo')} {L(lang, 'engineerBody')}
        </p>
      </div>
    </div>
  );
}
