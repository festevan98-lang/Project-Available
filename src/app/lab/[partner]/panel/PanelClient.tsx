'use client';

import { useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import type { AppProject } from '../../../portal/catalogData';
import { money } from '../../../portal/i18n';
import { L } from '../../copy';
import { P, type PanelKey } from '../../panelCopy';
import { clientProjects } from '../../pricing';
import { T } from '../../ui';
import type { ClientPricing } from '@/lib/lab/types';
import ClientPricingCard from './ClientPricingCard';
import type { CostModel } from '@/lib/lab/fullProforma';
import type { Build, Comp } from '@/lib/lab/types';
import BuildView from './BuildView';
import MarketView from './MarketView';
import Numbers, { type MarketRef, type OwnerView } from './Numbers';

export interface PanelLink {
  id: string;
  label: string;
  createdAt: string;
  opens: number;
  lastOpenedAt: string | null;
  active: boolean;
  hot: boolean;
  lastOption: string | null;
}

export interface PanelLead {
  id: string;
  kind: 'access' | 'visit' | 'interest';
  name: string;
  phone: string;
  email: string;
  interest: string[];
  message: string;
  createdAt: string;
}

type Tab = 'numbers' | 'market' | 'build' | 'clients' | 'marketing' | 'growth';

/** Digits for wa.me: 10-digit local numbers get Mexico's country code. */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 ? `52${d}` : d;
};

const when = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function CopyButton({ text, lang }: { text: string; lang: Lang }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn btn-ghost" style={{ minHeight: 40, padding: '0 14px', fontSize: 14 }}
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* clipboard blocked */ } }}>
      {done ? `✓ ${L(lang, 'copied')}` : L(lang, 'copy')}
    </button>
  );
}

