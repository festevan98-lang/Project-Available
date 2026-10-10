import { cookies, headers } from 'next/headers';
import type { Investor, Lang } from '@/lib/portal/types';
import { LANG_COOKIE, isLang } from './i18n';

/** Visitor's toggle choice first, then a ?lang= link, then the investor's default, then the browser language. */
export async function resolveLang(investor?: Investor | null, param?: string | string[]): Promise<Lang> {
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(chosen)) return chosen;
  if (isLang(param)) return param;
  if (investor?.lang) return investor.lang;
  return /^es\b/i.test((await headers()).get('accept-language') ?? '') ? 'es' : 'en';
}
