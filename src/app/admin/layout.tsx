'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/kyc', label: 'KYC审核', icon: '🔍' },
  { href: '/admin/users', label: '用户管理', icon: '👥' },
  { href: '/admin/commissions', label: '佣金管理', icon: '💰' },
  { href: '/admin/withdrawals', label: '提现管理', icon: '🏦' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') { setLoading(false); return }
    fetchAdmin()
  }, [pathname])

  const fetchAdmin = async () => {
    try {
      const res = await fetch('/api/admin/auth/me')
      if (!res.ok) { router.push('/admin/login'); return }
      const data = await res.json()
      setAdmin(data.admin)
    } catch { router.push('/admin/login') } finally { setLoading(false) }
  }

  const handleLogout = async () => {
    document.cookie = 'exchangehub_admin_token=; max-age=0; path=/'
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  if (!admin) return null

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-lg">ExchangeHub</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />}
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition ${pathname === item.href ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          {sidebarOpen && <p className="text-xs text-gray-500 mb-2">{admin.email}</p>}
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white w-full text-left">
            {sidebarOpen ? '退出登录' : '🚪'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
