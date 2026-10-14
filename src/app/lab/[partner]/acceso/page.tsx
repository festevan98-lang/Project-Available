import { notFound } from 'next/navigation';
import { resolveLang } from '../../../portal/lang';
import { loadPartner } from '../../context';
import { L } from '../../copy';
import { LabShell } from '../../ui';
import LabLoginForm from './LabLoginForm';

export const dynamic = 'force-dynamic';

export default async function LabLogin({ params }: { params: Promise<{ partner: string }> }) {
  const { partner: slug } = await params;
  const lang = await resolveLang(null, 'es');
  const ctx = await loadPartner(slug, lang, false);
  if (!ctx) notFound();
  return (
    <LabShell lang={lang} brand={ctx.brand}>
      <section className="fade" style={{ maxWidth: 420, margin: '0 auto', padding: '56px 0' }}>
        <div className="kicker">{L(lang, 'landKicker')}</div>
        <h1 className="serif" style={{ fontSize: 34, margin: '10px 0 6px' }}>{L(lang, 'loginTitle')}</h1>
        <p style={{ color: '#6B6B6B', fontSize: 16, margin: '0 0 20px' }}>{L(lang, 'loginBody')}</p>
        <LabLoginForm partner={slug} labels={{ code: L(lang, 'code'), bad: L(lang, 'codeBad'), enter: L(lang, 'enter') }} />
      </section>
    </LabShell>
  );
}
