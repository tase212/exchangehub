'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

interface Shop {
  id: string; name: string; address: string; city: string; country: string
  phone: string; currencies: string; rating: number; reviewCount: number
}

export default function ShopsPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)

  const searchShops = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)
      if (country) params.append('country', country)
      const res = await fetch(`/api/shops?${params}`)
      const data = await res.json()
      setShops(data.shops || [])
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('nav.shops')}</h1>
        <p className="text-gray-600">{t('app.tagline')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input type="text" placeholder="Hong Kong, Shanghai..." value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input type="text" placeholder="China, Japan..." value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex items-end">
            <button onClick={searchShops} disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? t('loading') : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {shops.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-xl"><p className="text-gray-500">Enter city or country to search</p></div>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{shop.name}</h3>
                  <p className="text-gray-600 mt-1">{shop.address}</p>
                  <p className="text-gray-500 text-sm mt-1">{shop.city}, {shop.country}</p>
                  {shop.phone && <p className="text-gray-500 text-sm mt-1">📞 {shop.phone}</p>}
                  <div className="flex gap-2 mt-3">
                    {shop.currencies.split(',').map((c: string) => (
                      <span key={c} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{c.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-500">{'★'.repeat(Math.round(shop.rating))}</div>
                  <p className="text-sm text-gray-500">{shop.rating.toFixed(1)} ({shop.reviewCount} reviews)</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
