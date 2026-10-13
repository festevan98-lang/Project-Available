import { catalogImageUrl, getCatalog, sharingInvestor } from '@/lib/portal/store';
import { C, Shell } from '../../portal/ui';
import { t } from '../../portal/i18n';
import { resolveLang } from '../../portal/lang';
import { buildAppProjects } from '../../portal/catalogData';
import InvestorApp from '../../portal/InvestorApp';

export const dynamic = 'force-dynamic';

/** Public page an investor sends to clients; the signed token decides what it shows. */
export default async function SharedOffer({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { token } = await params;
  const lang = await resolveLang(null, (await searchParams).lang);
  const shared = await sharingInvestor(token);
  const catalog = shared?.investor.catalog ? await getCatalog(shared.investor.catalog) : null;

  if (!shared || !catalog) {
    return (
      <Shell lang={lang} toggle footer={t(lang, 'footerShare')}>
        <section style={{ maxWidth: 440, margin: '0 auto', padding: '64px 0', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{lang === 'es' ? 'Este enlace ya no está disponible.' : 'This link is no longer available.'}</div>
          <p style={{ fontSize: 16, color: C.inkSoft, marginTop: 8 }}>{lang === 'es' ? 'Pida un enlace nuevo a quien se lo envió.' : 'Ask the person who sent it for a new link.'}</p>
        </section>
      </Shell>
    );
  }

  const { investor, target } = shared;
  const projects = await buildAppProjects(catalog, lang, token);
  const brandName = catalog.brand?.name ?? investor.company ?? investor.name;
  const brand = catalog.brand
    ? { name: catalog.brand.name, logo: catalog.brand.logo ? catalogImageUrl(catalog.id, catalog.brand.logo, token) : null }
    : null;
  const contactName = investor.name.split(' ').slice(0, 2).join(' ');
  const wa = investor.whatsapp ? `https://wa.me/${investor.whatsapp.replace(/\D/g, '')}` : 'https://wa.me/19562030003';

  return (
    <Shell lang={lang} toggle footer={t(lang, 'footerShare')}>
      <InvestorApp
        lang={lang}
        projects={projects}
        mode="guest"
        hello={t(lang, 'guestHello', { brand: brandName })}
        helloSub={t(lang, 'guestSub')}
        brand={brand}
        contact={{ wa, name: investor.whatsapp ? contactName : 'Fernando Estevan' }}
        initial={target ?? null}
      />
    </Shell>
  );
}
