import { C, Shell, WHATSAPP } from '../ui';
import { t } from '../i18n';
import { resolveLang } from '../lang';
import LoginForm from './LoginForm';

export default async function PortalLogin({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const lang = await resolveLang(null, (await searchParams).lang);
  return (
    <Shell lang={lang} toggle>
      <section style={{ maxWidth: 440, margin: '0 auto', padding: '56px 0 24px' }}>
        <div className="card" style={{ padding: '28px 24px' }}>
          <span className="label">{t(lang, 'loginLabel')}</span>
          <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 8vw, 2.8rem)', marginTop: 8 }}>
            {t(lang, 'loginTitle')} <span style={{ color: C.goldDeep }}>{t(lang, 'loginTitleGold')}</span>
          </h1>
          <p style={{ marginTop: 10, fontSize: 15, color: C.inkSoft, fontWeight: 500, lineHeight: 1.5 }}>
            {t(lang, 'loginBody')}
          </p>
          <LoginForm labels={{ code: t(lang, 'codeLabel'), bad: t(lang, 'codeBad'), busy: t(lang, 'codeBusy'), go: t(lang, 'codeGo') }} />
        </div>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>
          {t(lang, 'noCode')}{' '}
          <a href={`${WHATSAPP}?text=${encodeURIComponent(t(lang, 'noCodeMsg'))}`} target="_blank" rel="noopener noreferrer" style={{ color: C.goldDeep, fontWeight: 700 }}>{t(lang, 'textFernando')}</a>
        </p>
      </section>
    </Shell>
  );
}
