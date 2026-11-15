'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { L, Lang } from '@/content';

const Ctx = createContext<{ lang: Lang; toggle: () => void }>({ lang: 'en', toggle: () => {} });

/** Language starts from the route (/en, /id). Toggling swaps it in place (no navigation, scroll is kept)
 *  and rewrites the URL so a reload or a shared link keeps the language. */
export function LangProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial);
  const toggle = () => {
    const next: Lang = lang === 'en' ? 'id' : 'en';
    setLang(next);
    document.documentElement.lang = next;
    const { pathname, search, hash } = window.location;
    history.replaceState(null, '', pathname.replace(/^\/(en|id)(?=\/|$)/, `/${next}`) + search + hash);
  };
  return <Ctx.Provider value={{ lang, toggle }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** const t = useT(); t(ui.nav.skip) */
export function useT() {
  const { lang } = useLang();
  return (s: L) => s[lang];
}
