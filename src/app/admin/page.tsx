'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardData {
  stats: { totalUsers: number; totalOrders: number; pendingKyc: number; totalCommission: number; pendingCommission: number }
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      setData(await res.json())
    } catch {} finally { setLoading(false) }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">加载中...</div>
  if (!data) return null

  const stats = [
    { label: '总用户数', value: data.stats.totalUsers, icon: '👥', color: 'blue' },
    { label: '已完成交易', value: data.stats.totalOrders, icon: '✅', color: 'green' },
    { label: '待审核KYC', value: data.stats.pendingKyc, icon: '🔍', color: 'yellow' },
    { label: '累计佣金', value: `$${data.stats.totalCommission.toFixed(2)}`, icon: '💰', color: 'purple' },
    { label: '待结算佣金', value: `$${data.stats.pendingCommission.toFixed(2)}`, icon: '⏳', color: 'orange' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近交易</h2>
          <Link href="/admin/commissions" className="text-blue-600 hover:underline text-sm">查看全部佣金</Link>
        </div>
        <table className="w-full">
          <thead><tr className="border-b text-left text-xs text-gray-500 uppercase">
            <th className="pb-3">卖家</th><th className="pb-3">卖出</th><th className="pb-3">买入</th><th className="pb-3">状态</th><th className="pb-3">时间</th>
          </tr></thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o.id} className="border-b last:border-b-0">
                <td className="py-3 text-sm">{o.seller?.username}</td>
                <td className="py-3 text-sm font-mono">{o.sellAmount} {o.sellCurrency}</td>
                <td className="py-3 text-sm font-mono">{o.buyAmount} {o.buyCurrency}</td>
                <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : o.status === 'OPEN' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{o.status}</span></td>
                <td className="py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
