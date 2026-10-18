import { notFound } from 'next/navigation';
import { resolveLang } from '../../portal/lang';
import { loadPartner } from '../context';
import { L, type LabKey } from '../copy';
import { LabShell, T } from '../ui';
import PlanQuiz from './PlanQuiz';

export const dynamic = 'force-dynamic';

export default async function PartnerLanding({ params, searchParams }: {
  params: Promise<{ partner: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { partner: slug } = await params;
  const lang = await resolveLang(null, (await searchParams).lang ?? 'es');
  const ctx = await loadPartner(slug, lang, false);
  if (!ctx) notFound();
  const { partner, brand, hero } = ctx;
  const vars = { partner: partner.name };
  const wa = `https://wa.me/${partner.whatsapp}?text=${encodeURIComponent(
    lang === 'es' ? `Hola ${partner.contactName}, me interesa saber más sobre propiedades en Texas.` : `Hi ${partner.contactName}, I would like to know more about Texas properties.`)}`;

  const trust: [LabKey, LabKey][] = [['trust1', 'trust1d'], ['trust2', 'trust2d'], ['trust3', 'trust3d'], ['trust4', 'trust4d']];
  const steps: [LabKey, LabKey][] = [['how1', 'how1d'], ['how2', 'how2d'], ['how3', 'how3d']];
  const faq: [LabKey, LabKey][] = [['faq1q', 'faq1a'], ['faq2q', 'faq2a'], ['faq3q', 'faq3a'], ['faq4q', 'faq4a']];

  return (
    <LabShell lang={lang} brand={brand} right={<a href={`/lab/${slug}/acceso`} aria-label={L(lang, 'partnerLogin')} style={{ fontSize: 13, color: T.muted, textDecoration: 'none', whiteSpace: 'nowrap' }}>{L(lang, 'partnerLoginShort')}</a>}>
      <section className="fade" style={{ padding: '40px 0 8px' }}>
        <div className="kicker">{L(lang, 'landKicker')}</div>
        <h1 className="serif" style={{ fontSize: 'clamp(2rem, 7vw, 2.9rem)', lineHeight: 1.12, margin: '12px 0 0' }}>{L(lang, 'landTitle')}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: T.muted, margin: '14px 0 0' }}>{L(lang, 'landLead', vars)}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
          <a href="#plan" className="btn btn-primary">{L(lang, 'heroCta')}</a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{L(lang, 'heroWa')}</a>
        </div>
      </section>

      {hero && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero} alt="" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', display: 'block', borderRadius: 18, marginTop: 28 }} />
      )}

      <section style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {trust.map(([t, d]) => (
          <div key={t} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>✓ {L(lang, t)}</div>
            <div style={{ fontSize: 14, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{L(lang, d)}</div>
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
                <span style={{ display: 'block', fontWeight: 600, fontSize: 16 }}>{L(lang, t)}</span>
                <span style={{ display: 'block', color: T.muted, fontSize: 15, marginTop: 2 }}>{L(lang, d)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section id="plan" style={{ marginTop: 44, scrollMarginTop: 80 }}>
        <PlanQuiz lang={lang} partner={slug} partnerName={partner.name} />
        <details style={{ marginTop: 14, fontSize: 13, color: T.muted }}>
          <summary style={{ cursor: 'pointer' }}>{L(lang, 'privacyTitle')}</summary>
          <p style={{ lineHeight: 1.55 }}>{L(lang, 'privacyBody', vars)}</p>
        </details>
      </section>

      <section style={{ marginTop: 44 }}>
        <div className="kicker">{L(lang, 'faqTitle')}</div>
        <div className="card" style={{ marginTop: 12, overflow: 'hidden' }}>
          {faq.map(([qk, ak], i) => (
            <details key={qk} style={{ padding: '14px 18px', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>{L(lang, qk)}</summary>
              <p style={{ margin: '8px 0 0', fontSize: 15, color: T.muted, lineHeight: 1.55 }}>{L(lang, ak)}</p>
            </details>
          ))}
        </div>
      </section>

      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={L(lang, 'heroWa')}
        style={{ position: 'fixed', right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom))', zIndex: 40, width: 56, height: 56, borderRadius: 999, background: '#25D366', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M20.5 3.5A11 11 0 0 0 3.4 17.1L2 22l5-1.3a11 11 0 0 0 5.3 1.4h0A11 11 0 0 0 20.5 3.5ZM12.3 20.2a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3a9.1 9.1 0 1 1 7.3 3.9Zm5-6.8c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.5 7.5 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.3-.5a.5.5 0 0 0 0-.5l-.9-2c-.2-.5-.5-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c2.7 1.1 2.7.7 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
        </svg>
      </a>
    </LabShell>
  );
}
