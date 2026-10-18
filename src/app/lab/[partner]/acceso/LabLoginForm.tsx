'use client';

import { useState } from 'react';

export default function LabLoginForm({ partner, labels }: { partner: string; labels: { code: string; bad: string; enter: string } }) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'bad'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    try {
      const res = await fetch('/api/lab/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        window.location.href = typeof data.redirect === 'string' && data.redirect.startsWith('/lab/i/') ? data.redirect : `/lab/${data.partner || partner}/panel`;
        return;
      }
      setState('bad');
    } catch {
      setState('bad');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <label htmlFor="labcode" style={{ fontSize: 14, fontWeight: 600 }}>{labels.code}</label>
      <input id="labcode" value={code} onChange={(e) => { setCode(e.target.value); setState('idle'); }} placeholder="XXXX-XXXX-XXXX"
        autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} style={{ fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase' }} />
      {state === 'bad' && <div style={{ color: '#B42318', fontSize: 14, fontWeight: 600 }}>{labels.bad}</div>}
      <button type="submit" className="btn btn-primary" disabled={!code.trim() || state === 'busy'} style={{ opacity: !code.trim() || state === 'busy' ? 0.55 : 1 }}>{labels.enter}</button>
    </form>
  );
}
