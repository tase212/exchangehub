'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

interface Wallet {
  id: string; currency: string; balance: number; frozenBalance: number
}
interface Order {
  id: string; sellCurrency: string; sellAmount: number; buyCurrency: string; buyAmount: number
  rate: number; status: string; method: string; createdAt: string; completedAt: string | null
  seller?: { id: string }; buyer?: { id: string }
}

const CURRENCY_FLAGS: Record<string, string> = {
  CNY: '🇨🇳', HKD: '🇭🇰', USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧', SGD: '🇸🇬', TWD: '🇹🇼', THB: '🇹🇭', KRW: '🇰🇷',
}
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-green-600 bg-green-50', MATCHED: 'text-blue-600 bg-blue-50',
  COMPLETED: 'text-gray-600 bg-gray-100', CANCELLED: 'text-red-600 bg-red-50',
}
const DEPOSIT_CURRENCIES = ['CNY', 'HKD', 'USD', 'EUR', 'JPY', 'GBP']

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositCurrency, setDepositCurrency] = useState('CNY')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [depositMsg, setDepositMsg] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, isLoading])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [walletRes, orderRes] = await Promise.all([
        fetch('/api/wallets'),
        fetch('/api/orders?my=true'),
      ])
      const walletData = await walletRes.json()
      const orderData = await orderRes.json()
      setWallets(walletData.wallets || [])
      setOrders(orderData.orders || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return
    setDepositing(true); setDepositMsg('')
    try {
      const res = await fetch('/api/wallets/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: depositCurrency, amount: parseFloat(depositAmount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDepositMsg(t('deposit.success')); setDepositAmount(''); fetchData()
      setTimeout(() => { setShowDeposit(false); setDepositMsg('') }, 1500)
    } catch (err: any) { setDepositMsg(err.message) } finally { setDepositing(false) }
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">{t('stats.total')}</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">{t('stats.completed')}</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{orders.filter((o) => o.status === 'COMPLETED').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">{t('stats.active')}</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{orders.filter((o) => o.status === 'OPEN' || o.status === 'MATCHED').length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('wallet.title')}</h2>
            <button onClick={() => setShowDeposit(!showDeposit)} className="text-blue-600 hover:underline text-sm font-medium">
              {t('wallet.deposit')}
            </button>
          </div>
          {showDeposit && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <select value={depositCurrency} onChange={(e) => setDepositCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  {DEPOSIT_CURRENCIES.map((c) => <option key={c} value={c}>{CURRENCY_FLAGS[c]} {c}</option>)}
                </select>
                <input type="number" placeholder={t('deposit.amount')} min="0" value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <button onClick={handleDeposit} disabled={depositing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {depositing ? '...' : t('deposit.confirm')}
                </button>
              </div>
              {depositMsg && <p className={`text-sm mt-2 ${depositMsg === t('deposit.success') ? 'text-green-600' : 'text-red-600'}`}>{depositMsg}</p>}
            </div>
          )}
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
          <h2 className="text-xl font-semibold mb-4">{t('transactions.title')}</h2>
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
