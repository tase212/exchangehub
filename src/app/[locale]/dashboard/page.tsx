'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

interface Wallet { id: string; currency: string; balance: number; frozenBalance: number }
interface Order { id: string; sellCurrency: string; sellAmount: number; buyCurrency: string; buyAmount: number; rate: number; status: string; method: string; createdAt: string; completedAt: string | null; seller?: { id: string }; buyer?: { id: string } }

const CURRENCY_FLAGS: Record<string, string> = { CNY: '🇨🇳', HKD: '🇭🇰', USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧', SGD: '🇸🇬', TWD: '🇹🇼', THB: '🇹🇭', KRW: '🇰🇷' }
const STATUS_COLORS: Record<string, string> = { OPEN: 'text-green-600 bg-green-50', MATCHED: 'text-blue-600 bg-blue-50', COMPLETED: 'text-gray-600 bg-gray-100', CANCELLED: 'text-red-600 bg-red-50' }

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [kycStatus, setKycStatus] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, isLoading])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [walletRes, orderRes, kycRes] = await Promise.all([
        fetch('/api/wallets'), fetch('/api/orders?my=true'), fetch('/api/kyc'),
      ])
      const walletData = await walletRes.json()
      const orderData = await orderRes.json()
      const kycData = await kycRes.json()
      setWallets(walletData.wallets || [])
      setOrders(orderData.orders || [])
      setKycStatus(kycData.kycStatus || 'PENDING')
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {kycStatus !== 'APPROVED' && (
        <Link href={`/${locale}/kyc`} className={`block rounded-xl p-4 mb-6 transition hover:shadow-md ${kycStatus === 'REJECTED' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{kycStatus === 'REJECTED' ? '❌' : '🔒'}</span>
            <div>
              <p className={`font-medium text-sm ${kycStatus === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'}`}>
                {kycStatus === 'REJECTED' ? '身份认证未通过，请重新提交' : '请完成身份认证以使用全部功能'}
              </p>
              <p className={`text-xs mt-0.5 ${kycStatus === 'REJECTED' ? 'text-red-500' : 'text-yellow-600'}`}>点击前往认证</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('welcome', { username: user?.username || '' })}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/create-order`}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            {t('postOrder')}
          </Link>
          <button onClick={logout}
            className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 text-white">
          <p className="text-blue-100 text-sm">总资产</p>
          <p className="text-2xl font-bold mt-1 font-mono">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">{t('stats.total')}</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">{t('stats.completed')}</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{orders.filter((o) => o.status === 'COMPLETED').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">{t('stats.active')}</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{orders.filter((o) => o.status === 'OPEN' || o.status === 'MATCHED').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href={`/${locale}/deposit`} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-lg">💰</span></div>
          <div><p className="font-medium text-sm">{t('nav.deposit')}</p><p className="text-xs text-gray-500">充值到账户</p></div>
        </Link>
        <Link href={`/${locale}/withdraw`} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><span className="text-lg">🏦</span></div>
          <div><p className="font-medium text-sm">{t('nav.withdraw')}</p><p className="text-xs text-gray-500">提现到银行卡</p></div>
        </Link>
        <Link href={`/${locale}/marketplace`} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-lg">💱</span></div>
          <div><p className="font-medium text-sm">{t('nav.marketplace')}</p><p className="text-xs text-gray-500">浏览交易</p></div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('wallet.title')}</h2>
            <Link href={`/${locale}/deposit`} className="text-blue-600 hover:underline text-sm font-medium">
              {t('wallet.deposit')}
            </Link>
          </div>
          {loading ? <div className="text-center py-8 text-gray-400">{t('loading')}</div>
          : wallets.length === 0 ? <div className="text-center py-8 text-gray-400">{t('wallet.empty')}</div>
          : <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CURRENCY_FLAGS[w.currency] || '💰'}</span>
                    <div>
                      <div className="font-medium">{w.currency}</div>
                      {w.frozenBalance > 0 && <div className="text-xs text-orange-500">{t('wallet.frozen', { amount: String(w.frozenBalance) })}</div>}
                    </div>
                  </div>
                  <div className="text-lg font-mono font-semibold">
                    {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('transactions.title')}</h2>
            <Link href={`/${locale}/transactions`} className="text-blue-600 hover:underline text-sm font-medium">查看全部</Link>
          </div>
          {loading ? <div className="text-center py-8 text-gray-400">{t('loading')}</div>
          : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">{t('transactions.empty')}</p>
                <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:underline text-sm">{t('transactions.browse')}</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((o) => (
                  <Link key={o.id} href={`/${locale}/orders/${o.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <div className="font-medium text-sm">{o.sellAmount} {o.sellCurrency} → {o.buyAmount} {o.buyCurrency}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>
                      {t(`status.${o.status.toLowerCase()}`)}
                    </span>
                  </Link>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
