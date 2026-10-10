import type { Lang } from '@/lib/portal/types';

export const LANG_COOKIE = 'ferest_lang';

export const isLang = (v: unknown): v is Lang => v === 'es' || v === 'en';

const dict = {
  portal: { es: 'Portal de Inversionistas', en: 'Investor Portal' },
  logout: { es: 'Salir', en: 'Log Out' },
  footerDeal: {
    es: 'Privado y confidencial. Solo para inversionistas de este proyecto. No es una oferta de venta de valores; las condiciones solo son válidas en el contrato final firmado. Todas las cifras son estimadas, no garantizadas.',
    en: 'Private and confidential. For investors in this project only. This is not an offer to sell securities; terms are set only in a final signed agreement. All projections are estimates, not promises.',
  },
  footerCatalog: {
    es: 'Privado y confidencial, solo para {name}. Precios en dólares (USD), sujetos a disponibilidad y a firma de contrato. Los precios de construcción son estimados hasta la cotización final.',
    en: 'Private and confidential, for {name} only. Prices in US dollars (USD), subject to availability and a signed contract. Build prices are estimates until the final bid.',
  },

  loginLabel: { es: 'Acceso Privado', en: 'Private Access' },
  loginTitle: { es: 'Bienvenido a', en: 'Welcome,' },
  loginTitleGold: { es: 'su portal.', en: 'Partner.' },
  loginBody: {
    es: 'Ingrese el código de acceso que le envió FEREST para ver sus lotes, sus precios y el avance de la obra.',
    en: 'Enter the access code FEREST gave you to see your project, your money, and every step of the build.',
  },
  noCode: { es: '¿No tiene código?', en: 'No code?' },
  textFernando: { es: 'Escríbale a Fernando', en: 'Text Fernando' },
  noCodeMsg: { es: 'Hola FEREST, necesito mi código de acceso al portal.', en: 'Hey FEREST, I need my investor portal access code.' },
  codeLabel: { es: 'Código de acceso', en: 'Access Code' },
  codeBad: { es: 'Ese código no funcionó. Revíselo e intente de nuevo.', en: "That code didn't work. Check it and try again." },
  codeBusy: { es: 'Revisando...', en: 'Checking...' },
  codeGo: { es: 'Entrar a mi portal', en: 'Open My Portal' },

  catLabel: { es: 'Precios Exclusivos Para Inversionistas', en: 'Exclusive Investor Pricing' },
  catHello: { es: 'Bienvenido, {first}.', en: 'Welcome, {first}.' },
  catDiscount: { es: '{pct}% de descuento en el lote', en: '{pct}% off the lot' },
  usd: { es: 'Precios en dólares (USD)', en: 'Prices in US dollars (USD)' },
  step1: { es: 'Elija su lote', en: 'Pick Your Lot' },
  step2: { es: '¿Solo el lote o la casa completa?', en: 'Lot Only or the Full Home?' },
  step3: { es: 'Su precio', en: 'Your Price' },
  lot: { es: 'Lote {n}', en: 'Lot {n}' },
  lotPending: { es: 'Lote por confirmar', en: 'Lot to be confirmed' },
  lotsPendingNote: {
    es: 'Fernando Estevan le confirmará muy pronto los números de lote y su precio de inversionista. Abajo puede ver los modelos de casa.',
    en: 'Fernando Estevan will confirm the lot numbers and your investor pricing shortly. You can see the home models below.',
  },
  retail: { es: 'Precio de lista', en: 'Retail price' },
  yours: { es: 'Su precio', en: 'Your price' },
  lotOnly: { es: 'Solo el lote', en: 'Lot only' },
  lotOnlyDesc: { es: 'Usted compra solo el terreno.', en: 'You buy just the land.' },
  build: { es: 'Construcción', en: 'Build' },
  plusLot: { es: '(no incluye lote)', en: '(lot not included)' },
  bedBath: { es: '{b} recámaras · {ba} baños', en: '{b} bed · {ba} bath' },
  total: { es: 'Su precio total', en: 'Your total price' },
  retailTotal: { es: 'Precio de lista total', en: 'Total retail price' },
  save: { es: 'Su ahorro', en: 'You save' },
  pending: { es: 'Por confirmar', en: 'To be confirmed' },
  cta: { es: 'Me interesa · WhatsApp', en: "I'm interested · WhatsApp" },
  waMsg: {
    es: 'Hola Fernando, me interesa: {project} · {lot} · {option}. Mi precio (USD): {price}.',
    en: "Hi Fernando, I'm interested in: {project} · {lot} · {option}. My price (USD): {price}.",
  },
  questions: { es: '¿Preguntas? Fernando le contesta directo.', en: 'Questions? Fernando answers directly.' },
  otherProjects: { es: 'Sus proyectos', en: 'Your projects' },
} satisfies Record<string, Record<Lang, string>>;

export type Key = keyof typeof dict;

/** Translate a UI string, filling {placeholders}. */
export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  return dict[key][lang].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export const money = (v: number) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Square feet and square meters, meters first in Spanish. */
export const area = (sqft: number, lang: Lang = 'en') => {
  const ft = `${sqft.toLocaleString('en-US')} ft²`;
  const m2 = `${Math.round(sqft * 0.092903).toLocaleString('en-US')} m²`;
  return lang === 'es' ? `${m2} · ${ft}` : `${ft} · ${m2}`;
};
