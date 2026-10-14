import { notFound } from 'next/navigation';
import { resolveLang } from '../../portal/lang';
import { loadPartner } from '../context';
import { L } from '../copy';
import { LabShell, T } from '../ui';
import RequestAccess from './RequestAccess';

export const dynamic = 'force-dynamic';

export default async function PartnerLanding({ params, searchParams }: {
  params: Promise<{ partner: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { partner: slug } = await params;
  const lang = await resolveLang(null, (await searchParams).lang ?? 'es');
  const ctx = await loadPartner(slug, lang, false);
  if (!ctx) notFound();
  const { partner, brand } = ctx;
  const vars = { partner: partner.name };

  const pillars = [
    [L(lang, 'pillar1'), L(lang, 'pillar1d')],
    [L(lang, 'pillar2'), L(lang, 'pillar2d')],
    [L(lang, 'pillar3'), L(lang, 'pillar3d')],
  ];
  const steps = [
    [L(lang, 'how1'), L(lang, 'how1d')],
    [L(lang, 'how2'), L(lang, 'how2d')],
    [L(lang, 'how3'), L(lang, 'how3d')],
  ];

  return (
    <LabShell lang={lang} brand={brand} right={<a href={`/lab/${slug}/acceso`} style={{ fontSize: 13, color: T.muted, textDecoration: 'none' }}>{L(lang, 'partnerLogin')}</a>}>
      <section className="fade" style={{ padding: '44px 0 8px' }}>
        <div className="kicker">{L(lang, 'landKicker')}</div>
        <h1 className="serif" style={{ fontSize: 'clamp(2rem, 7vw, 2.9rem)', lineHeight: 1.12, margin: '12px 0 0' }}>{L(lang, 'landTitle')}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: T.muted, margin: '14px 0 0' }}>{L(lang, 'landLead', vars)}</p>
        <a href="#acceso" className="btn btn-primary" style={{ marginTop: 22 }}>{L(lang, 'formTitle')}</a>
      </section>

      <section style={{ marginTop: 36, display: 'grid', gap: 12 }}>
        {pillars.map(([t, d]) => (
          <div key={t} className="card" style={{ padding: '18px 20px' }}>
            <div className="serif" style={{ fontSize: 21 }}>{t}</div>
            <div style={{ fontSize: 15, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="kicker">{L(lang, 'howTitle')}</div>
        <ol style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 14 }}>
          {steps.map(([t, d], i) => (
            <li key={t} style={{ display: 'flex', gap: 14 }}>
              <span className="serif" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: T.accentSoft, color: T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{i + 1}</span>
              <span>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 16 }}>{t}</span>
                <span style={{ display: 'block', color: T.muted, fontSize: 15, marginTop: 2 }}>{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section id="acceso" style={{ marginTop: 44, scrollMarginTop: 80 }}>
        <RequestAccess lang={lang} partner={slug} partnerName={partner.name} />
        <details style={{ marginTop: 14, fontSize: 13, color: T.muted }}>
          <summary style={{ cursor: 'pointer' }}>{L(lang, 'privacyTitle')}</summary>
          <p style={{ lineHeight: 1.55 }}>{L(lang, 'privacyBody', vars)}</p>
        </details>
      </section>
    </LabShell>
  );
}
