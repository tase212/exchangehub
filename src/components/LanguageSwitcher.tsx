'use client'

import { useTranslation } from '@/i18n/useTranslation'
import { LOCALE_META, Locale, LOCALES } from '@/i18n/config'
import { useState, useRef, useEffect } from 'react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchLocale = (l: Locale) => {
    setLocale(l)
    setOpen(false)
    const path = window.location.pathname.replace(/^\/(en|zh|zh-HK|ja|ko)/, `/${l}`)
    if (path !== window.location.pathname) {
      window.location.href = path
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
      >
        <span>{LOCALE_META[locale].flag}</span>
        <span>{LOCALE_META[locale].label}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                l === locale ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{LOCALE_META[l].flag}</span>
              <span>{LOCALE_META[l].name}</span>
              {l === locale && <span className="ml-auto text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
