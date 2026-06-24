'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { NotificationBell } from '@/components/NotificationBell'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, isAuthenticated } = useAuth()
  const { t, locale } = useTranslation()

  useEffect(() => { if (isAuthenticated) fetchNotifications() }, [isAuthenticated])
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?unread=true')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
    setUnreadCount(0); setNotifications([])
  }

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
                <NotificationBell locale={locale} />
                <div className="relative">
                  <button onClick={() => setWalletOpen(!walletOpen)} className="text-gray-600 hover:text-blue-600 transition text-sm font-medium flex items-center gap-1">
                    💰 {t('nav.wallet')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {walletOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <Link href={`/${locale}/deposit`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600">{t('nav.deposit')}</Link>
                      <Link href={`/${locale}/withdraw`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600">{t('nav.withdraw')}</Link>
                      <Link href={`/${locale}/transactions`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600">{t('nav.transactions')}</Link>
                      <Link href={`/${locale}/payment-methods`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600">{t('nav.paymentMethods')}</Link>
                      <Link href={`/${locale}/kyc`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600">{t('nav.kyc')}</Link>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onClick={() => { setNotifOpen(!notifOpen); if (unreadCount > 0) markAllRead() }}
                    className="text-gray-600 hover:text-blue-600 transition text-sm relative">
                    🔔
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                      <p className="px-4 py-2 text-sm font-semibold border-b">通知</p>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-400 text-center">暂无通知</p>
                      ) : notifications.map((n) => (
                        <Link key={n.id} href={n.link || '#'} onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-400 px-2 py-1">{t('nav.wallet')}</p>
                  <Link href={`/${locale}/deposit`} className="block py-2 pl-4 text-gray-600 hover:text-blue-600">{t('nav.deposit')}</Link>
                  <Link href={`/${locale}/withdraw`} className="block py-2 pl-4 text-gray-600 hover:text-blue-600">{t('nav.withdraw')}</Link>
                  <Link href={`/${locale}/transactions`} className="block py-2 pl-4 text-gray-600 hover:text-blue-600">{t('nav.transactions')}</Link>
                  <Link href={`/${locale}/payment-methods`} className="block py-2 pl-4 text-gray-600 hover:text-blue-600">{t('nav.paymentMethods')}</Link>
                  <Link href={`/${locale}/kyc`} className="block py-2 pl-4 text-gray-600 hover:text-blue-600">{t('nav.kyc')}</Link>
                </div>
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
