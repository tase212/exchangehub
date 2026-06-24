'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Locale, DEFAULT_LOCALE, isLocale } from './config'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enAuth from './locales/en/auth.json'
import enMarket from './locales/en/marketplace.json'
import enDashboard from './locales/en/dashboard.json'
import enOrders from './locales/en/orders.json'
import enKyc from './locales/en/kyc.json'
import enPm from './locales/en/payment-methods.json'
import enDeposit from './locales/en/deposit.json'
import enWithdraw from './locales/en/withdraw.json'
import enTxn from './locales/en/transactions.json'

import zhCommon from './locales/zh/common.json'
import zhHome from './locales/zh/home.json'
import zhAuth from './locales/zh/auth.json'
import zhMarket from './locales/zh/marketplace.json'
import zhDashboard from './locales/zh/dashboard.json'
import zhOrders from './locales/zh/orders.json'
import zhKyc from './locales/zh/kyc.json'
import zhPm from './locales/zh/payment-methods.json'
import zhDeposit from './locales/zh/deposit.json'
import zhWithdraw from './locales/zh/withdraw.json'
import zhTxn from './locales/zh/transactions.json'

const ALL_MESSAGES: Record<Locale, Record<string, string>> = {
  en: { ...enCommon, ...enHome, ...enAuth, ...enMarket, ...enDashboard, ...enOrders, ...enKyc, ...enPm, ...enDeposit, ...enWithdraw, ...enTxn },
  zh: { ...zhCommon, ...zhHome, ...zhAuth, ...zhMarket, ...zhDashboard, ...zhOrders, ...zhKyc, ...zhPm, ...zhDeposit, ...zhWithdraw, ...zhTxn },
  'zh-HK': { ...zhCommon, ...zhHome, ...zhAuth, ...zhMarket, ...zhDashboard, ...zhOrders, ...zhKyc, ...zhPm, ...zhDeposit, ...zhWithdraw, ...zhTxn },
  ja: { ...enCommon, ...enHome, ...enAuth, ...enMarket, ...enDashboard, ...enOrders, ...enKyc, ...enPm, ...enDeposit, ...enWithdraw, ...enTxn },
  ko: { ...enCommon, ...enHome, ...enAuth, ...enMarket, ...enDashboard, ...enOrders, ...enKyc, ...enPm, ...enDeposit, ...enWithdraw, ...enTxn },
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: string }) {
  const resolvedLocale = initialLocale && isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE
  const [locale, setLocaleState] = useState<Locale>(resolvedLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') localStorage.setItem('locale', newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const text = ALL_MESSAGES[locale]?.[key] || key
      if (!params) return text
      return text.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? `{{${k}}}`)
    },
    [locale]
  )

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useTranslation must be used within I18nProvider')
  return context
}
