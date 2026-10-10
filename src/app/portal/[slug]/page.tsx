import { notFound, redirect } from 'next/navigation';
import { currentInvestor, fileUrl, getProject } from '@/lib/portal/store';
import { C, Shell, WHATSAPP, money } from '../ui';

export const dynamic = 'force-dynamic';

const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const investor = await currentInvestor();
  if (!investor) redirect('/portal/login');

  const position = investor.projects[slug];
  if (!position) notFound();
  const p = await getProject(slug);
  if (!p) notFound();

  const invested = position.invested;
  const projectedProfit = invested ? Math.round((p.terms.projectedInvestorProfit * invested) / p.terms.dealSize) : null;
  const budgetTotal = p.budget.reduce((s, b) => s + b.budget, 0);
  const spentTotal = p.budget.reduce((s, b) => s + b.spent, 0);
  const doneCount = p.milestones.filter((m) => m.status === 'done').length;
  const updates = [...p.updates].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Shell name={investor.name}>
      {/* title */}
      <section style={{ padding: '36px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="label">{p.name} · {p.unit}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.card, border: `2px solid ${C.goldDeep}`, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: C.ink }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: C.gold, display: 'inline-block' }} />
            Now: {p.stage}
          </span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 8vw, 4rem)', marginTop: 10 }}>
          {p.name} <span style={{ color: C.goldDeep }}>{p.unit}.</span>
        </h1>
        <p style={{ marginTop: 10, fontSize: 16, color: C.inkSoft, fontWeight: 500 }}>{p.subtitle} {p.address}</p>
        <p style={{ marginTop: 4, fontSize: 12.5, color: C.inkSoft, fontWeight: 600 }}>Last updated {fmtDate(p.updatedAt)}</p>
      </section>

      {/* hero + position */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 20 }}>
        <figure style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.card, minHeight: 240 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fileUrl(slug, p.hero.file)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
          <figcaption style={{ position: 'absolute', left: 10, bottom: 10, background: 'rgba(18,19,16,0.82)', color: C.paper, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>{p.hero.caption}</figcaption>
        </figure>
        <div className="card" style={{ padding: '20px 22px', borderColor: C.goldDeep, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="label">Your Position</span>
          {invested ? (
            <>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>You Invested</div>
                <div className="num" style={{ fontSize: 40, lineHeight: 1 }}>{money(invested)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>Projected Profit For You</div>
                <div className="num" style={{ fontSize: 32, lineHeight: 1, color: C.goldDeep }}>~{money(projectedProfit ?? 0)}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Status: {position.status}</div>
            </>
          ) : (
            <>
              <div className="num" style={{ fontSize: 30, lineHeight: 1 }}>{position.status}</div>
              <p style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500, lineHeight: 1.5 }}>
                Each investor sees their own amount and projected profit here. A full {money(p.terms.dealSize)} position is projected to earn about {money(p.terms.projectedInvestorProfit)}.
              </p>
            </>
          )}
          <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: 12, fontSize: 13.5, fontWeight: 600, lineHeight: 1.45 }}>
            Your money back first, plus {Math.round(p.terms.prefRate * 100)}% a year, plus {Math.round(p.terms.investorSplit * 100)}% of the profit left over.
          </div>
        </div>
      </section>

      {/* at a glance */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 14 }}>
        {p.glance.map((g) => (
          <div key={g.label} className="card" style={{ padding: '14px 16px' }}>
            <div className="label" style={{ fontSize: 10 }}>{g.label}</div>
            <div className="num" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.1rem)', lineHeight: 1, marginTop: 6 }}>{g.value}</div>
          </div>
        ))}
      </section>

      {/* progress */}
      <section style={{ marginTop: 36 }}>
        <span className="label">Progress</span>
        <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginTop: 6 }}>
          Step {Math.min(doneCount + 1, p.milestones.length)} Of {p.milestones.length}
        </h2>
        <div style={{ height: 8, borderRadius: 999, background: C.paperDeep, marginTop: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <div style={{ width: `${(doneCount / p.milestones.length) * 100}%`, height: '100%', background: C.goldDeep }} />
        </div>
        <ol className="card" style={{ listStyle: 'none', padding: '8px 18px', marginTop: 14 }}>
          {p.milestones.map((m, i) => (
            <li key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
              <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                background: m.status === 'done' ? C.goldDeep : m.status === 'current' ? C.card : C.paperDeep,
                color: m.status === 'done' ? C.paper : C.inkSoft,
                border: m.status === 'current' ? `3px solid ${C.gold}` : `2px solid ${m.status === 'done' ? C.goldDeep : C.border}` }}>
                {m.status === 'done' ? '✓' : i + 1}
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: m.status === 'next' ? 500 : 700, color: m.status === 'next' ? C.inkSoft : C.ink }}>{m.label}</span>
              {m.status === 'current' && (
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: C.gold, color: '#1A160A', borderRadius: 999, padding: '3px 10px' }}>In Progress</span>
              )}
              {m.date && <span style={{ fontSize: 12.5, fontWeight: 600, color: C.inkSoft }}>{m.date}</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* updates */}
      <section style={{ marginTop: 36 }}>
        <span className="label">Updates From Fernando</span>
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {updates.map((u) => (
            <article key={u.date + u.title} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.goldDeep }}>{fmtDate(u.date)}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{u.title}</div>
              <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 500, marginTop: 6, lineHeight: 1.55 }}>{u.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* how you get paid */}
      <section style={{ marginTop: 36 }}>
        <span className="label">How You Get Paid</span>
        <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>{p.terms.summary}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginTop: 12 }}>
          {p.terms.waterfall.map((w, i) => (
            <div key={w} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', background: i === p.terms.waterfall.length - 1 ? C.ink : C.card, color: i === p.terms.waterfall.length - 1 ? C.paper : C.ink }}>
              <span className="num" style={{ fontSize: 24, lineHeight: 1, color: i === p.terms.waterfall.length - 1 ? C.goldHi : C.goldDeep }}>{i + 1}</span>
              <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{w}</span>
            </div>
          ))}
        </div>
      </section>

      {/* budget + projection */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 36 }}>
        <div>
          <span className="label">Budget Tracker</span>
          <div className="card" style={{ marginTop: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.paperDeep }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>Item</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700 }}>Budget</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700 }}>Spent</th>
                </tr>
              </thead>
              <tbody>
                {p.budget.map((b) => (
                  <tr key={b.item} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{b.item}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(b.budget)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: b.spent ? C.ink : C.inkSoft }}>{b.spent ? money(b.spent) : '-'}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${C.goldDeep}`, background: C.paperDeep }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>{money(budgetTotal)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>{spentTotal ? money(spentTotal) : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <span className="label">Projected Result</span>
          <div className="card" style={{ marginTop: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <tbody>
                {p.projection.map((r, i) => (
                  <tr key={r.label} style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, background: r.strong ? C.goldHi : 'transparent' }}>
                    <td style={{ padding: '11px 14px', fontWeight: r.strong ? 700 : 500 }}>{r.label}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.value < 0 ? '−' + money(-r.value) : money(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 500, marginTop: 8 }}>Estimates. The build number firms up with the final bid.</p>
        </div>
      </section>

      {/* the home */}
      <section style={{ marginTop: 36 }}>
        <span className="label">The Home - {p.home.plan}</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 12 }}>
          <div className="card" style={{ padding: '6px 18px' }}>
            {p.home.specs.map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, fontSize: 14 }}>
                <span style={{ color: C.inkSoft, fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '16px 18px' }}>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
              {p.home.features.map((f) => (
                <li key={f} style={{ fontSize: 14, fontWeight: 500, paddingLeft: 16, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, top: 7, width: 7, height: 7, borderRadius: 2, background: C.goldDeep }} />
                  {f}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600, marginTop: 12 }}>{p.home.nearby}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 14 }}>
          {p.home.gallery.map((g) => (
            <figure key={g.file} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.card }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileUrl(slug, g.file)} alt={g.caption} style={{ width: '100%', display: 'block' }} />
              <figcaption style={{ position: 'absolute', left: 10, bottom: 10, background: 'rgba(18,19,16,0.82)', color: C.paper, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* documents */}
      <section style={{ marginTop: 36 }}>
        <span className="label">Documents</span>
        <div className="card" style={{ marginTop: 12, padding: '4px 18px' }}>
          {p.docs.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: d.file ? C.ink : C.inkSoft }}>{d.label}</span>
              {d.file ? (
                <a href={fileUrl(slug, d.file)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.goldDeep, border: `2px solid ${C.goldDeep}`, borderRadius: 999, padding: '7px 14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Open</a>
              ) : (
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.inkSoft, whiteSpace: 'nowrap' }}>{d.note ?? 'Coming soon'}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* risks */}
      <section style={{ marginTop: 36 }}>
        <div style={{ background: C.paperDeep, border: `2px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
          <span className="label">Know The Risks</span>
          <ul style={{ marginTop: 10, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {p.risks.map((r) => <li key={r} style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{r}</li>)}
          </ul>
        </div>
      </section>

      {/* contact */}
      <section style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Questions? Fernando answers directly.</div>
          <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>Fernando Estevan, P.E. · 956-203-0003</div>
        </div>
        <a href={`${WHATSAPP}?text=${encodeURIComponent(`Hey Fernando, question about ${p.name} ${p.unit}.`)}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.wa, color: C.waText, border: `3px solid ${C.waBorder}`, borderRadius: 999, padding: '12px 22px', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', minHeight: 48 }}>
          Text Fernando
        </a>
      </section>
    </Shell>
  );
}
