import type { ReactNode } from 'react';
import type { Lang } from '@/lib/portal/types';
import { t } from './i18n';
import LangToggle from './LangToggle';

export const C = {
  paper: '#F4F1E8',
  paperDeep: '#ECE8DC',
  ink: '#121310',
  inkSoft: '#4A4C46',
  gold: '#E0B64A',
  goldDeep: '#B08228',
  goldHi: '#F0D076',
  card: '#FFFFFF',
  border: 'rgba(18,19,16,0.13)',
  wa: '#25D366',
  waText: '#06301A',
  waBorder: '#128C4A',
};

export const money = (v: number) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const WHATSAPP = 'https://wa.me/19562030003';

export const portalCss = `
  .pt * { box-sizing: border-box; }
  .pt { font-family: var(--font-oswald), 'Arial Narrow', sans-serif; color: ${C.ink}; }
  .pt .display { font-family: var(--font-anton), Impact, sans-serif; text-transform: uppercase; line-height: 0.94; letter-spacing: 0.01em; }
  .pt .num { font-family: var(--font-anton), Impact, sans-serif; letter-spacing: 0.01em; }
  .pt .label { font-weight: 700; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.goldDeep}; }
  .pt .card { background: ${C.card}; border: 2px solid ${C.border}; border-radius: 16px; }
  .pt .grid-bg { background-image:
    linear-gradient(rgba(120,125,110,0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120,125,110,0.10) 1px, transparent 1px);
    background-size: 26px 26px; }
`;

/** Branded page frame: header with logo, investor name, language toggle and log out. */
export function Shell({ name, lang = 'en', toggle = false, footer, children }: {
  name?: string;
  lang?: Lang;
  /** Show the ES/EN switch (only on pages whose content is translated). */
  toggle?: boolean;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <div className="pt grid-bg" lang={lang} style={{ background: C.paper, minHeight: '100vh' }}>
      <style>{portalCss}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(244,241,232,0.92)', backdropFilter: 'blur(12px)', borderBottom: `2px solid ${C.goldDeep}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/ferest-mark.webp" alt="FEREST" style={{ height: 28, width: 'auto' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/ferest-wordmark.webp" alt="FEREST" style={{ height: 14, width: 'auto' }} />
            <span className="label hidden sm:inline" style={{ marginLeft: 6, fontSize: 10 }}>{t(lang, 'portal')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {name && <span style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }} className="hidden md:inline">{name}</span>}
            {toggle && <LangToggle lang={lang} />}
            {name && (
              <form action="/api/portal/logout" method="post">
                <button type="submit" style={{ background: 'transparent', border: `2px solid ${C.goldDeep}`, color: C.goldDeep, borderRadius: 999, padding: '7px 14px', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', minHeight: 36 }}>
                  {t(lang, 'logout')}
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 64px' }}>{children}</main>
      <footer style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ borderTop: `2px solid ${C.goldDeep}`, paddingTop: 16, fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
          {footer ?? t(lang, 'footerDeal')}
        </div>
      </footer>
    </div>
  );
}
