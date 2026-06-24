export const LOCALES = ['en', 'zh', 'zh-HK', 'ja', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_META: Record<Locale, { name: string; flag: string; label: string }> = {
  en: { name: 'English', flag: '🇬🇧', label: 'EN' },
  zh: { name: '简体中文', flag: '🇨🇳', label: '中文' },
  'zh-HK': { name: '繁體中文（香港）', flag: '🇭🇰', label: '繁體' },
  ja: { name: '日本語', flag: '🇯🇵', label: '日本語' },
  ko: { name: '한국어', flag: '🇰🇷', label: '한국어' },
}

export const CURRENCY_BY_LOCALE: Record<Locale, string> = {
  en: 'USD',
  zh: 'CNY',
  'zh-HK': 'HKD',
  ja: 'JPY',
  ko: 'KRW',
}

export const DEFAULT_LOCALE: Locale = 'zh'

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}
