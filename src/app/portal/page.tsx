import { redirect } from 'next/navigation';
import { currentInvestor, getCatalog, getProject } from '@/lib/portal/store';
import { C, Shell } from './ui';
import { t } from './i18n';
import { resolveLang } from './lang';
import CatalogView from './CatalogView';

export const dynamic = 'force-dynamic';

export default async function PortalHome() {
  const investor = await currentInvestor();
  if (!investor) redirect('/portal/login');

  const slugs = Object.keys(investor.projects);
  const catalog = investor.catalog ? await getCatalog(investor.catalog) : null;
  if (!catalog && slugs.length === 1) redirect(`/portal/${slugs[0]}`);

  const projects = (await Promise.all(slugs.map((s) => getProject(s)))).filter((p) => p !== null);
  const lang = await resolveLang(investor);
  const label = investor.company ? `${investor.name} · ${investor.company}` : investor.name;

  return (
    <Shell name={label} lang={catalog ? lang : 'en'} toggle={!!catalog} footer={catalog ? t(lang, 'footerCatalog', { name: label }) : undefined}>
      {catalog && <CatalogView catalog={catalog} investor={investor} lang={lang} />}
      {(!catalog || projects.length > 0) && (
        <section style={{ padding: catalog ? '36px 0 8px' : '40px 0 8px' }}>
          <span className="label">{catalog ? t(lang, 'otherProjects') : 'Your Projects'}</span>
          {!catalog && <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 7vw, 3.2rem)', marginTop: 8 }}>Welcome Back.</h1>}
          <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
            {projects.length === 0 && (
              <div className="card" style={{ padding: 20, color: C.inkSoft, fontWeight: 600 }}>
                Your projects will show here once they are set up.
              </div>
            )}
            {projects.map((p) => (
              <a key={p.slug} href={`/portal/${p.slug}`} className="card" style={{ padding: 20, textDecoration: 'none', color: C.ink, display: 'block' }}>
                <span className="label">{p.stage}</span>
                <div className="display" style={{ fontSize: '1.6rem', marginTop: 6 }}>{p.name} - {p.unit}</div>
                <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>{p.address}</div>
              </a>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
