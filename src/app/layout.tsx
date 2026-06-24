import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ExchangeHub - Global Currency Exchange',
    template: '%s | ExchangeHub',
  },
  description: 'Send money without borders. Exchange global currencies at the best rates. No hidden fees, instant transfers.',
  keywords: ['currency exchange', 'money transfer', 'forex', 'remittance', 'exchange rates'],
  authors: [{ name: 'ExchangeHub' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://exchangehub.vercel.app',
    siteName: 'ExchangeHub',
    title: 'ExchangeHub - Global Currency Exchange',
    description: 'Send money without borders. Best exchange rates, no hidden fees.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExchangeHub - Global Currency Exchange',
    description: 'Send money without borders. Best exchange rates, no hidden fees.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
