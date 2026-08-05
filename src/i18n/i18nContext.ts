import { createContext, useContext } from "react"
import type { Locale } from "./translations"

export interface I18nValue {
  locale: Locale
  setLocale(l: Locale): void
  t(s: string): string
}

export const I18nContext = createContext<I18nValue>({
  locale: "en",
  setLocale: () => {},
  t: (s) => s,
})

export function useI18n(): I18nValue {
  return useContext(I18nContext)
}
