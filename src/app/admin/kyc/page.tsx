'use client'

import { useState, useEffect } from 'react'

interface KycSubmission {
  id: string; idType: string; status: string; createdAt: string
  user: { id: string; username: string; email: string }
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchData() }, [page, statusFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/kyc?${params}`)
      const data = await res.json()
      setSubmissions(data.submissions || [])
      setTotal(data.total || 0)
    } catch {} finally { setLoading(false) }
  }

  const viewSubmission = async (id: string) => {
    const res = await fetch(`/api/admin/kyc/${id}`)
    const data = await res.json()
    setSelected(data.submission)
    setRejectReason('')
  }

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selected) return
    setActionLoading(true)
    try {
      await fetch(`/api/admin/kyc/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectReason }),
      })
      setSelected(null)
      fetchData()
    } catch {} finally { setActionLoading(false) }
  }

  const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: 'bg-yellow-50 text-yellow-600', UNDER_REVIEW: 'bg-blue-50 text-blue-600',
    APPROVED: 'bg-green-50 text-green-600', REJECTED: 'bg-red-50 text-red-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">KYC 审核</h1>

      <div className="flex gap-2 mb-6">
        {['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {s || '全部'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase">
            <th className="px-6 py-3">用户</th><th className="px-6 py-3">证件类型</th><th className="px-6 py-3">状态</th><th className="px-6 py-3">提交时间</th><th className="px-6 py-3">操作</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">加载中...</td></tr>
            : submissions.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">暂无数据</td></tr>
            : submissions.map((s) => (
              <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-6 py-4"><div className="font-medium text-sm">{s.user.username}</div><div className="text-xs text-gray-500">{s.user.email}</div></td>
                <td className="px-6 py-4 text-sm">{s.idType}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || ''}`}>{s.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4"><button onClick={() => viewSubmission(s.id)} className="text-blue-600 hover:underline text-sm">审核</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {total > 15 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span className="text-sm text-gray-500">共 {total} 条</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">上一页</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 15 >= total} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">下一页</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">审核 - {selected.user.username}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className="text-xs text-gray-500 mb-1">证件正面</p><img src={selected.idFrontImage} className="w-full h-40 object-cover rounded-lg border" alt="ID Front" /></div>
              <div><p className="text-xs text-gray-500 mb-1">自拍照</p><img src={selected.selfieImage} className="w-full h-40 object-cover rounded-lg border" alt="Selfie" /></div>
              {selected.idBackImage && <div><p className="text-xs text-gray-500 mb-1">证件背面</p><img src={selected.idBackImage} className="w-full h-40 object-cover rounded-lg border" alt="ID Back" /></div>}
              <div><p className="text-xs text-gray-500 mb-1">证件类型</p><p className="text-sm font-medium mt-1">{selected.idType}</p></div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">拒绝原因（仅拒绝时填写）</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="请输入拒绝原因..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction('REJECTED')} disabled={actionLoading} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">拒绝</button>
              <button onClick={() => handleAction('APPROVED')} disabled={actionLoading} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">通过</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
