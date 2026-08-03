import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { translate, type Locale } from "./translations"
import { kvStore } from "../kvStore"

interface I18nValue {
  locale: Locale
  setLocale(l: Locale): void
  t(s: string): string
}

const STORAGE_KEY = "wwm.locale"

const Ctx = createContext<I18nValue>({
  locale: "en",
  setLocale: () => {},
  t: (s) => s,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = kvStore.get(STORAGE_KEY)
    return saved === "en" ? saved : "en"
  })
  useEffect(() => {
    kvStore.set(STORAGE_KEY, locale)
  }, [locale])
  const value: I18nValue = {
    locale,
    setLocale: setLocaleState,
    t: (s) => translate(s, locale),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18nValue {
  return useContext(Ctx)
}

export function T({ children }: { children: string }) {
  const { t } = useI18n()
  return <>{t(children)}</>
}
