'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'
import Link from 'next/link'
import { ChatPanel } from '@/components/ChatPanel'

interface Order {
  id: string; sellCurrency: string; sellAmount: number; buyCurrency: string; buyAmount: number
  rate: number; status: string; method: string; location: string | null; note: string | null
  paymentProof: string | null; paymentNote: string | null; paidAt: string | null
  createdAt: string; completedAt: string | null
  seller: { id: string; username: string; kycStatus: string }
  buyer: { id: string; username: string; kycStatus: string } | null
}

const STATUS_FLOW = ['OPEN', 'ACCEPTED', 'PAID', 'COMPLETED']
const STATUS_LABELS: Record<string, string> = { OPEN: '挂单中', ACCEPTED: '已匹配', PAID: '已付款', COMPLETED: '已完成', CANCELLED: '已取消' }
const STATUS_COLORS: Record<string, string> = { OPEN: 'text-green-600 bg-green-50', ACCEPTED: 'text-blue-600 bg-blue-50', PAID: 'text-purple-600 bg-purple-50', COMPLETED: 'text-gray-600 bg-gray-100', CANCELLED: 'text-red-600 bg-red-50' }

export default function OrderDetailPage() {
  const params = useParams()
  const { t, locale } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proofImage, setProofImage] = useState<string | null>(null)
  const [paymentNote, setPaymentNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchOrder() }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      const data = await res.json()
      if (res.ok) setOrder(data.order)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleAccept = async () => {
    if (!isAuthenticated) { setError('请先登录'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/orders/${params.id}/accept`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchOrder()
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  const handlePay = async () => {
    if (!proofImage) { setError('请上传付款凭证'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/orders/${params.id}/pay`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProof: proofImage, paymentNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchOrder()
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  const handleComplete = async () => {
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchOrder()
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  const handleCancel = async () => {
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchOrder()
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('图片大小不能超过5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setProofImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  if (loading) return <div className="max-w-2xl mx-auto py-20 text-center text-gray-500">加载中...</div>
  if (!order) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <p className="text-gray-500 mb-4">订单不存在</p>
      <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:underline">返回市场</Link>
    </div>
  )

  const isSeller = user?.id === order.seller.id
  const isBuyer = user?.id === order.buyer?.id
  const statusIdx = STATUS_FLOW.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">← 返回市场</Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">交易详情</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || ''}`}>{STATUS_LABELS[order.status] || order.status}</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= statusIdx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                <span className={`ml-2 text-xs hidden sm:inline ${i <= statusIdx ? 'text-gray-800' : 'text-gray-400'}`}>{STATUS_LABELS[s]}</span>
                {i < STATUS_FLOW.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < statusIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Amount */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-2xl font-bold"><span className="text-red-500">卖出</span> {order.sellAmount.toLocaleString()} {order.sellCurrency}</div>
              <div className="text-gray-400 text-2xl">→</div>
              <div className="text-2xl font-bold"><span className="text-green-500">买入</span> {order.buyAmount.toLocaleString()} {order.buyCurrency}</div>
            </div>
            <div className="text-sm text-gray-500">汇率: 1 {order.sellCurrency} = {order.rate} {order.buyCurrency}</div>
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm mb-6">
            <InfoRow label="支付方式" value={order.method} />
            <InfoRow label="卖家" value={order.seller.username} />
            {order.buyer && <InfoRow label="买家" value={order.buyer.username} />}
            {order.location && <InfoRow label="地点" value={order.location} />}
            {order.note && <InfoRow label="备注" value={order.note} />}
            <InfoRow label="创建时间" value={new Date(order.createdAt).toLocaleString('zh-CN')} />
            {order.completedAt && <InfoRow label="完成时间" value={new Date(order.completedAt).toLocaleString('zh-CN')} />}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

          {/* OPEN: Buyer can accept */}
          {order.status === 'OPEN' && !isSeller && isAuthenticated && (
            <button onClick={handleAccept} disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? '处理中...' : '接受交易'}
            </button>
          )}

          {/* ACCEPTED: Buyer pays + uploads proof */}
          {order.status === 'ACCEPTED' && isBuyer && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2">💳 付款指引</h3>
                <p className="text-sm text-blue-700">请通过以下方式向卖家付款 <strong>{order.buyAmount.toLocaleString()} {order.buyCurrency}</strong></p>
                <p className="text-xs text-blue-600 mt-2">付款完成后，请上传凭证并点击"已付款"</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">付款凭证（截图）</label>
                <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition flex flex-col items-center justify-center">
                  {proofImage ? <img src={proofImage} className="max-h-full object-contain rounded-lg" alt="Proof" /> : (
                    <>
                      <svg className="w-10 h-10 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-sm text-gray-500">点击上传付款截图</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">付款备注（选填）</label>
                <input value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="如：转账尾号1234" className="w-full px-4 py-2 border rounded-lg text-sm" />
              </div>
              <button onClick={handlePay} disabled={submitting || !proofImage}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition">
                {submitting ? '提交中...' : '确认已付款'}
              </button>
              <button onClick={handleCancel} disabled={submitting} className="w-full border border-red-300 text-red-600 py-2 rounded-lg text-sm hover:bg-red-50 transition">取消交易</button>
            </div>
          )}

          {/* ACCEPTED: Seller sees waiting */}
          {order.status === 'ACCEPTED' && isSeller && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl text-center">⏳ 等待买家付款确认</div>
          )}

          {/* PAID: Seller reviews proof */}
          {order.status === 'PAID' && isSeller && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 mb-2">📋 买家已付款，请确认</h3>
                {order.paymentNote && <p className="text-sm text-purple-700 mb-2">付款备注: {order.paymentNote}</p>}
                {order.paidAt && <p className="text-xs text-purple-600">付款时间: {new Date(order.paidAt).toLocaleString('zh-CN')}</p>}
              </div>
              {order.paymentProof && (
                <div>
                  <label className="block text-sm font-medium mb-1">付款凭证</label>
                  <img src={order.paymentProof} className="w-full max-h-64 object-contain rounded-lg border" alt="Payment Proof" />
                </div>
              )}
              <button onClick={handleComplete} disabled={submitting}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                {submitting ? '处理中...' : '确认收款，完成交易'}
              </button>
            </div>
          )}

          {/* PAID: Buyer sees waiting */}
          {order.status === 'PAID' && isBuyer && (
            <div className="bg-purple-50 border border-purple-200 text-purple-700 p-4 rounded-xl text-center">⏳ 等待卖家确认收款</div>
          )}

          {/* COMPLETED */}
          {order.status === 'COMPLETED' && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center">✅ 交易已完成</div>
          )}

          {/* CANCELLED */}
          {order.status === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">❌ 交易已取消</div>
          )}

          {/* Cancel button for seller on OPEN */}
          {isSeller && order.status === 'OPEN' && (
            <button onClick={handleCancel} disabled={submitting}
              className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition mt-3">
              取消挂单
            </button>
          )}

          {!isAuthenticated && order.status === 'OPEN' && (
            <Link href={`/${locale}/login`} className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition">
              登录后接受交易
            </Link>
          )}
        </div>

        {/* Chat */}
        {isAuthenticated && (isSeller || isBuyer) && order.status !== 'CANCELLED' && (
          <div className="mt-6">
            <ChatPanel orderId={order.id} currentUserId={user!.id} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  )
}
