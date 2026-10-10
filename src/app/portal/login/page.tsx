import { C, Shell, WHATSAPP } from '../ui';
import LoginForm from './LoginForm';

export default function PortalLogin() {
  return (
    <Shell>
      <section style={{ maxWidth: 440, margin: '0 auto', padding: '56px 0 24px' }}>
        <div className="card" style={{ padding: '28px 24px' }}>
          <span className="label">Private Access</span>
          <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 8vw, 2.8rem)', marginTop: 8 }}>
            Welcome, <span style={{ color: C.goldDeep }}>Partner.</span>
          </h1>
          <p style={{ marginTop: 10, fontSize: 15, color: C.inkSoft, fontWeight: 500, lineHeight: 1.5 }}>
            Enter the access code FEREST gave you to see your project, your money, and every step of the build.
          </p>
          <LoginForm />
        </div>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>
          No code? <a href={`${WHATSAPP}?text=${encodeURIComponent('Hey FEREST, I need my investor portal access code.')}`} target="_blank" rel="noopener noreferrer" style={{ color: C.goldDeep, fontWeight: 700 }}>Text Fernando</a>
        </p>
      </section>
    </Shell>
  );
}
