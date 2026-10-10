import { redirect } from 'next/navigation';
import { currentInvestor, getProject } from '@/lib/portal/store';
import { C, Shell } from './ui';

export const dynamic = 'force-dynamic';

export default async function PortalHome() {
  const investor = await currentInvestor();
  if (!investor) redirect('/portal/login');

  const slugs = Object.keys(investor.projects);
  if (slugs.length === 1) redirect(`/portal/${slugs[0]}`);

  const projects = (await Promise.all(slugs.map((s) => getProject(s)))).filter((p) => p !== null);

  return (
    <Shell name={investor.name}>
      <section style={{ padding: '40px 0 8px' }}>
        <span className="label">Your Projects</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 7vw, 3.2rem)', marginTop: 8 }}>Welcome Back.</h1>
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
    </Shell>
  );
}
