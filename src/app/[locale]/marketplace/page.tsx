'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

interface Order {
  id: string
  sellCurrency: string
  sellAmount: number
  buyCurrency: string
  buyAmount: number
  rate: number
  method: string
  seller: { id: string; username: string }
  createdAt: string
}

const CURRENCIES = [
  { code: 'CNY', name: '人民币', flag: '🇨🇳' },
  { code: 'HKD', name: '港币', flag: '🇭🇰' },
  { code: 'USD', name: '美元', flag: '🇺🇸' },
  { code: 'EUR', name: '欧元', flag: '🇪🇺' },
  { code: 'JPY', name: '日元', flag: '🇯🇵' },
  { code: 'GBP', name: '英镑', flag: '🇬🇧' },
  { code: 'SGD', name: '新加坡元', flag: '🇸🇬' },
  { code: 'TWD', name: '新台币', flag: '🇹🇼' },
  { code: 'THB', name: '泰铢', flag: '🇹🇭' },
  { code: 'KRW', name: '韩元', flag: '🇰🇷' },
]

const METHODS = [
  { value: 'ONLINE_CARD', label: '💳', key: 'method.online_card' },
  { value: 'OFFLINE_CASH', label: '🏪', key: 'method.offline_cash' },
  { value: 'QR_PAY', label: '📱', key: 'method.qr_pay' },
  { value: 'BANK_TRANSFER', label: '🏦', key: 'method.bank_transfer' },
]

export default function MarketplacePage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const [sellCurrency, setSellCurrency] = useState('CNY')
  const [buyCurrency, setBuyCurrency] = useState('HKD')
  const [method, setMethod] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [sellCurrency, buyCurrency, method])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sellCurrency, buyCurrency })
      if (method) params.append('method', method)
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <Link href={`/${locale}/create-order`}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          {t('postOrder')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filter.iSell')}</label>
            <select value={sellCurrency} onChange={(e) => setSellCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filter.iBuy')}</label>
            <select value={buyCurrency} onChange={(e) => setBuyCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              {CURRENCIES.filter((c) => c.code !== sellCurrency).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filter.method')}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">{t('filter.allMethods')}</option>
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label} {t(m.key)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">{t('loading')}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 mb-4">{t('noOrders')}</p>
            <Link href={`/${locale}/create-order`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
              {t('postOrderAlt')}
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-2xl font-bold">
                      <span className="text-red-500">{t('card.sell')}</span>{' '}
                      {order.sellAmount} {order.sellCurrency}
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-2xl font-bold">
                      <span className="text-green-500">{t('card.buy')}</span>{' '}
                      {order.buyAmount} {order.buyCurrency}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>{t('card.rate')}: {order.rate}</span>
                    <span>{METHODS.find((m) => m.value === order.method)?.label} {t(METHODS.find((m) => m.value === order.method)?.key || '')}</span>
                    <span>{t('card.seller')}: {order.seller.username}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${locale}/orders/${order.id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-center">
                    {t('card.trade')}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
