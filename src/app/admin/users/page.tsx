'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string; username: string; email: string; phone: string | null; kycStatus: string; createdAt: string
  _count: { sellOrders: number; buyOrders: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { fetchData() }, [page, search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch {} finally { setLoading(false) }
  }

  const viewUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`)
    const data = await res.json()
    setSelected(data.user)
  }

  const KYC_COLORS: Record<string, string> = { PENDING: 'bg-yellow-50 text-yellow-600', SUBMITTED: 'bg-blue-50 text-blue-600', APPROVED: 'bg-green-50 text-green-600', REJECTED: 'bg-red-50 text-red-600' }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <div className="mb-6">
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="搜索用户名或邮箱..." className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <th className="px-6 py-3">用户</th><th className="px-6 py-3">KYC</th><th className="px-6 py-3">交易数</th><th className="px-6 py-3">注册时间</th><th className="px-6 py-3">操作</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">加载中...</td></tr>
            : users.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">暂无数据</td></tr>
            : users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-6 py-4"><div className="font-medium text-sm">{u.username}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${KYC_COLORS[u.kycStatus] || ''}`}>{u.kycStatus}</span></td>
                <td className="px-6 py-4 text-sm">{u._count.sellOrders + u._count.buyOrders}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4"><button onClick={() => viewUser(u.id)} className="text-blue-600 hover:underline text-sm">详情</button></td>
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

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selected.username}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-gray-500">邮箱：</span>{selected.email}</div>
              <div><span className="text-gray-500">手机：</span>{selected.phone || '未设置'}</div>
              <div><span className="text-gray-500">KYC：</span><span className={`px-2 py-0.5 rounded-full text-xs ${KYC_COLORS[selected.kycStatus] || ''}`}>{selected.kycStatus}</span></div>
              <div><span className="text-gray-500">注册：</span>{new Date(selected.createdAt).toLocaleDateString()}</div>
            </div>
            {selected.wallets?.length > 0 && (
              <div className="mb-6"><h3 className="font-semibold mb-2">钱包</h3>
                <div className="space-y-2">{selected.wallets.map((w: any) => (
                  <div key={w.currency} className="flex justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <span className="font-medium">{w.currency}</span><span className="font-mono">{w.balance.toLocaleString()}</span>
                  </div>
                ))}</div>
              </div>
            )}
            {selected.sellOrders?.length > 0 && (
              <div><h3 className="font-semibold mb-2">最近交易</h3>
                <div className="space-y-2">{selected.sellOrders.map((o: any) => (
                  <div key={o.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2 text-sm">
                    <span className="font-mono">{o.sellAmount} {o.sellCurrency} → {o.buyAmount} {o.buyCurrency}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${o.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                  </div>
                ))}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
