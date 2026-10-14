import { headers } from 'next/headers';
import { getLink, recordEvent } from '@/lib/lab/store';
import { resolveLang } from '../../../portal/lang';
import ClientExperience from '../../ClientExperience';
import { clientProjects, isBot, loadPartner } from '../../context';
import { L } from '../../copy';
import { LabShell, labCss, T } from '../../ui';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

/** A client's personal link. Opens are counted for the partner, except link-preview bots. */
export default async function ClientLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await resolveLang(null, 'es');
  const link = await getLink(id);
  const ctx = link && !link.revokedAt ? await loadPartner(link.partner, lang, true) : null;

  if (!link || !ctx) {
    return (
      <div className="lx" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{labCss}</style>
        <p style={{ maxWidth: 360, textAlign: 'center', fontSize: 17, lineHeight: 1.55, color: T.muted }}>{L(lang, 'linkOff')}</p>
      </div>
    );
  }

  if (!isBot((await headers()).get('user-agent'))) await recordEvent(link, 'open').catch(() => {});
  const { partner, brand, projects } = ctx;
  return (
    <LabShell lang={lang} brand={brand}>
      <ClientExperience
        lang={lang}
        partner={{ slug: partner.slug, name: partner.name, whatsapp: partner.whatsapp, contactName: partner.contactName }}
        label={link.label}
        projects={clientProjects(projects, partner.numbers?.clientPrice ?? 'list')}
        opportunities={partner.opportunities ?? []}
        linkId={link.id}
        preview={false}
      />
    </LabShell>
  );
}
