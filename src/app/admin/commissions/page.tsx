'use client'

import { useState, useEffect } from 'react'

interface Commission {
  id: string; orderAmount: number; rate: number; amount: number; currency: string; status: string; createdAt: string
  order: { id: string; sellCurrency: string; sellAmount: number; buyCurrency: string; buyAmount: number } | null
}

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [summary, setSummary] = useState({ totalEarned: 0, totalSettled: 0, pendingAmount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [page, statusFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/commissions?${params}`)
      const data = await res.json()
      setCommissions(data.commissions || [])
      setTotal(data.total || 0)
      setSummary(data.summary || { totalEarned: 0, totalSettled: 0, pendingAmount: 0 })
    } catch {} finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">佣金管理</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5"><p className="text-xs text-gray-500">累计佣金</p><p className="text-2xl font-bold text-green-600">${summary.totalEarned.toFixed(2)}</p></div>
        <div className="bg-white rounded-xl shadow-sm p-5"><p className="text-xs text-gray-500">已结算</p><p className="text-2xl font-bold">${summary.totalSettled} 笔</p></div>
        <div className="bg-white rounded-xl shadow-sm p-5"><p className="text-xs text-gray-500">待结算</p><p className="text-2xl font-bold text-orange-600">${summary.pendingAmount.toFixed(2)}</p></div>
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'PENDING', 'SETTLED'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {s || '全部'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <th className="px-6 py-3">订单金额</th><th className="px-6 py-3">佣金率</th><th className="px-6 py-3">佣金</th><th className="px-6 py-3">状态</th><th className="px-6 py-3">时间</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">加载中...</td></tr>
            : commissions.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">暂无数据</td></tr>
            : commissions.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono">{c.orderAmount} {c.currency}</td>
                <td className="px-6 py-4 text-sm">{(c.rate * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm font-mono font-semibold text-green-600">{c.amount.toFixed(2)} {c.currency}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'SETTLED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{c.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">共 {total} 条</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">上一页</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
