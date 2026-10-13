import { catalogImageUrl } from '@/lib/portal/store';
import type { Catalog, Investor, Lang } from '@/lib/portal/types';
import { C, WHATSAPP } from './ui';
import { t } from './i18n';
import { buildAppProjects } from './catalogData';
import InvestorApp from './InvestorApp';

export default async function CatalogView({ catalog, investor, lang }: { catalog: Catalog; investor: Investor; lang: Lang }) {
  const projects = await buildAppProjects(catalog, lang);
  const brand = catalog.brand
    ? { name: catalog.brand.name, logo: catalog.brand.logo ? catalogImageUrl(catalog.id, catalog.brand.logo) : null }
    : null;

  return (
    <>
      <InvestorApp
        lang={lang}
        projects={projects}
        mode="investor"
        hello={t(lang, 'hello', { first: investor.name.split(' ')[0] })}
        helloSub={t(lang, 'helloSub')}
        brand={brand}
        contact={{ wa: WHATSAPP, name: 'Fernando Estevan' }}
      />
      <section style={{ maxWidth: 560, margin: '36px auto 0', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{t(lang, 'questions')}</div>
        <div style={{ fontSize: 14, color: C.inkSoft, marginTop: 4 }}>
          <a href="tel:+19562030003" style={{ color: C.goldDeep, fontWeight: 600, textDecoration: 'none' }}>+1 956-203-0003</a>
          {' · '}
          <a href="mailto:fernando@ferest.dev" style={{ color: C.goldDeep, fontWeight: 600, textDecoration: 'none' }}>fernando@ferest.dev</a>
        </div>
      </section>
    </>
  );
}
