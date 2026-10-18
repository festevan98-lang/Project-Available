'use client';

import { useState } from 'react';
import type { Comp } from '@/lib/lab/types';
import { perLiving, safeUrl, statsFor } from '@/lib/lab/market';
import type { Lang } from '@/lib/portal/types';
import { money } from '../../../portal/i18n';
import { P } from '../../panelCopy';
import { T } from '../../ui';

const n = (v: number) => v.toLocaleString('en-US');

export default function MarketView({ lang, partner, communities, comps, source, updatedAt, isOwner, notes }: {
  lang: Lang;
  partner: string;
  communities: { slug: string; name: string; city: string }[];
  comps: Comp[];
  source: string;
  updatedAt: string | null;
  isOwner: boolean;
  notes: Record<string, string>;
}) {
  const [community, setCommunity] = useState(communities[0]?.slug ?? '');
  const [kind, setKind] = useState<'homes' | 'lot' | 'rental'>('homes');
  const [upload, setUpload] = useState({ community: communities[0]?.slug ?? '', source: '', mode: 'replace' as 'replace' | 'add' });
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [result, setResult] = useState('');

  const s = statsFor(comps, community);
  const shown = comps
    .filter((c) => c.community === community && (kind === 'homes' ? c.kind === 'home' || c.kind === 'townhome' : c.kind === kind))
    .sort((a, b) => (a.status === b.status ? (b.date ?? '').localeCompare(a.date ?? '') : a.status === 'sold' ? -1 : 1));
  const statusLabel = (c: Comp) => P(lang, c.status === 'sold' ? 'stSold' : c.status === 'active' ? 'stActive' : c.status === 'pending' ? 'stPending' : c.status === 'leased' ? 'stLeased' : 'stUnknown');

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = (e.currentTarget.elements.namedItem('csv') as HTMLInputElement).files?.[0];
    if (!file) return;
    setState('busy');
    const csv = await file.text();
    const city = communities.find((c) => c.slug === upload.community)?.city ?? '';
    const res = await fetch('/api/lab/market', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partner, community: upload.community, csv, city, source: upload.source, mode: upload.mode }) }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (data?.ok) { setState('done'); setResult(P(lang, 'mkUploaded', { n: data.added, skipped: data.skipped })); setTimeout(() => window.location.reload(), 1200); } else { setState('error'); setResult(data?.columns ? P(lang, 'mkNoRows', { cols: data.columns.slice(0, 12).join(', ') }) : P(lang, 'cpError')); }
  }

  const stat = (label: string, value: string, sub?: string) => (
    <div style={{ background: T.soft, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 12, color: T.muted }}>{label}</div>
      <div className="serif" style={{ fontSize: 22 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>}
    </div>
  );

  return (
    <div className="fade">
      <h2 className="serif" style={{ fontSize: 30, margin: '24px 0 6px' }}>{P(lang, 'mkTitle')}</h2>
      <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, margin: 0 }}>{P(lang, 'mkLead')}</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        {communities.map((c) => {
          const on = c.slug === community;
          return (
            <button key={c.slug} type="button" aria-pressed={on} onClick={() => setCommunity(c.slug)}
              style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '8px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${on ? T.accent : T.line}`, background: on ? T.accent : '#fff', color: on ? '#fff' : T.ink }}>
              {c.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 14 }}>
        {stat(P(lang, 'mkSoldNew'), s.soldNew.median ? `$${Math.round(s.soldNew.median)}/ft²` : '—', s.soldNew.count ? `${s.soldNew.count} · $${Math.round(s.soldNew.low!)}-$${Math.round(s.soldNew.high!)}` : P(lang, 'mkNone'))}
        {stat(P(lang, 'mkActive'), s.active.median ? `$${Math.round(s.active.median)}/ft²` : '—', s.active.count ? `${s.active.count}` : P(lang, 'mkNone'))}
        {stat(P(lang, 'mkRent'), s.rent.low ? `${money(s.rent.low)}-${money(s.rent.high!)}` : '—', s.rent.count ? `${s.rent.count}` : P(lang, 'mkNone'))}
        {stat(P(lang, 'mkLots'), s.lotPerSqft.median ? `$${s.lotPerSqft.median.toFixed(2)}/ft²` : '—', s.lotPerSqft.count ? `${s.lotPerSqft.count}` : P(lang, 'mkNone'))}
      </div>

      {notes[community] && <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, margin: '10px 0 0' }}>{notes[community]}</p>}

      <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
        {(['homes', 'lot', 'rental'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
            style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${kind === k ? T.ink : T.line}`, background: kind === k ? T.ink : '#fff', color: kind === k ? '#fff' : T.ink }}>
            {P(lang, k === 'homes' ? 'mkHomes' : k === 'lot' ? 'mkLotsTab' : 'mkRentals')}
          </button>
        ))}
      </div>
      <div className="card" style={{ marginTop: 8, overflow: 'hidden' }}>
        {shown.length === 0 && <div style={{ padding: 16, fontSize: 14, color: T.muted }}>{P(lang, 'mkNone')}</div>}
        {shown.map((c, i) => {
          const pl = perLiving(c);
          return (
            <div key={`${c.address}-${i}`} style={{ padding: '10px 16px', borderTop: i ? `1px solid ${T.line}` : 'none', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{c.address}</span>
                <span style={{ display: 'block', fontSize: 12, color: T.muted }}>
                  {[c.subdivision, c.beds != null && c.baths != null ? `${c.beds}/${c.baths}` : null, c.livingSqft ? `${n(c.livingSqft)} ft²` : null, c.lotSqft && c.kind === 'lot' ? `${n(c.lotSqft)} ft² ${lang === 'es' ? 'terreno' : 'lot'}` : null, c.yearBuilt, c.builder].filter(Boolean).join(' · ')}
                </span>
                {safeUrl(c.sourceUrl) && <a href={safeUrl(c.sourceUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.accent }}>{P(lang, 'source')} ›</a>}
              </span>
              <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <b style={{ fontSize: 15 }}>{money(c.price)}{c.kind === 'rental' ? (lang === 'es' ? '/mes' : '/mo') : ''}</b>
                <span style={{ display: 'block', fontSize: 12, color: c.status === 'sold' ? T.accent : T.muted }}>{statusLabel(c)}{c.date ? ` · ${c.date.slice(0, 10)}` : ''}</span>
                {pl && c.kind !== 'rental' && <span style={{ display: 'block', fontSize: 12, color: T.muted }}>${Math.round(pl)}/ft²</span>}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 8 }}>
        {source && `${P(lang, 'source')}: ${source}. `}{updatedAt && `${P(lang, 'mkUpdated')} ${updatedAt.slice(0, 10)}. `}{P(lang, 'mkNote')}
      </p>

      {isOwner && (
        <form onSubmit={send} style={{ marginTop: 18, borderRadius: 16, border: '1px dashed #B42318', padding: 16, background: '#FFF8F6', display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B42318' }}>{P(lang, 'mkUploadTitle')}</div>
          <p style={{ margin: 0, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'mkUploadHelp')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            <select aria-label={P(lang, 'community')} value={upload.community} onChange={(e) => setUpload({ ...upload, community: e.target.value })}>
              {communities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <select aria-label={P(lang, 'mkUpload')} value={upload.mode} onChange={(e) => setUpload({ ...upload, mode: e.target.value as 'replace' | 'add' })}>
              <option value="replace">{P(lang, 'mkReplace')}</option>
              <option value="add">{P(lang, 'mkAdd')}</option>
            </select>
          </div>
          <input aria-label={P(lang, 'mkSourcePh')} placeholder={P(lang, 'mkSourcePh')} value={upload.source} onChange={(e) => setUpload({ ...upload, source: e.target.value })} />
          <input name="csv" type="file" accept=".csv,text/csv" aria-label={P(lang, 'mkUpload')} required />
          <button type="submit" className="btn btn-primary" disabled={state === 'busy'}>{state === 'busy' ? '…' : P(lang, 'mkUpload')}</button>
          {result && <div style={{ fontSize: 13, color: state === 'error' ? '#B42318' : T.accent }}>{result}</div>}
        </form>
      )}
    </div>
  );
}
