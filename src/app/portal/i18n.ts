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

  hello: { es: 'Hola, {first}.', en: 'Hi, {first}.' },
  helloSub: { es: 'Sus precios exclusivos, en un solo lugar.', en: 'Your exclusive pricing, all in one place.' },
  guestHello: { es: '{brand} le comparte estas opciones.', en: '{brand} is sharing these options with you.' },
  guestSub: { es: 'Desarrollos de FEREST en el Valle de Texas, con precio especial.', en: 'FEREST developments in the Texas Valley, at special pricing.' },
  homesFrom: { es: 'Casas desde {price}', en: 'Homes from {price}' },
  lotsFrom: { es: 'Lotes desde {price}', en: 'Lots from {price}' },
  location: { es: 'Ubicación', en: 'Location' },
  openMaps: { es: 'Ver en Apple Maps', en: 'Open in Apple Maps' },
  lotMap: { es: 'Ver el lote en el mapa', en: 'See the lot on the map' },
  perSqft: { es: '{price}/ft²', en: '{price}/sq ft' },
  rateLine: { es: '{yours}/ft² · lista {list}/ft²', en: '{yours}/sq ft · list {list}/sq ft' },
  buildRow: { es: 'Construcción · {sqft} ft² totales × {rate}', en: 'Build · {sqft} total sq ft × {rate}' },
  areas: { es: 'Habitable: {living} · Total techado: {total}', en: 'Living: {living} · Total under roof: {total}' },
  sqftNote: {
    es: 'Construimos a {rate}/ft² sobre el área total techada ({total} ft²: incluye cochera, porche y patio). Los bancos valúan solo el área habitable ({living} ft²).',
    en: 'We build at {rate}/sq ft of total area under roof ({total} sq ft, including garage, porch and patio). Banks appraise only the living area ({living} sq ft).',
  },
  valueTitle: { es: 'Valor estimado al terminar', en: 'Estimated finished value' },
  valueLine: { es: '{sqft} ft² habitables × {rate}/ft² de avalúo', en: '{sqft} living sq ft × {rate}/sq ft appraised' },
  equity: { es: 'Plusvalía estimada', en: 'Estimated equity' },
  estimate: { es: 'Estimado, no garantizado.', en: 'Estimate, not a guarantee.' },
  share: { es: 'Compartir', en: 'Share' },
  shareAll: { es: 'Compartir con un cliente', en: 'Share with a client' },
  shareTitle: { es: 'Compartir con un cliente', en: 'Share with a client' },
  shareHint: {
    es: 'Su cliente verá estos precios y le escribirá a usted por WhatsApp.',
    en: 'Your client sees these prices and messages you on WhatsApp.',
  },
  shareText: { es: 'Le comparto estas opciones en Texas, con precio especial:', en: 'Sharing these Texas options with special pricing:' },
  shareSubject: { es: 'Opciones en Texas · {brand}', en: 'Texas options · {brand}' },
  email: { es: 'Correo', en: 'Email' },
  copy: { es: 'Copiar enlace', en: 'Copy link' },
  copied: { es: 'Enlace copiado', en: 'Link copied' },
  more: { es: 'Más opciones', en: 'More options' },
  close: { es: 'Cerrar', en: 'Close' },
  preparing: { es: 'Preparando enlace...', en: 'Preparing link...' },
  shareFail: { es: 'No se pudo crear el enlace. Intente de nuevo.', en: "Couldn't create the link. Try again." },
  footerShare: {
    es: 'Precios en dólares (USD), sujetos a disponibilidad y a firma de contrato. Desarrolla: FEREST Development, Texas.',
    en: 'Prices in US dollars (USD), subject to availability and a signed contract. Developer: FEREST Development, Texas.',
  },
  homeTile: { es: 'Casa llave en mano', en: 'Turnkey home' },
  homeTileSub: { es: 'Nosotros la construimos. Usted recibe las llaves.', en: 'We build it. You get the keys.' },
  lotTile: { es: 'Solo el lote', en: 'Just the lot' },
  lotTileSub: { es: 'Terreno listo para construir.', en: 'Land ready to build on.' },
  from: { es: 'Desde {price}', en: 'From {price}' },
  back: { es: 'Atrás', en: 'Back' },
  choosePlan: { es: 'Elija su modelo', en: 'Choose your plan' },
  chooseLot: { es: 'Elija su lote', en: 'Choose your lot' },
  whichLot: { es: '¿En qué lote?', en: 'Which lot?' },
  lot: { es: 'Lote {n}', en: 'Lot {n}' },
  rowLot: { es: 'Lote', en: 'Lot' },
  rowHouse: { es: 'Casa', en: 'House' },
  yours: { es: 'Su precio', en: 'Your price' },
  list: { es: 'Precio de lista', en: 'List price' },
  save: { es: 'Su ahorro', en: 'You save' },
  pending: { es: 'Por confirmar', en: 'To be confirmed' },
  bedBath: { es: '{b} recámaras · {ba} baños', en: '{b} bed · {ba} bath' },
  prelim: { es: 'Preliminar', en: 'Preliminary' },
  prelimNote: {
    es: 'Incluye datos preliminares, sujetos a confirmación por escrito de FEREST.',
    en: 'Includes preliminary figures, subject to written confirmation by FEREST.',
  },
  usd: { es: 'Precios en dólares (USD).', en: 'Prices in US dollars (USD).' },
  cta: { es: 'Me interesa', en: "I'm interested" },
  ctaSub: { es: 'Se abre WhatsApp con {name}', en: 'Opens WhatsApp with {name}' },
  itemHome: { es: '{home}, {lot}', en: '{home}, {lot}' },
  waMsg: {
    es: 'Hola {name}, me interesa: {project} · {item}. Precio (USD): {price}.',
    en: "Hi {name}, I'm interested in: {project} · {item}. Price (USD): {price}.",
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
