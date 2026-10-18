'use client';

import { useState } from 'react';
import type { ClientPricing } from '@/lib/lab/types';
import type { Lang } from '@/lib/portal/types';
import type { AppProject } from '../../../portal/catalogData';
import { money } from '../../../portal/i18n';
import { clientPrice } from '../../pricing';
import { P } from '../../panelCopy';
import { T } from '../../ui';

/** Partner chooses what clients see: their own price, list, or their price plus a markup. */
export default function ClientPricingCard({ lang, partner, projects, initial, onSaved }: {
  lang: Lang;
  partner: string;
  projects: AppProject[];
  initial: ClientPricing;
  onSaved?: (p: ClientPricing) => void;
}) {
  const [pricing, setPricing] = useState<ClientPricing>(initial);
  const [saved, setSaved] = useState<ClientPricing>(initial);
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  const dirty = pricing.mode !== saved.mode || pricing.markupPct !== saved.markupPct;

  // A sample home (lowest-priced lot + first plan) to show what the choice means in dollars.
  const p = projects.find((x) => x.homes.some((h) => h.price != null) && x.lots.some((l) => l.price != null));
  const lot = p?.lots.filter((l) => l.price != null).sort((a, b) => a.price! - b.price!)[0];
  const home = p?.homes.find((h) => h.price != null);
  const sample = p && lot && home ? {
    name: `${p.name} · ${home.name}`,
    partner: lot.price! + home.price!,
    list: (lot.retail ?? lot.price!) + (home.retail ?? home.price!),
    client: (clientPrice(lot, pricing).price ?? 0) + (clientPrice(home, pricing).price ?? 0),
  } : null;
  const listPct = sample ? Math.round((sample.list / sample.partner - 1) * 1000) / 10 : null;

  async function save() {
    setState('busy');
    const res = await fetch('/api/lab/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner, mode: pricing.mode, markupPct: pricing.markupPct }),
    }).catch(() => null);
    const data = res?.ok ? await res.json() : null;
    if (data?.ok) { setSaved(data.clientPricing); setPricing(data.clientPricing); onSaved?.(data.clientPricing); setState('idle'); } else setState('error');
  }

  const modes: [ClientPricing['mode'], 'cpPartner' | 'cpList' | 'cpMarkup'][] = [['partner', 'cpPartner'], ['list', 'cpList'], ['markup', 'cpMarkup']];

  return (
    <div className="card" style={{ marginTop: 24, padding: 18, display: 'grid', gap: 12 }}>
      <div>
        <div className="serif" style={{ fontSize: 22 }}>{P(lang, 'cpTitle')}</div>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'cpLead')}</p>
      </div>
      <div role="radiogroup" aria-label={P(lang, 'cpTitle')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {modes.map(([m, k]) => {
          const on = pricing.mode === m;
          return (
            <button key={m} type="button" role="radio" aria-checked={on} onClick={() => setPricing({ ...pricing, mode: m })}
              style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '10px 8px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${on ? T.accent : T.line}`, background: on ? T.accent : '#fff', color: on ? '#fff' : T.ink }}>
              {P(lang, k)}
            </button>
          );
        })}
      </div>
      {pricing.mode === 'markup' && (
        <label style={{ display: 'grid', gap: 6, fontSize: 13, color: T.muted }}>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{P(lang, 'cpMarkupLabel')}</span>
            <b style={{ color: T.ink, fontSize: 15 }}>+{pricing.markupPct}%</b>
          </span>
          <input type="range" min={0} max={30} step={0.5} value={pricing.markupPct}
            onChange={(e) => setPricing({ ...pricing, markupPct: Number(e.target.value) })} style={{ padding: 0, accentColor: T.accent }} />
          {listPct != null && <span style={{ fontSize: 12 }}>{P(lang, 'cpListAt', { pct: listPct })}</span>}
        </label>
      )}
      {sample && (
        <div style={{ background: T.soft, borderRadius: 12, padding: '10px 12px', fontSize: 14, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600 }}>{sample.name}</div>
          <div>{P(lang, 'cpYouPay')}: <b>{money(sample.partner)}</b></div>
          <div>{P(lang, 'cpClientSees')}: <b style={{ color: T.accent }}>{money(sample.client)}</b>{sample.client > sample.partner ? ` (+${money(sample.client - sample.partner)})` : ''}</div>
          <div style={{ color: T.muted }}>{P(lang, 'cpList')}: {money(sample.list)}</div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" disabled={!dirty || state === 'busy'} onClick={save} style={{ opacity: !dirty || state === 'busy' ? 0.55 : 1 }}>
          {state === 'busy' ? '…' : P(lang, 'cpSave')}
        </button>
        {!dirty && state === 'idle' && <span style={{ fontSize: 13, color: T.accent }}>✓ {P(lang, 'cpSaved')}</span>}
        {state === 'error' && <span style={{ fontSize: 13, color: '#B42318' }}>{P(lang, 'cpError')}</span>}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{P(lang, 'gLegal')}</p>
    </div>
  );
}
