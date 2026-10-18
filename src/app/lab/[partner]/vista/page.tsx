import { notFound, redirect } from 'next/navigation';
import { canManage, clientPricingFor, currentAccount } from '@/lib/lab/store';
import { resolveLang } from '../../../portal/lang';
import ClientExperience from '../../ClientExperience';
import { clientProjects, loadPartner } from '../../context';
import { LabShell } from '../../ui';

export const dynamic = 'force-dynamic';

/** The partner sees exactly what a client link shows, without tracking. */
export default async function PartnerPreview({ params }: { params: Promise<{ partner: string }> }) {
  const { partner: slug } = await params;
  if (!canManage(await currentAccount(), slug)) redirect(`/lab/${slug}/acceso`);
  const lang = await resolveLang(null, 'es');
  const ctx = await loadPartner(slug, lang, true);
  if (!ctx) notFound();
  const { partner, brand, projects } = ctx;
  return (
    <LabShell lang={lang} brand={brand}>
      <ClientExperience
        lang={lang}
        partner={{ slug, name: partner.name, whatsapp: partner.whatsapp, contactName: partner.contactName }}
        label={null}
        projects={clientProjects(projects, await clientPricingFor(partner))}
        opportunities={partner.opportunities ?? []}
        linkId={null}
        preview
      />
    </LabShell>
  );
}
