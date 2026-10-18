import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { canManage, clientPricingFor, currentAccount, getMarket, getOwnerEconomics, listBuilds, listLeads, listLinks } from '@/lib/lab/store';
import { statsFor } from '@/lib/lab/market';
import { resolveLang } from '../../../portal/lang';
import { clientProjects, loadPartner } from '../../context';
import { L } from '../../copy';
import { LabShell, T } from '../../ui';
import PanelClient, { type PanelLead, type PanelLink } from './PanelClient';

export const dynamic = 'force-dynamic';

export default async function PartnerPanel({ params }: { params: Promise<{ partner: string }> }) {
  const { partner: slug } = await params;
  const account = await currentAccount();
  if (!canManage(account, slug)) redirect(`/lab/${slug}/acceso`);
  const lang = await resolveLang(null, 'es');
  const ctx = await loadPartner(slug, lang, true);
  if (!ctx) notFound();
  const { partner, brand, projects } = ctx;

  const [links, leads, market, builds, owner] = await Promise.all([
    listLinks(slug),
    listLeads(slug),
    getMarket(slug),
    listBuilds(slug),
    account!.role === 'owner' ? getOwnerEconomics(slug) : Promise.resolve(null),
  ]);

  const h = await headers();
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  const site = process.env.LAB_HOME === `/lab/${slug}` ? origin : `${origin}/lab/${slug}`;

  const pricing = await clientPricingFor(partner);
  const forClients = clientProjects(projects, pricing);
  const fromPrices = forClients.flatMap((p) => {
    const lot = Math.min(...p.lots.map((l) => l.price ?? Infinity));
    return p.homes.map((x) => (x.price != null && Number.isFinite(lot) ? x.price + lot : Infinity));
  });
  const from = Math.min(...fromPrices);

  const panelLinks: PanelLink[] = links.map((l) => {
    const options = l.events.filter((e) => e.type.startsWith('option:')).map((e) => e.type.slice(7));
    return {
      id: l.id,
      label: l.label,
      createdAt: l.createdAt,
      opens: l.opens,
      lastOpenedAt: l.lastOpenedAt ?? null,
      active: !l.revokedAt,
      hot: l.events.some((e) => e.type.startsWith('cta:') || e.type.startsWith('lead:')),
      lastOption: options[options.length - 1] ?? null,
    };
  });
  const panelLeads: PanelLead[] = leads.map((d) => ({
    id: d.id, kind: d.kind, name: d.name, phone: d.phone, email: d.email, interest: d.interest, message: d.message, createdAt: d.createdAt,
  }));

  return (
    <LabShell lang={lang} brand={brand} wide right={
      <form action="/api/lab/logout" method="post">
        <button type="submit" style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13, color: T.muted, cursor: 'pointer' }}>{L(lang, 'logout')}</button>
      </form>
    }>
      <PanelClient
        lang={lang}
        partner={{ slug, name: partner.name, contactName: partner.contactName, whatsapp: partner.whatsapp }}
        first={account!.name.split(' ')[0]}
        isOwner={account!.role === 'owner'}
        projects={projects}
        volumeMin={partner.numbers?.volumeMin ?? 15}
        owner={owner ? { buildCost: owner.buildCost, buildCostNote: owner.buildCostNote, lotCost: owner.lotCost } : null}
        links={panelLinks}
        leads={panelLeads}
        site={site}
        origin={origin}
        from={Number.isFinite(from) ? from : null}
        pricing={pricing}
        builds={builds}
        platStatus={partner.numbers?.platStatus ?? {}}
        model={partner.numbers?.costModel ?? null}
        market={{ comps: market?.comps ?? [], source: market?.source ?? '', updatedAt: market?.updatedAt ?? null, notes: market?.notes ?? {} }}
        marketRefs={projects.flatMap((p) => {
          const st = statsFor(market?.comps ?? [], p.slug).soldNew;
          return st.median ? [{ slug: p.slug, perLiving: Math.round(st.median), count: st.count, label: lang === 'es' ? `mediana de ${st.count} casas nuevas vendidas` : `median of ${st.count} new homes sold` }] : [];
        })}
      />
    </LabShell>
  );
}
