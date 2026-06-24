'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

interface Transaction {
  id: string; type: string; amount: number; currency: string; fee: number; status: string; referenceNo: string; createdAt: string; completedAt: string | null
}

const TYPE_ICONS: Record<string, string> = { DEPOSIT: '💰', WITHDRAWAL: '🏦', TRADE_BUY: '🟢', TRADE_SELL: '🔴' }
const STATUS_COLORS: Record<string, string> = { PENDING: 'text-yellow-600 bg-yellow-50', PROCESSING: 'text-blue-600 bg-blue-50', COMPLETED: 'text-green-600 bg-green-50', FAILED: 'text-red-600 bg-red-50' }

export default function TransactionsPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (isAuthenticated) fetchTransactions()
  }, [isAuthenticated, isLoading, page, typeFilter, statusFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/transactions?${params}`)
      const data = await res.json()
      setTransactions(data.transactions || [])
      setTotal(data.total || 0)
    } catch {} finally { setLoading(false) }
  }

  if (isLoading || loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-gray-500 mb-8">{t('subtitle')}</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="">{t('filter.all')} {t('filter.type')}</option>
          <option value="DEPOSIT">{t('filter.DEPOSIT')}</option>
          <option value="WITHDRAWAL">{t('filter.WITHDRAWAL')}</option>
          <option value="TRADE_BUY">{t('filter.TRADE_BUY')}</option>
          <option value="TRADE_SELL">{t('filter.TRADE_SELL')}</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="">{t('filter.all')} {t('filter.status')}</option>
          <option value="PENDING">{t('filter.PENDING')}</option>
          <option value="PROCESSING">{t('filter.PROCESSING')}</option>
          <option value="COMPLETED">{t('filter.COMPLETED')}</option>
          <option value="FAILED">{t('filter.FAILED')}</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400 mb-2">{t('empty')}</p>
          <button onClick={() => router.push(`/${locale}/marketplace`)} className="text-blue-600 hover:underline text-sm">{t('empty.hint')}</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('filter.type')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('amount')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('fee')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('filter.status')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('ref')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
              </tr></thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><span>{TYPE_ICONS[txn.type] || '📋'}</span><span className="text-sm font-medium">{t(`type.${txn.type}`)}</span></div></td>
                    <td className="px-6 py-4"><span className={`font-mono text-sm ${txn.type === 'DEPOSIT' || txn.type === 'TRADE_BUY' ? 'text-green-600' : 'text-red-600'}`}>{txn.type === 'DEPOSIT' || txn.type === 'TRADE_BUY' ? '+' : '-'}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> <span className="text-gray-500 text-xs">{txn.currency}</span></td>
                    <td className="px-6 py-4"><span className="font-mono text-sm text-gray-500">{txn.fee > 0 ? txn.fee.toFixed(2) : '-'}</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[txn.status] || ''}`}>{t(`status.${txn.status}`)}</span></td>
                    <td className="px-6 py-4"><span className="font-mono text-xs text-gray-500">{txn.referenceNo}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 15 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <span className="text-sm text-gray-500">{t('pagination.page', { page: String(page), total: String(total) })}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">{t('pagination.prev')}</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page * 15 >= total} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">{t('pagination.next')}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
