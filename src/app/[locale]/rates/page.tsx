'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

interface Rate {
  from: string; to: string; rate: number
}

const FALLBACK_RATES: Rate[] = [
  { from: 'CNY', to: 'HKD', rate: 1.08 },
  { from: 'CNY', to: 'USD', rate: 0.138 },
  { from: 'CNY', to: 'EUR', rate: 0.127 },
  { from: 'CNY', to: 'JPY', rate: 20.85 },
  { from: 'CNY', to: 'GBP', rate: 0.109 },
  { from: 'HKD', to: 'CNY', rate: 0.926 },
  { from: 'HKD', to: 'USD', rate: 0.128 },
  { from: 'USD', to: 'CNY', rate: 7.25 },
  { from: 'USD', to: 'HKD', rate: 7.82 },
  { from: 'EUR', to: 'CNY', rate: 7.87 },
  { from: 'EUR', to: 'HKD', rate: 8.51 },
  { from: 'GBP', to: 'CNY', rate: 9.15 },
]

function getFee(from: string, to: string): string {
  if (from === 'CNY' && to === 'HKD') return '0.5%'
  if (from === 'HKD' && to === 'CNY') return '0.5%'
  if (from === 'USD' && to === 'HKD') return '0.5%'
  if (from === 'HKD' && to === 'USD') return '0.6%'
  return '0.8%'
}

export default function RatesPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const [rates, setRates] = useState<Rate[]>(FALLBACK_RATES)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rates')
      .then((res) => res.json())
      .then((data) => {
        if (data.rates && data.rates.length > 0) {
          setRates(data.rates as Rate[])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = rates.filter((r) =>
    !filter || r.from.includes(filter.toUpperCase()) || r.to.includes(filter.toUpperCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('nav.rates')}</h1>
          <p className="text-gray-600">
            {loading ? t('loading') : `${rates.length} currency pairs available`}
          </p>
        </div>
        <Link href={`/${locale}/create-order`}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          {t('btn.submit')}
        </Link>
      </div>

      <div className="mb-6">
        <input type="text" placeholder="Filter currency..." value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Currency Pair</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Rate</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Fee</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <span className="font-medium">{r.from}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="font-medium">{r.to}</span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-lg">{r.rate}</td>
                <td className="px-6 py-4 text-right text-gray-500">{getFee(r.from, r.to)}</td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/${locale}/create-order`} className="text-blue-600 hover:underline text-sm font-medium">
                    {t('nav.createOrder')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Exchange rates are indicative and updated regularly. Actual rates may vary at time of transaction.
      </p>
    </div>
  )
}
