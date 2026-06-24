'use client'

import { useState, useEffect } from 'react'

interface Withdrawal {
  id: string; amount: number; currency: string; bankName: string; accountLast4: string; accountHolder: string; status: string; createdAt: string
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [available, setAvailable] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: '', currency: 'USD', bankName: '', accountLast4: '', accountHolder: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/withdrawals')
      const data = await res.json()
      setWithdrawals(data.withdrawals || [])
      setAvailable(data.availableBalance || 0)
    } catch {} finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowForm(false)
      setForm({ amount: '', currency: 'USD', bankName: '', accountLast4: '', accountHolder: '' })
      fetchData()
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-600', PROCESSING: 'bg-blue-50 text-blue-600',
    COMPLETED: 'bg-green-50 text-green-600', FAILED: 'bg-red-50 text-red-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">提现管理</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">可提现余额</p>
            <p className="text-3xl font-bold text-green-600">${available.toFixed(2)}</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError('') }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            申请提现
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">金额</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg" min="0" step="0.01" /></div>
            <div><label className="block text-sm font-medium mb-1">币种</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white"><option>USD</option><option>CNY</option><option>EUR</option><option>GBP</option><option>HKD</option></select></div>
            <div><label className="block text-sm font-medium mb-1">银行名称</label><input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">账户尾号</label><input value={form.accountLast4} onChange={(e) => setForm({ ...form, accountLast4: e.target.value })} className="w-full px-4 py-2 border rounded-lg" maxLength={4} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">账户持有人</label><input value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50">取消</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{submitting ? '提交中...' : '确认提现'}</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <th className="px-6 py-3">金额</th><th className="px-6 py-3">银行</th><th className="px-6 py-3">账户</th><th className="px-6 py-3">状态</th><th className="px-6 py-3">时间</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">加载中...</td></tr>
            : withdrawals.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">暂无提现记录</td></tr>
            : withdrawals.map((w) => (
              <tr key={w.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-semibold">{w.amount.toFixed(2)} {w.currency}</td>
                <td className="px-6 py-4 text-sm">{w.bankName}</td>
                <td className="px-6 py-4 text-sm">•••• {w.accountLast4}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[w.status] || ''}`}>{w.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
