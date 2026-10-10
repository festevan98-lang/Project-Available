'use client';

import { useRouter } from 'next/navigation';
import type { Lang } from '@/lib/portal/types';
import { LANG_COOKIE } from './i18n';

const GOLD_DEEP = '#B08228';

export default function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();

  function choose(next: Lang) {
    if (next === lang) return;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div role="group" aria-label="Idioma / Language" style={{ display: 'inline-flex', border: `2px solid ${GOLD_DEEP}`, borderRadius: 999, overflow: 'hidden' }}>
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === lang}
          style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', padding: '6px 11px', minHeight: 32, border: 'none', cursor: 'pointer',
            background: l === lang ? GOLD_DEEP : 'transparent', color: l === lang ? '#F4F1E8' : GOLD_DEEP }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
