'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Locale, DEFAULT_LOCALE, isLocale } from './config'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale?: string
}) {
  const resolvedLocale = initialLocale && isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE
  const [locale, setLocaleState] = useState<Locale>(resolvedLocale)
  const [messages, setMessages] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    if (locale) {
      loadMessages(locale)
    }
  }, [locale])

  const loadMessages = async (l: Locale) => {
    try {
      const modules = [
        () => import(`./locales/${l}/common.json`),
        () => import(`./locales/${l}/home.json`),
        () => import(`./locales/${l}/auth.json`),
        () => import(`./locales/${l}/marketplace.json`),
        () => import(`./locales/${l}/dashboard.json`),
        () => import(`./locales/${l}/orders.json`),
      ]

      const results = await Promise.all(modules.map((m) => m()))
      const merged: Record<string, string> = {}
      for (const mod of results) {
        Object.assign(merged, mod.default || mod)
      }
      setMessages((prev) => ({ ...prev, [l]: merged }))
    } catch (err) {
      console.error(`Failed to load messages for ${l}:`, err)
    }
  }

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const text = messages[locale]?.[key] || key
      if (!params) return text
      return text.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? `{{${k}}}`)
    },
    [locale, messages]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}
