'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { t, locale } = useTranslation()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${locale}`} className="text-xl font-bold text-blue-600">
            {t('app.name')}
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href={`/${locale}/marketplace`} className="text-gray-600 hover:text-blue-600 transition text-sm">
              {t('nav.marketplace')}
            </Link>
            <Link href={`/${locale}/shops`} className="text-gray-600 hover:text-blue-600 transition text-sm">
              {t('nav.shops')}
            </Link>
            <Link href={`/${locale}/rates`} className="text-gray-600 hover:text-blue-600 transition text-sm">
              {t('nav.rates')}
            </Link>

            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <Link href={`/${locale}/create-order`}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  {t('nav.createOrder')}
                </Link>
                <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-blue-600 transition text-sm">
                  {user?.username}
                </Link>
                <Link href={`/${locale}/dashboard`} className="text-gray-600 hover:text-blue-600 transition text-sm">
                  {t('nav.dashboard')}
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className="text-gray-600 hover:text-blue-600 transition text-sm">
                  {t('nav.login')}
                </Link>
                <Link href={`/${locale}/register`}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button className="p-2" onClick={() => setIsOpen(!isOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href={`/${locale}/marketplace`} className="block py-2 text-gray-600 hover:text-blue-600">{t('nav.marketplace')}</Link>
            <Link href={`/${locale}/shops`} className="block py-2 text-gray-600 hover:text-blue-600">{t('nav.shops')}</Link>
            <Link href={`/${locale}/rates`} className="block py-2 text-gray-600 hover:text-blue-600">{t('nav.rates')}</Link>
            {isAuthenticated ? (
              <>
                <Link href={`/${locale}/create-order`} className="block py-2 text-blue-600 font-medium">{t('nav.createOrder')}</Link>
                <Link href={`/${locale}/dashboard`} className="block py-2 text-gray-600">{t('nav.dashboard')} ({user?.username})</Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className="block py-2 text-gray-600">{t('nav.login')}</Link>
                <Link href={`/${locale}/register`} className="block py-2 text-blue-600 font-semibold">{t('nav.signup')}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
