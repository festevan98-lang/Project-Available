import { notFound } from 'next/navigation';
import { resolveLang } from '../../../portal/lang';
import { loadPartner } from '../../context';
import { L } from '../../copy';
import { LabShell, T } from '../../ui';

export const dynamic = 'force-dynamic';

const UPDATED = { es: '17 de octubre de 2026', en: 'October 17, 2026' };

/** Full privacy notice for the partner's public site and client links (draft pending legal review). */
export default async function PrivacyNotice({ params, searchParams }: {
  params: Promise<{ partner: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { partner: slug } = await params;
  const lang = await resolveLang(null, (await searchParams).lang ?? 'es');
  const ctx = await loadPartner(slug, lang, false);
  if (!ctx) notFound();
  const { partner, brand } = ctx;
  const wa = partner.whatsapp.replace(/^52(1)?(\d{2})(\d{4})(\d{4})$/, '+52 $2 $3 $4');
  const es = lang === 'es';

  const sections: [string, string][] = es ? [
    ['Quiénes son los responsables', `${partner.name} (${partner.city}) y FEREST Development (Mission, Texas, EE.UU.) son responsables del uso de sus datos personales que se recaban en este sitio y en los enlaces personales que ${partner.name} le envía.`],
    ['Qué datos recabamos', 'Nombre, número de WhatsApp, correo electrónico, sus respuestas al cuestionario (objetivo, presupuesto aproximado, forma de pago y plazo), los mensajes que nos envía y las solicitudes de recorrido. En los enlaces personales también registramos cuándo se abre el enlace y qué opciones se consultan. No pedimos datos sensibles ni datos bancarios en este sitio.'],
    ['Para qué los usamos', 'Para responder su solicitud, enviarle información, opciones y precios, organizar recorridos y darle seguimiento. No usamos sus datos para otros fines ni los vendemos.'],
    ['Con quién se comparten', `Solo entre ${partner.name} y FEREST Development para atenderle. Los datos se guardan en servidores de Vercel Inc. en Estados Unidos, que actúa como proveedor de almacenamiento por cuenta nuestra. No los transferimos a terceros para sus propios fines.`],
    ['Sus derechos (ARCO) y cómo retirar su consentimiento', `Puede pedir acceso, rectificación, cancelación u oposición al uso de sus datos, o retirar su consentimiento, escribiendo por WhatsApp al ${wa}. Indique su nombre y lo que solicita. Le responderemos dentro de los plazos que marca la legislación mexicana de protección de datos personales.`],
    ['Cuánto tiempo los conservamos', 'Mientras exista una relación con usted y hasta 24 meses después del último contacto, salvo que la ley exija conservarlos más tiempo.'],
    ['Cambios a este aviso', 'Cualquier cambio se publica en esta página con la fecha de actualización.'],
  ] : [
    ['Who is responsible', `${partner.name} (${partner.city}) and FEREST Development (Mission, Texas, USA) are responsible for the personal data collected on this site and through the personal links ${partner.name} sends you.`],
    ['What we collect', 'Name, WhatsApp number, email, your answers to the questionnaire (goal, approximate budget, payment and timing), the messages you send and visit requests. On personal links we also record when the link is opened and which options are viewed. We do not ask for sensitive or banking data on this site.'],
    ['What we use it for', 'To answer your request, send you information, options and prices, arrange visits and follow up. We do not use your data for anything else and we never sell it.'],
    ['Who it is shared with', `Only between ${partner.name} and FEREST Development, to assist you. Data is stored on Vercel Inc. servers in the United States, acting as our storage provider. We do not transfer it to third parties for their own purposes.`],
    ['Your rights and withdrawing consent', `You may request access, correction, deletion or objection to the use of your data, or withdraw your consent, by WhatsApp at ${wa}. Include your name and your request. We will answer within the time limits of Mexican personal data law.`],
    ['How long we keep it', 'While we have a relationship with you and up to 24 months after the last contact, unless the law requires longer.'],
    ['Changes to this notice', 'Any change is published on this page with the update date.'],
  ];

  return (
    <LabShell lang={lang} brand={brand}>
      <article className="fade" style={{ padding: '36px 0 8px' }}>
        <div className="kicker">{L(lang, 'privacyTitle').replace(/ \(.*\)$/, '')}</div>
        <h1 className="serif" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)', margin: '10px 0 6px' }}>{es ? 'Aviso de privacidad' : 'Privacy notice'}</h1>
        <div style={{ fontSize: 13, color: T.muted }}>{es ? 'Última actualización:' : 'Last updated:'} {UPDATED[lang]}</div>
        <div style={{ display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 600, color: T.gold, border: `1px solid ${T.gold}`, borderRadius: 999, padding: '3px 10px' }}>{L(lang, 'draft')}</div>
        {sections.map(([h, b]) => (
          <section key={h} style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 17, margin: 0 }}>{h}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T.ink, margin: '6px 0 0' }}>{b}</p>
          </section>
        ))}
        <a href={`/lab/${slug}`} style={{ display: 'inline-block', marginTop: 28, fontSize: 14, fontWeight: 600, color: T.accent }}>‹ {partner.name}</a>
      </article>
    </LabShell>
  );
}
