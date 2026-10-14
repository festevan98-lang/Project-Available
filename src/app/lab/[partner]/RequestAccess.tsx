'use client';

import { useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import { L } from '../copy';
import { T } from '../ui';

const OPTIONS = [['home', 'iHome'], ['lot', 'iLot'], ['business', 'iBusiness'], ['info', 'iInfo']] as const;

export default function RequestAccess({ lang, partner, partnerName }: { lang: Lang; partner: string; partnerName: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', website: '' });
  const [interest, setInterest] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    const res = await fetch('/api/lab/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, partner, kind: 'access', interest, consent }),
    }).catch(() => null);
    setState(res?.ok ? 'done' : 'error');
  }

  if (state === 'done') {
    return <div className="card fade" style={{ padding: 22, fontSize: 17, lineHeight: 1.5 }}>{L(lang, 'fThanks', { partner: partnerName })}</div>;
  }

  const field = (key: 'name' | 'phone' | 'email', label: string, type = 'text', auto?: string) => (
    <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
      {label}
      <input type={type} autoComplete={auto} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key === 'name'} />
    </label>
  );

  return (
    <form onSubmit={submit} className="card" style={{ padding: 22, display: 'grid', gap: 14 }}>
      <div className="serif" style={{ fontSize: 24 }}>{L(lang, 'formTitle')}</div>
      {field('name', L(lang, 'fName'), 'text', 'name')}
      {field('phone', L(lang, 'fPhone'), 'tel', 'tel')}
      {field('email', L(lang, 'fEmail'), 'email', 'email')}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{L(lang, 'fInterest')}</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {OPTIONS.map(([v, k]) => {
            const on = interest.includes(v);
            return (
              <button key={v} type="button" aria-pressed={on} onClick={() => setInterest(on ? interest.filter((x) => x !== v) : [...interest, v])}
                style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 500, padding: '9px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${on ? T.accent : T.line}`, background: on ? T.accentSoft : '#fff', color: on ? T.accent : T.ink }}>
                {L(lang, k)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
        {L(lang, 'fMessage')}
        <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </label>
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: T.muted }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2 }} />
        {L(lang, 'fConsent')}
      </label>
      {state === 'error' && <div style={{ color: '#B42318', fontSize: 14, fontWeight: 600 }}>{L(lang, 'fError')}</div>}
      <button type="submit" className="btn btn-primary" disabled={state === 'busy' || !consent || !form.name || (!form.phone && !form.email)}
        style={{ opacity: state === 'busy' || !consent || !form.name || (!form.phone && !form.email) ? 0.55 : 1 }}>
        {state === 'busy' ? L(lang, 'fSending') : L(lang, 'fSend')}
      </button>
    </form>
  );
}
