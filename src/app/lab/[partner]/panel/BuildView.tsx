'use client';

import { useState } from 'react';
import { JURISDICTIONS, STAGE_ORDER, STAGE_SHORT, jurisdictionFor, type StageKey } from '@/lib/lab/permits';
import type { Build, StageStatus } from '@/lib/lab/types';
import type { Lang } from '@/lib/portal/types';
import { P, type PanelKey } from '../../panelCopy';
import { T } from '../../ui';

const TONE: Record<StageStatus, { bg: string; fg: string }> = {
  pending: { bg: '#F2F2F0', fg: '#6B6B6B' },
  scheduled: { bg: '#FFF6E5', fg: '#9C7A3C' },
  passed: { bg: '#EAF0EC', fg: '#1F3D33' },
  failed: { bg: '#FDECEA', fg: '#B42318' },
};
const STATUS_KEY: Record<StageStatus, PanelKey> = { pending: 'bsPending', scheduled: 'bsScheduled', passed: 'bsPassed', failed: 'bsFailed' };

export default function BuildView({ lang, partner, communities, builds: initial, isOwner, platStatus }: {
  lang: Lang;
  partner: string;
  communities: { slug: string; name: string }[];
  builds: Build[];
  isOwner: boolean;
  platStatus: Record<string, { es: string; en: string }>;
}) {
  const [builds, setBuilds] = useState(initial);
  const [jur, setJur] = useState(JURISDICTIONS[0].key);
  const [draft, setDraft] = useState({ label: '', community: communities[0]?.slug ?? '' });
  const [edit, setEdit] = useState<{ id: string; stage: StageKey; status: StageStatus; date: string; note: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function call(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch('/api/lab/builds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partner, ...body }) }).catch(() => null);
    setBusy(false);
    return res?.ok ? res.json() : null;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const data = await call({ action: 'create', ...draft });
    if (data?.build) { setBuilds([...builds, data.build]); setDraft({ ...draft, label: '' }); }
  }

  async function saveStage() {
    if (!edit) return;
    const data = await call({ action: 'stage', id: edit.id, stage: edit.stage, status: edit.status, date: edit.date, note: edit.note });
    if (data?.build) { setBuilds(builds.map((x) => (x.id === data.build.id ? data.build : x))); setEdit(null); }
  }

  const j = JURISDICTIONS.find((x) => x.key === jur)!;

  return (
    <div className="fade">
      <h2 className="serif" style={{ fontSize: 30, margin: '24px 0 6px' }}>{P(lang, 'bTitle')}</h2>
      <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: 0 }}>{P(lang, 'bLead')}</p>

      {Object.keys(platStatus).length > 0 && (
        <>
          <div className="kicker" style={{ marginTop: 22 }}>{P(lang, 'platTitle')}</div>
          <div className="card" style={{ marginTop: 8, overflow: 'hidden' }}>
            {communities.filter((c) => platStatus[c.slug]).map((c, i) => (
              <div key={c.slug} style={{ padding: '12px 16px', borderTop: i ? `1px solid ${T.line}` : 'none', fontSize: 14, lineHeight: 1.5 }}>
                <b>{c.name}</b>
                <span style={{ display: 'block', color: T.muted }}>{platStatus[c.slug][lang]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="kicker" style={{ marginTop: 22 }}>{P(lang, 'bHomes')}</div>
      {builds.length === 0 && <div className="card" style={{ marginTop: 8, padding: 16, fontSize: 14, color: T.muted }}>{P(lang, 'bNone')}</div>}
      <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
        {builds.map((bld) => {
          const city = jurisdictionFor(bld.community);
          const passed = STAGE_ORDER.filter((s) => bld.stages[s]?.status === 'passed').length;
          return (
            <div key={bld.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{bld.label}</span>
                <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{city?.name ?? ''} · {passed}/{STAGE_ORDER.length}</span>
              </div>
              <div role="progressbar" aria-valuemin={0} aria-valuemax={STAGE_ORDER.length} aria-valuenow={passed} style={{ height: 6, borderRadius: 999, background: T.soft, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: `${(passed / STAGE_ORDER.length) * 100}%`, height: '100%', background: T.accent }} />
              </div>
              <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
                {STAGE_ORDER.map((s) => {
                  const st = bld.stages[s];
                  const status = st?.status ?? 'pending';
                  const isEditing = edit?.id === bld.id && edit.stage === s;
                  return (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 14 }}>
                      <span style={{ flex: '1 1 160px' }}>
                        {STAGE_SHORT[s][lang]}
                        {st?.note && <span style={{ display: 'block', fontSize: 12, color: T.muted }}>{st.note}</span>}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '3px 10px', background: TONE[status].bg, color: TONE[status].fg }}>
                          {P(lang, STATUS_KEY[status])}{st?.date ? ` · ${st.date}` : ''}
                        </span>
                        {isOwner && !isEditing && (
                          <button type="button" onClick={() => setEdit({ id: bld.id, stage: s, status: status === 'pending' ? 'scheduled' : status, date: st?.date ?? new Date().toLocaleDateString('en-CA'), note: st?.note ?? '' })}
                            style={{ background: 'none', border: 'none', color: T.accent, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', padding: 0 }}>{P(lang, 'bEdit')}</button>
                        )}
                      </span>
                      {isEditing && edit && (
                        <div className="fade" style={{ flexBasis: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, background: T.soft, borderRadius: 12, padding: 10 }}>
                          <select aria-label={STAGE_SHORT[s][lang]} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as StageStatus })}>
                            {(['pending', 'scheduled', 'passed', 'failed'] as StageStatus[]).map((x) => <option key={x} value={x}>{P(lang, STATUS_KEY[x])}</option>)}
                          </select>
                          <input type="date" aria-label={P(lang, 'bWhen')} value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} />
                          <input aria-label={P(lang, 'bNote')} placeholder={P(lang, 'bNote')} value={edit.note} maxLength={300} onChange={(e) => setEdit({ ...edit, note: e.target.value })} style={{ gridColumn: '1 / -1' }} />
                          <button type="button" className="btn btn-primary" disabled={busy} onClick={saveStage}>{P(lang, 'cpSave')}</button>
                          <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>{lang === 'es' ? 'Cancelar' : 'Cancel'}</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isOwner && (
        <form onSubmit={create} style={{ marginTop: 14, borderRadius: 16, border: '1px dashed #B42318', padding: 16, background: '#FFF8F6', display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B42318' }}>{P(lang, 'bAdd')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            <input aria-label={P(lang, 'bLabelPh')} placeholder={P(lang, 'bLabelPh')} value={draft.label} maxLength={120} onChange={(e) => setDraft({ ...draft, label: e.target.value })} required />
            <select aria-label={P(lang, 'community')} value={draft.community} onChange={(e) => setDraft({ ...draft, community: e.target.value })}>
              {communities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy || !draft.label.trim()}>{P(lang, 'bAddBtn')}</button>
        </form>
      )}

      <div className="kicker" style={{ marginTop: 28 }}>{P(lang, 'bHow')}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {JURISDICTIONS.map((x) => (
          <button key={x.key} type="button" aria-pressed={jur === x.key} onClick={() => setJur(x.key)}
            style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '8px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${jur === x.key ? T.accent : T.line}`, background: jur === x.key ? T.accent : '#fff', color: jur === x.key ? '#fff' : T.ink }}>
            {x.name}
          </button>
        ))}
      </div>

      {j.pending ? (
        <div className="card" style={{ marginTop: 10, padding: 16, fontSize: 14, color: T.muted }}>{P(lang, 'bPending')}</div>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
          <div className="card" style={{ padding: 16, fontSize: 14, lineHeight: 1.55 }}>{j.office[lang]}</div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600 }}>{P(lang, 'bChecklist')}</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
              {j.checklist.map((c, i) => <li key={i}>{c[lang]}</li>)}
            </ul>
          </div>
          <div className="card" style={{ padding: '4px 16px' }}>
            {j.stages.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
                <span className="serif" style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: T.accentSoft, color: T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>
                  <b>{s.name[lang]}</b>
                  <span style={{ display: 'block', color: T.muted }}>{P(lang, 'bWhen')} {s.when[lang]}</span>
                  <span style={{ display: 'block', color: T.muted }}>{P(lang, 'bChecks')} {s.checks[lang]}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 16, fontSize: 14, lineHeight: 1.55 }}>
            <div style={{ fontWeight: 600 }}>{P(lang, 'bFees')}</div>
            <ul style={{ margin: '6px 0 10px', paddingLeft: 18 }}>{j.fees.map((f, i) => <li key={i}>{f[lang]}</li>)}</ul>
            <div style={{ fontWeight: 600 }}>{P(lang, 'bUtilities')}</div>
            <p style={{ margin: '4px 0 10px' }}>{j.utilities[lang]}</p>
            <div style={{ fontWeight: 600 }}>{P(lang, 'bSchedule')}</div>
            <p style={{ margin: '4px 0 0' }}>{j.schedule[lang]}</p>
          </div>
          <details style={{ fontSize: 13, color: T.muted }}>
            <summary style={{ cursor: 'pointer' }}>{P(lang, 'source')}</summary>
            <ul style={{ paddingLeft: 18 }}>{j.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
          </details>
        </div>
      )}
    </div>
  );
}