export default function PanelClient({ lang, partner, first, isOwner, projects, volumeMin, owner, links: initialLinks, leads, site, origin, from, pricing, model, models = {}, market, marketRefs, builds, platStatus }: {
  lang: Lang;
  partner: { slug: string; name: string; contactName: string; whatsapp: string };
  first: string;
  isOwner: boolean;
  projects: AppProject[];
  volumeMin: number;
  owner: OwnerView | null;
  links: PanelLink[];
  leads: PanelLead[];
  site: string;
  origin: string;
  from: number | null;
  pricing: ClientPricing;
  model: CostModel | null;
  models?: Record<string, CostModel>;
  market: { comps: Comp[]; source: string; updatedAt: string | null; notes: Record<string, string> };
  marketRefs: MarketRef[];
  builds: Build[];
  platStatus: Record<string, { es: string; en: string }>;
}) {
  const [tab, setTab] = useState<Tab>('numbers');
  const [savedPricing, setSavedPricing] = useState(pricing);
  const [links, setLinks] = useState(initialLinks);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<{ label: string; url: string } | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setBusy(true);
    const res = await fetch('/api/lab/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partner: partner.slug, label }) }).catch(() => null);
    const data = res?.ok ? await res.json() : null;
    setBusy(false);
    if (!data?.ok) return;
    setReady({ label: label.trim(), url: data.url });
    setLinks([{ id: data.id, label: label.trim(), createdAt: new Date().toISOString(), opens: 0, lastOpenedAt: null, active: true, hot: false, lastOption: null }, ...links]);
    setLabel('');
  }

  async function toggle(l: PanelLink) {
    const res = await fetch('/api/lab/links', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: l.id, active: !l.active }) }).catch(() => null);
    if (res?.ok) setLinks(links.map((x) => (x.id === l.id ? { ...x, active: !x.active } : x)));
  }

  const linkUrl = (id: string) => `${origin}/lab/i/${id}`;
  const waSend = (url: string) => `https://wa.me/?text=${encodeURIComponent(`${L(lang, 'waInvite')} ${url}`)}`;
  // Lowest client price (cheapest lot + plan) under the saved pricing, for the marketing messages.
  const liveFrom = Math.min(...clientProjects(projects, savedPricing).flatMap((p) => {
    const lot = Math.min(...p.lots.map((l) => l.price ?? Infinity));
    return p.homes.map((h) => (h.price != null && Number.isFinite(lot) ? h.price + lot : Infinity));
  }));
  const fromText = Number.isFinite(liveFrom) ? money(liveFrom) : from != null ? money(from) : '';

  const tabs: [Tab, PanelKey][] = [['numbers', 'tNumbers'], ['market', 'tMarket'], ['build', 'tBuild'], ['clients', 'tClients'], ['marketing', 'tMarketing'], ['growth', 'tGrowth']];

  const renderTab = (current: Tab): React.ReactNode => {
  let body: React.ReactNode;
  if (current === 'numbers') {
    body = model || Object.keys(models).length
      ? <Numbers lang={lang} projects={projects} volumeMin={volumeMin} model={model} models={models} owner={owner} market={marketRefs} />
      : <p style={{ marginTop: 24, color: T.muted }}>{P(lang, 'noModel')}</p>;
  } else if (current === 'market') {
    body = <MarketView lang={lang} partner={partner.slug} communities={projects.map((p) => ({ slug: p.slug, name: p.name, city: p.place }))} comps={market.comps} source={market.source} updatedAt={market.updatedAt} isOwner={isOwner} notes={market.notes} />;
  } else if (current === 'build') {
    body = <BuildView lang={lang} partner={partner.slug} communities={projects.map((p) => ({ slug: p.slug, name: p.name }))} builds={builds} isOwner={isOwner} platStatus={platStatus} />;
  } else if (current === 'clients') {
    body = (
      <div className="fade">
        <ClientPricingCard lang={lang} partner={partner.slug} projects={projects} initial={savedPricing} onSaved={setSavedPricing} />
        <form onSubmit={create} className="card" style={{ marginTop: 24, padding: 18, display: 'grid', gap: 10 }}>
          <div className="serif" style={{ fontSize: 22 }}>{L(lang, 'sendTitle')}</div>
          <p style={{ margin: 0, fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{L(lang, 'sendHint')}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={L(lang, 'clientLabel')} maxLength={80} style={{ flex: '1 1 220px' }} />
            <button type="submit" className="btn btn-primary" disabled={busy || !label.trim()} style={{ opacity: busy || !label.trim() ? 0.55 : 1 }}>{busy ? L(lang, 'creating') : L(lang, 'create')}</button>
          </div>
          {ready && (
            <div className="fade" style={{ background: T.accentSoft, borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 14 }}>{L(lang, 'linkReady')} <b>{ready.label}</b></div>
              <div style={{ fontSize: 13, color: T.muted, wordBreak: 'break-all' }}>{ready.url}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" style={{ minHeight: 40, fontSize: 14 }} href={waSend(ready.url)} target="_blank" rel="noopener noreferrer">{L(lang, 'sendWa')}</a>
                <CopyButton text={ready.url} lang={lang} />
              </div>
            </div>
          )}
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, gap: 10, flexWrap: 'wrap' }}>
          <div className="kicker">{L(lang, 'clientsTitle')}</div>
          <a href={`/api/lab/export?partner=${partner.slug}`} style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>{L(lang, 'export')}</a>
        </div>
        <div className="card" style={{ marginTop: 8, overflow: 'hidden' }}>
          {links.length === 0 && <div style={{ padding: 16, color: T.muted, fontSize: 14 }}>{L(lang, 'noClients')}</div>}
          {links.map((l, i) => (
            <div key={l.id} style={{ padding: '12px 16px', borderTop: i ? `1px solid ${T.line}` : 'none', opacity: l.active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{l.label}{l.hot && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#fff', background: T.gold, borderRadius: 999, padding: '2px 8px' }}>{L(lang, 'hot')}</span>}</span>
                <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{l.active ? L(lang, 'active') : L(lang, 'revoked')}</span>
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
                {L(lang, 'opens')}: {l.opens} · {l.lastOpenedAt ? `${L(lang, 'lastOpen')}: ${when(l.lastOpenedAt, lang)}` : L(lang, 'never')}
                {l.lastOption && <> · {L(lang, 'viewed')}: {l.lastOption}</>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {l.active && <a className="btn btn-ghost" style={{ minHeight: 36, fontSize: 13, padding: '0 12px' }} href={waSend(linkUrl(l.id))} target="_blank" rel="noopener noreferrer">{L(lang, 'sendWa')}</a>}
                {l.active && <CopyButton text={linkUrl(l.id)} lang={lang} />}
                <button type="button" className="btn btn-ghost" style={{ minHeight: 36, fontSize: 13, padding: '0 12px' }} onClick={() => toggle(l)}>{l.active ? L(lang, 'revoke') : (lang === 'es' ? 'Reactivar' : 'Turn back on')}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="kicker" style={{ marginTop: 26 }}>{L(lang, 'requestsTitle')}</div>
        <div className="card" style={{ marginTop: 8, overflow: 'hidden' }}>
          {leads.length === 0 && <div style={{ padding: 16, color: T.muted, fontSize: 14 }}>{L(lang, 'noRequests')}</div>}
          {leads.map((d, i) => (
            <div key={d.id} style={{ padding: '12px 16px', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontWeight: 600 }}>{d.name}</span>
                <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{L(lang, d.kind === 'access' ? 'kAccess' : d.kind === 'visit' ? 'kVisit' : 'kInterest')} · {when(d.createdAt, lang)}</span>
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {d.phone && <a href={`https://wa.me/${waNumber(d.phone)}`} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontWeight: 600 }}>{d.phone}</a>}
                {d.email && <a href={`mailto:${d.email}`} style={{ color: T.accent }}>{d.email}</a>}
                {d.interest.length > 0 && <span>{d.interest.join(', ')}</span>}
              </div>
              {d.message && <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>{d.message}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  } else if (current === 'marketing') {
    const vars = { name: lang === 'es' ? '[nombre]' : '[name]', from: fromText, site, partner: partner.name };
    const messages: [PanelKey, PanelKey][] = [['m1Title', 'm1Body'], ['m2Title', 'm2Body'], ['m3Title', 'm3Body']];
    body = (
      <div className="fade">
        <h2 className="serif" style={{ fontSize: 30, margin: '24px 0 14px' }}>{P(lang, 'mTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="serif" style={{ fontSize: 21 }}>{P(lang, 'mSite')}</div>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'mSiteD')}</p>
            <div style={{ fontSize: 13, wordBreak: 'break-all', marginBottom: 10 }}>{site}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="btn btn-primary" style={{ minHeight: 40, fontSize: 14 }} href={site} target="_blank" rel="noopener noreferrer">{P(lang, 'mOpen')}</a>
              <CopyButton text={site} lang={lang} />
            </div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div className="serif" style={{ fontSize: 21 }}>{P(lang, 'mKit')}</div>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'mKitD')}</p>
            <a className="btn btn-primary" style={{ minHeight: 40, fontSize: 14 }} href={`/lab/${partner.slug}/kit`} target="_blank" rel="noopener noreferrer">{P(lang, 'mOpen')}</a>
          </div>
        </div>
        <div className="kicker" style={{ marginTop: 26 }}>{P(lang, 'mMessages')}</div>
        <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
          {messages.map(([t, b]) => {
            const text = P(lang, b, vars);
            return (
              <div key={t} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600 }}>{P(lang, t)}</span>
                  <CopyButton text={text} lang={lang} />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line', background: T.soft, borderRadius: 10, padding: 12 }}>{text}</div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 14 }}>{P(lang, 'mTip')}</p>
      </div>
    );
  } else {
    const steps: [PanelKey, PanelKey][] = [['g1', 'g1d'], ['g2', 'g2d'], ['g3', 'g3d']];
    body = (
      <div className="fade">
        <h2 className="serif" style={{ fontSize: 30, margin: '24px 0 6px' }}>{P(lang, 'gTitle')}</h2>
        <p style={{ fontSize: 15, color: T.muted, margin: 0 }}>{P(lang, 'gLead')}</p>
        <ol style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 12 }}>
          {steps.map(([t, d], i) => (
            <li key={t} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 14, borderColor: i === 0 ? T.accent : T.line }}>
              <span className="serif" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: i === 0 ? T.accent : T.accentSoft, color: i === 0 ? '#fff' : T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{i + 1}</span>
              <span><span style={{ display: 'block', fontWeight: 600 }}>{P(lang, t)}</span><span style={{ display: 'block', color: T.muted, fontSize: 14, marginTop: 2, lineHeight: 1.5 }}>{P(lang, d, { min: volumeMin })}</span></span>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.55, background: T.accentSoft, borderRadius: 12, padding: '12px 14px' }}>{P(lang, 'gE2')}</div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, background: '#FFF6E5', borderRadius: 12, padding: '12px 14px' }}>{P(lang, 'gLegal')}</div>

        <div className="kicker" style={{ marginTop: 26 }}>{P(lang, 'funnelTitle')}</div>
        <ol style={{ margin: '8px 0 0', paddingLeft: 20, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
          {(['funnel1', 'funnel2', 'funnel3', 'funnel4'] as PanelKey[]).map((k) => <li key={k}>{P(lang, k)}</li>)}
        </ol>

        <div className="kicker" style={{ marginTop: 26 }}>{P(lang, 'talkTitle')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 8 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, color: T.accent }}>✓ {P(lang, 'talkDo')}</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
              {(['do1', 'do2', 'do3'] as PanelKey[]).map((k) => <li key={k}>{P(lang, k)}</li>)}
            </ul>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, color: '#B42318' }}>✕ {P(lang, 'talkDont')}</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
              {(['dont1', 'dont2', 'dont3'] as PanelKey[]).map((k) => <li key={k}>{P(lang, k)}</li>)}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return body;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
        <div>
          <div className="kicker">{L(lang, 'panelTitle')}{isOwner ? ' · FEREST' : ''}</div>
          <h1 className="serif" style={{ fontSize: 32, margin: '6px 0 0' }}>{L(lang, 'panelHello', { first })}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn btn-ghost" style={{ minHeight: 40, fontSize: 14 }} href={`/lab/${partner.slug}/vista`} target="_blank" rel="noopener noreferrer">{L(lang, 'preview')}</a>
          <a className="btn btn-ghost" style={{ minHeight: 40, fontSize: 14 }} href={`/lab/${partner.slug}`} target="_blank" rel="noopener noreferrer">{L(lang, 'publicPage')}</a>
        </div>
      </div>
      <nav aria-label={L(lang, 'panelTitle')} style={{ position: 'sticky', top: 61, zIndex: 20, background: '#fff', borderBottom: `1px solid ${T.line}`, marginTop: 16, display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(([t, k]) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-current={tab === t ? 'page' : undefined}
            style={{ flexShrink: 0, padding: '12px 10px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? T.accent : 'transparent'}`, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: tab === t ? T.ink : T.muted, cursor: 'pointer' }}>
            {P(lang, k)}{t === 'clients' && leads.length > 0 ? ` (${leads.length})` : ''}
          </button>
        ))}
      </nav>
      {tabs.map(([t]) => <div key={t} hidden={tab !== t}>{renderTab(t)}</div>)}
    </div>
  );
}
