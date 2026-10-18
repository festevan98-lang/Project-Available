'use client';

import { useState } from 'react';
import type { Lang } from '@/lib/portal/types';
import { L, type LabKey } from '../copy';
import { T } from '../ui';

type Goal = 'assets' | 'stay' | 'rent' | 'business';
type Budget = 'b1' | 'b2' | 'b3' | 'b4';
type Pay = 'cash' | 'loan' | 'unsure';
type When = 'w1' | 'w2' | 'w3';

const GOALS: [Goal, LabKey][] = [['assets', 'gAssets'], ['stay', 'gStay'], ['rent', 'gRent'], ['business', 'gBusiness']];
const BUDGETS: [Budget, LabKey][] = [['b1', 'b1'], ['b2', 'b2'], ['b3', 'b3'], ['b4', 'b4']];
const PAYS: [Pay, LabKey][] = [['cash', 'pCash'], ['loan', 'pLoan'], ['unsure', 'pUnsure']];
const WHENS: [When, LabKey][] = [['w1', 'w1'], ['w2', 'w2'], ['w3', 'w3']];

/** Public lead form: four questions, an honest plan on screen, then contact details for the partner. */
export default function PlanQuiz({ lang, partner, partnerName }: { lang: Lang; partner: string; partnerName: string }) {
  const [goal, setGoal] = useState<Goal[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [pay, setPay] = useState<Pay | null>(null);
  const [when, setWhen] = useState<When | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', website: '' });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  const ready = goal.length > 0 && budget && pay && when;
  const vars = { partner: partnerName };

  const chips = <V extends string>(items: [V, LabKey][], isOn: (v: V) => boolean, toggle: (v: V) => void) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map(([v, k]) => {
        const on = isOn(v);
        return (
          <button key={v} type="button" aria-pressed={on} onClick={() => toggle(v)}
            style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 500, padding: '9px 14px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${on ? T.accent : T.line}`, background: on ? T.accentSoft : '#fff', color: on ? T.accent : T.ink }}>
            {L(lang, k)}
          </button>
        );
      })}
    </div>
  );
  const q = (k: LabKey, body: React.ReactNode) => (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{L(lang, k)}</legend>
      {body}
    </fieldset>
  );

  const plan: LabKey[] = [];
  if (budget) plan.push(budget === 'b1' ? 'planB1' : budget === 'b2' ? 'planB2' : budget === 'b3' ? 'planB3' : 'planB4');
  if (pay) plan.push(pay === 'cash' ? 'planCash' : pay === 'loan' ? 'planLoan' : 'planUnsure');
  if (goal.includes('rent')) plan.push('planRent');
  if (goal.includes('business')) plan.push('planBusiness');
  if (goal.includes('stay')) plan.push('planStay');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    const answers = [
      `${L(lang, 'qGoal')} ${goal.map((g) => L(lang, GOALS.find((x) => x[0] === g)![1])).join(', ')}`,
      `${L(lang, 'qBudget')}: ${budget ? L(lang, budget) : '-'}`,
      `${L(lang, 'qPay')} ${pay ? L(lang, PAYS.find((x) => x[0] === pay)![1]) : '-'}`,
      `${L(lang, 'qWhen')} ${when ? L(lang, when) : '-'}`,
    ].join(' · ');
    const interest = [
      ...(budget === 'b1' ? ['lot'] : ['home']),
      ...(goal.includes('business') ? ['business'] : []),
    ];
    const res = await fetch('/api/lab/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, partner, kind: 'access', interest, consent, message: answers }),
    }).catch(() => null);
    setState(res?.ok ? 'done' : 'error');
  }

  if (state === 'done') {
    return <div className="card fade" style={{ padding: 22, fontSize: 17, lineHeight: 1.5 }}>{L(lang, 'fThanks', vars)}</div>;
  }

  return (
    <div className="card" style={{ padding: 22, display: 'grid', gap: 16 }}>
      <div>
        <div className="serif" style={{ fontSize: 26 }}>{L(lang, 'quizTitle')}</div>
        <p style={{ margin: '6px 0 0', fontSize: 15, color: T.muted, lineHeight: 1.5 }}>{L(lang, 'quizLead', vars)}</p>
      </div>
      {q('qGoal', chips(GOALS, (v) => goal.includes(v), (v) => setGoal(goal.includes(v) ? goal.filter((x) => x !== v) : [...goal, v])))}
      {q('qBudget', chips(BUDGETS, (v) => budget === v, setBudget))}
      {q('qPay', chips(PAYS, (v) => pay === v, setPay))}
      {q('qWhen', chips(WHENS, (v) => when === v, setWhen))}

      {!showPlan && (
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => setShowPlan(true)} style={{ opacity: ready ? 1 : 0.55 }}>
          {L(lang, 'quizNext')}
        </button>
      )}

      {showPlan && ready && (
        <div className="fade" style={{ display: 'grid', gap: 14 }}>
          <div style={{ background: T.accentSoft, borderRadius: 14, padding: '14px 16px' }}>
            <div className="serif" style={{ fontSize: 21, color: T.accent }}>{L(lang, 'planTitle')}</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6, fontSize: 15, lineHeight: 1.5 }}>
              {plan.map((k) => <li key={k}>{L(lang, k)}</li>)}
            </ul>
            <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5 }}>{L(lang, 'planNext', vars)}</p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: T.muted }}>{L(lang, 'generalInfo')}</p>
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
              {L(lang, 'fName')}
              <input autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
              {L(lang, 'fPhone')}
              <input type="tel" autoComplete="tel" placeholder="+52 81 0000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 }}>
              {L(lang, 'fEmail')}
              <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: T.muted }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2 }} />
              <span>{L(lang, 'fConsent')} <a href={`/lab/${partner}/privacidad`} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{L(lang, 'privacyFull')}</a></span>
            </label>
            {state === 'error' && <div style={{ color: '#B42318', fontSize: 14, fontWeight: 600 }}>{L(lang, 'fError')}</div>}
            <button type="submit" className="btn btn-primary" disabled={state === 'busy' || !consent || !form.name || (!form.phone && !form.email)}
              style={{ opacity: state === 'busy' || !consent || !form.name || (!form.phone && !form.email) ? 0.55 : 1 }}>
              {state === 'busy' ? L(lang, 'fSending') : L(lang, 'fSend')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
