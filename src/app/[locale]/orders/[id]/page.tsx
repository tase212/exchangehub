'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'
import Link from 'next/link'

interface Order {
  id: string; sellCurrency: string; sellAmount: number; buyCurrency: string; buyAmount: number
  rate: number; status: string; method: string; location: string | null; note: string | null
  createdAt: string; completedAt: string | null
  seller: { id: string; username: string; kycStatus: string }
  buyer: { id: string; username: string; kycStatus: string } | null
}

const METHOD_KEYS: Record<string, string> = {
  ONLINE_CARD: 'method.online_card', OFFLINE_CASH: 'method.offline_cash',
  QR_PAY: 'method.qr_pay', BANK_TRANSFER: 'method.bank_transfer',
}

const STATUS_CLASSES: Record<string, string> = {
  OPEN: 'text-green-600 bg-green-50', MATCHED: 'text-blue-600 bg-blue-50',
  COMPLETED: 'text-gray-600 bg-gray-100', CANCELLED: 'text-red-600 bg-red-50',
}

export default function OrderDetailPage() {
  const params = useParams()
  const { t, locale } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchOrder() }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      const data = await res.json()
      if (res.ok) setOrder(data.order)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleAccept = async () => {
    if (!isAuthenticated) { setError(t('msg.loginRequired')); return }
    setAccepting(true); setError('')
    try {
      const res = await fetch(`/api/orders/${params.id}/accept`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('error.generic'))
      fetchOrder()
    } catch (err: any) { setError(err.message) } finally { setAccepting(false) }
  }

  const handleConfirm = async () => {
    setConfirming(true); setError('')
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('error.generic'))
      fetchOrder()
    } catch (err: any) { setError(err.message) } finally { setConfirming(false) }
  }

  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (res.ok) fetchOrder()
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="max-w-lg mx-auto py-20 text-center text-gray-500">{t('loading')}</div>
  if (!order) return (
    <div className="max-w-lg mx-auto py-20 text-center">
      <p className="text-gray-500 mb-4">{t('detail.notFound')}</p>
      <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:underline">{t('detail.backToMarket')}</Link>
    </div>
  )

  const isSeller = user?.id === order.seller.id
  const isBuyer = user?.id === order.buyer?.id
  const canAccept = order.status === 'OPEN' && isAuthenticated && !isSeller
  const canConfirm = order.status === 'MATCHED' && isSeller

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← {t('detail.backToMarket')}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{t('detail.title')}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CLASSES[order.status] || ''}`}>
              {t(`status.${order.status.toLowerCase()}`)}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl font-bold">
                <span className="text-red-500">{t('detail.sell')}</span>{' '}
                {order.sellAmount.toLocaleString()} {order.sellCurrency}
              </div>
              <div className="text-gray-400 text-2xl">→</div>
              <div className="text-2xl font-bold">
                <span className="text-green-500">{t('detail.buy')}</span>{' '}
                {order.buyAmount.toLocaleString()} {order.buyCurrency}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {t('detail.rate')}: 1 {order.sellCurrency} = {order.rate} {order.buyCurrency}
            </div>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <Row label={t('detail.method')} value={t(METHOD_KEYS[order.method] || order.method)} />
            <Row label={t('detail.seller')} value={order.seller.username} />
            {order.buyer && <Row label={t('detail.buyer')} value={order.buyer.username} />}
            {order.location && <Row label={t('detail.location')} value={order.location} />}
            {order.note && <Row label={t('detail.note')} value={order.note} />}
            <Row label={t('detail.created')} value={new Date(order.createdAt).toLocaleString('zh-CN')} />
            {order.completedAt && <Row label={t('detail.completed')} value={new Date(order.completedAt).toLocaleString('zh-CN')} />}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

          {order.status === 'MATCHED' && !isSeller && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-center mb-4">
              ⏳ 等待卖家确认收款
            </div>
          )}

          {order.status === 'MATCHED' && isSeller && (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-center mb-4">
              请确认已收到买家款项后点击完成
            </div>
          )}

          {order.status === 'COMPLETED' && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center mb-4">✅ {t('detail.completedBanner')}</div>
          )}

          {canAccept && (
            <button onClick={handleAccept} disabled={accepting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {accepting ? t('detail.accepting') : t('detail.accept')}
            </button>
          )}

          {canConfirm && (
            <button onClick={handleConfirm} disabled={confirming}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
              {confirming ? t('detail.accepting') : '确认收款，完成交易'}
            </button>
          )}

          {isSeller && order.status === 'OPEN' && (
            <button onClick={handleCancel}
              className="w-full bg-white border-2 border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition mt-3">
              {t('detail.cancel')}
            </button>
          )}

          {!isAuthenticated && order.status === 'OPEN' && (
            <Link href={`/${locale}/login`}
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 text-center transition">
              {t('detail.loginToAccept')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  )
}
