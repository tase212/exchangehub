'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

const CURRENCIES = [
  { code: 'CNY', name: 'CNY', flag: '🇨🇳' },
  { code: 'HKD', name: 'HKD', flag: '🇭🇰' },
  { code: 'USD', name: 'USD', flag: '🇺🇸' },
  { code: 'EUR', name: 'EUR', flag: '🇪🇺' },
  { code: 'JPY', name: 'JPY', flag: '🇯🇵' },
  { code: 'GBP', name: 'GBP', flag: '🇬🇧' },
  { code: 'SGD', name: 'SGD', flag: '🇸🇬' },
  { code: 'TWD', name: 'TWD', flag: '🇹🇼' },
  { code: 'THB', name: 'THB', flag: '🇹🇭' },
  { code: 'KRW', name: 'KRW', flag: '🇰🇷' },
]

const METHODS = [
  { value: 'ONLINE_CARD', key: 'create.method.onlineCard', descKey: 'create.method.onlineCard.desc' },
  { value: 'OFFLINE_CASH', key: 'create.method.offlineCash', descKey: 'create.method.offlineCash.desc' },
  { value: 'QR_PAY', key: 'create.method.qrPay', descKey: 'create.method.qrPay.desc' },
  { value: 'BANK_TRANSFER', key: 'create.method.bankTransfer', descKey: 'create.method.bankTransfer.desc' },
]

const RATES: Record<string, number> = {
  'CNY-HKD': 1.08, 'CNY-USD': 0.138, 'CNY-EUR': 0.127, 'CNY-JPY': 20.85, 'CNY-GBP': 0.109,
  'HKD-CNY': 0.926, 'HKD-USD': 0.128, 'USD-CNY': 7.25, 'USD-HKD': 7.82, 'EUR-CNY': 7.87,
  'EUR-HKD': 8.51, 'GBP-CNY': 9.15, 'SGD-CNY': 5.41, 'JPY-CNY': 0.048, 'KRW-CNY': 0.0053,
  'TWD-CNY': 0.23, 'THB-CNY': 0.20,
}

export default function CreateOrderPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()

  const [sellCurrency, setSellCurrency] = useState(searchParams.get('sell') || 'CNY')
  const [sellAmount, setSellAmount] = useState(searchParams.get('amount') || '')
  const [buyCurrency, setBuyCurrency] = useState(searchParams.get('buy') || 'HKD')
  const [method, setMethod] = useState('OFFLINE_CASH')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const rateKey = `${sellCurrency}-${buyCurrency}`
  const rate = RATES[rateKey] || 0
  const sellNum = parseFloat(sellAmount) || 0
  const buyAmount = sellNum * rate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isAuthenticated) { setError(t('create.loginRequired')); return }
    if (sellCurrency === buyCurrency) { setError(t('create.error.sameCurrency')); return }
    if (sellNum <= 0) { setError(t('create.error.invalidAmount')); return }
    if (rate === 0) { setError(t('create.error.noRate')); return }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellCurrency, sellAmount: sellNum, buyCurrency,
          buyAmount: Math.round(buyAmount * 100) / 100, method,
          location: location || undefined, note: note || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('error.generic'))
      router.push(`/${locale}/marketplace`)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('create.title')}</h1>
          <p className="text-gray-600 mt-2">{t('create.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('create.sell')}</label>
              <div className="flex gap-2">
                <select value={sellCurrency} onChange={(e) => setSellCurrency(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white font-medium">
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input type="number" placeholder="0.00" required min="0" step="0.01" value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-right text-xl font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">↓</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('create.buy')}</label>
              <div className="flex gap-2">
                <select value={buyCurrency} onChange={(e) => setBuyCurrency(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white font-medium">
                  {CURRENCIES.filter((c) => c.code !== sellCurrency).map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <div className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-right text-xl font-mono bg-gray-100 text-gray-600">
                  {buyAmount > 0 ? buyAmount.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
            {rate > 0 && (
              <div className="text-sm text-gray-500 text-right">
                {t('create.rate', { from: sellCurrency, rate: String(rate), to: buyCurrency })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('create.method')}</label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                  className={`p-3 rounded-lg border-2 text-left transition ${method === m.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-medium text-sm">{t(m.key)}</div>
                  <div className="text-xs text-gray-500 mt-1">{t(m.descKey)}</div>
                </button>
              ))}
            </div>
          </div>

          {(method === 'OFFLINE_CASH' || method === 'QR_PAY') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.location')}</label>
              <input type="text" placeholder={t('create.location.placeholder')} value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.note')}</label>
            <textarea placeholder={t('create.note.placeholder')} value={note}
              onChange={(e) => setNote(e.target.value)} rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <button type="submit" disabled={loading || !isAuthenticated}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? t('create.submitting') : !isAuthenticated ? t('create.loginRequired') : t('create.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
