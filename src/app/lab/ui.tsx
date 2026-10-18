import type { ReactNode } from 'react';
import type { Lang } from '@/lib/portal/types';
import LangToggle from '../portal/LangToggle';
import { L } from './copy';

export const T = {
  bg: '#FFFFFF',
  soft: '#F6F5F2',
  ink: '#141414',
  muted: '#6B6B6B',
  line: 'rgba(20,20,20,0.10)',
  accent: '#1F3D33',
  accentSoft: '#EAF0EC',
  gold: '#9C7A3C',
};

export const labCss = `
  .lx { font-family: var(--lab-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: ${T.ink}; background: ${T.bg}; -webkit-font-smoothing: antialiased; }
  .lx * { box-sizing: border-box; }
  .lx .serif { font-family: var(--lab-serif), Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }
  .lx .kicker { font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.gold}; }
  .lx .card { background: #fff; border: 1px solid ${T.line}; border-radius: 16px; }
  .lx a { color: inherit; }
  .lx .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 20px; border-radius: 12px; font: 600 15px var(--lab-sans), sans-serif; text-decoration: none; border: 1px solid transparent; cursor: pointer; }
  .lx .btn-primary { background: ${T.accent}; color: #fff; }
  .lx .btn-ghost { background: #fff; color: ${T.ink}; border-color: ${T.line}; }
  .lx input, .lx textarea, .lx select { font: 16px var(--lab-sans), sans-serif; color: ${T.ink}; width: 100%; padding: 12px 14px; border: 1px solid ${T.line}; border-radius: 12px; background: #fff; }
  .lx input:focus, .lx textarea:focus { outline: 2px solid ${T.accent}; outline-offset: 1px; }
  .lx .fade { animation: lx-in .25s ease-out; }
  @keyframes lx-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .lx .fade { animation: none; } }
`;

export function Brand({ name, logo }: { name: string; logo: string | null }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={30} height={30} style={{ borderRadius: 7, display: 'block' }} />
      )}
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
        {name}
        <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: T.gold }}>× FEREST DEVELOPMENT</span>
      </span>
    </span>
  );
}

/** White-label page frame: partner brand up top, FEREST only as the developer credit. */
export function LabShell({ lang, brand, right, children, wide = false }: {
  lang: Lang;
  brand: { name: string; logo: string | null };
  right?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="lx" lang={lang} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <style>{labCss}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: wide ? 1040 : 640, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Brand {...brand} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {right}
            <LangToggle lang={lang} />
          </div>
        </div>
      </header>
      <main style={{ flex: 1, width: '100%', maxWidth: wide ? 1040 : 640, margin: '0 auto', padding: '0 20px 48px' }}>{children}</main>
      <footer style={{ borderTop: `1px solid ${T.line}`, background: T.soft }}>
        <div style={{ maxWidth: wide ? 1040 : 640, margin: '0 auto', padding: '18px 20px 28px', fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink }}>{L(lang, 'developedBy')}</div>
          <div>{L(lang, 'privateNote')}</div>
        </div>
      </footer>
    </div>
  );
}
