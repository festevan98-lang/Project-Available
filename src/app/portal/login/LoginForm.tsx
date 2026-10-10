'use client';

import { useState } from 'react';

const GOLD = '#E0B64A';
const GOLD_DEEP = '#B08228';

export default function LoginForm() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'bad'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    const res = await fetch('/api/portal/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      window.location.href = '/portal';
    } else {
      setState('bad');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
      <label htmlFor="code" className="label">Access Code</label>
      <input
        id="code"
        value={code}
        onChange={(e) => { setCode(e.target.value); if (state === 'bad') setState('idle'); }}
        placeholder="XXXX-XXXX-XXXX"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        style={{ fontFamily: 'inherit', fontSize: 20, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 16px', borderRadius: 12, border: `2px solid ${state === 'bad' ? '#C0392B' : 'rgba(18,19,16,0.18)'}`, background: '#fff', color: '#121310', minHeight: 52 }}
      />
      {state === 'bad' && (
        <div style={{ fontSize: 14, fontWeight: 600, color: '#C0392B' }}>That code didn&apos;t work. Check it and try again.</div>
      )}
      <button
        type="submit"
        disabled={!code.trim() || state === 'busy'}
        style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', background: GOLD, color: '#1A160A', border: `3px solid ${GOLD_DEEP}`, borderRadius: 999, padding: '14px 22px', cursor: 'pointer', minHeight: 52, opacity: !code.trim() || state === 'busy' ? 0.6 : 1 }}
      >
        {state === 'busy' ? 'Checking...' : 'Open My Portal'}
      </button>
    </form>
  );
}
