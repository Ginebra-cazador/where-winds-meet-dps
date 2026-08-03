export type Locale = "en"

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  en: {},
}

export function translate(s: string, locale: Locale): string {
  return DICTIONARIES[locale]?.[s] ?? s
}
