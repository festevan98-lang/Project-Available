'use client';

import { useState } from 'react';

const GOLD_DEEP = '#B08228';
const INK_SOFT = '#4A4C46';
const BORDER = 'rgba(18,19,16,0.13)';

const money = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function AmountPicker({ min, max, dealSize, projectedInvestorProfit }: {
  min: number;
  max: number;
  dealSize: number;
  projectedInvestorProfit: number;
}) {
  const [amount, setAmount] = useState(min);
  const share = amount / dealSize;
  const profit = Math.round((projectedInvestorProfit * share) / 10) * 10;
  const pct = Math.round((projectedInvestorProfit / dealSize) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK_SOFT }}>If You Put In</div>
        <div className="num" style={{ fontSize: 40, lineHeight: 1 }}>{money(amount)}</div>
      </div>
      <input
        type="range"
        aria-label="Amount to invest"
        min={min}
        max={max}
        step={1000}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        style={{ width: '100%', accentColor: GOLD_DEEP, height: 28, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: INK_SOFT, marginTop: -6 }}>
        <span>{money(min)}</span><span>{money(max)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ border: `2px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT }}>Your Share Of The Lot</div>
          <div className="num" style={{ fontSize: 26, lineHeight: 1.1 }}>{(share * 100).toFixed(1)}%</div>
        </div>
        <div style={{ border: `2px solid ${GOLD_DEEP}`, borderRadius: 12, padding: '10px 12px', background: 'rgba(224,182,74,0.12)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT }}>Projected Profit</div>
          <div className="num" style={{ fontSize: 26, lineHeight: 1.1, color: GOLD_DEEP }}>~{money(profit)}</div>
        </div>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.45 }}>
        About <span style={{ color: GOLD_DEEP }}>{money(amount + profit)}</span> back in total. Every dollar earns the same ~{pct}%, so your profit grows with your amount.
      </div>
    </div>
  );
}
