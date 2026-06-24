'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

export default function ProfilePage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (user) {
      setUsername(user.username)
      fetchProfile()
    }
  }, [isAuthenticated, isLoading])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile')
      const data = await res.json()
      if (res.ok && data.user) {
        setPhone(data.user.phone || '')
      }
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const body: any = {}
      if (username !== user?.username) body.username = username
      if (phone) body.phone = phone
      if (newPassword) {
        body.currentPassword = currentPassword
        body.newPassword = newPassword
      }
      if (Object.keys(body).length === 0) {
        setError('没有要更新的字段')
        return
      }
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '更新失败')
      setMessage('更新成功')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">个人设置</h1>
        <p className="text-gray-500 mt-2">管理你的账户信息和安全设置</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">{message}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email" disabled
            value={user?.email || ''}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">邮箱不可修改</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            type="text" required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            type="tel"
            placeholder="+86 13800138000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="font-medium text-gray-700 mb-3">修改密码</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                type="password" minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
          <Link
            href={`/${locale}/dashboard`}
            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            返回
          </Link>
        </div>
      </form>
    </div>
  )
}
