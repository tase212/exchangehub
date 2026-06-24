'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

const RATES: Record<string, number> = {
  'CNY-HKD': 1.08, 'CNY-USD': 0.138, 'CNY-EUR': 0.127, 'CNY-JPY': 20.85, 'CNY-GBP': 0.109,
  'HKD-CNY': 0.926, 'HKD-USD': 0.128, 'HKD-EUR': 0.117,
  'USD-CNY': 7.25, 'USD-HKD': 7.82, 'USD-EUR': 0.92, 'USD-JPY': 149.5, 'USD-GBP': 0.79,
  'EUR-CNY': 7.87, 'EUR-HKD': 8.51, 'EUR-USD': 1.09,
}
const FEES: Record<string, number> = { 'CNY-HKD': 0.005, 'CNY-USD': 0.008, 'CNY-EUR': 0.008, 'CNY-JPY': 0.008, 'CNY-GBP': 0.008, 'HKD-CNY': 0.005, 'HKD-USD': 0.006, 'HKD-EUR': 0.008, 'USD-CNY': 0.008, 'USD-HKD': 0.005, 'USD-EUR': 0.005, 'USD-JPY': 0.006, 'USD-GBP': 0.008, 'EUR-CNY': 0.008, 'EUR-HKD': 0.008, 'EUR-USD': 0.005, }
const CURRENCIES = ['CNY', 'HKD', 'USD', 'EUR', 'JPY', 'GBP']
const FLAGS: Record<string, string> = { CNY: '🇨🇳', HKD: '🇭🇰', USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧' }

export default function HomePage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const [fromCurrency, setFromCurrency] = useState('HKD')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('1000')

  const rateKey = `${fromCurrency}-${toCurrency}`
  const rate = RATES[rateKey] || 0
  const feeRate = FEES[rateKey] || 0.008
  const numAmount = parseFloat(amount) || 0
  const feeAmount = numAmount * feeRate
  const receiveAmount = (numAmount - feeAmount) * rate
  const bankReceive = numAmount * rate * 0.95

  const swap = () => {
    const tmp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(tmp)
  }

  const tradeLink = `/${locale}/create-order?sell=${fromCurrency}&buy=${toCurrency}&amount=${encodeURIComponent(amount)}`

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-white pt-8 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero title */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Converter Card */}
          <div className="max-w-[480px] mx-auto">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
              {/* From */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">You send exactly</label>
                <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-3 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition">
                  <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-transparent text-lg font-semibold outline-none cursor-pointer min-w-[90px]">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
                  </select>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-right text-2xl font-bold font-mono outline-none min-w-0" />
                </div>
                {numAmount > 25000 && <p className="text-xs text-green-600 mt-1">Large transfer? We&apos;ll discount our fee</p>}
              </div>

              {/* Swap */}
              <div className="flex justify-center -my-3 relative z-10">
                <button onClick={swap}
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition text-xl">
                  ⇅
                </button>
              </div>

              {/* To */}
              <div className="mt-3 mb-6">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Recipient gets</label>
                <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}
                    className="bg-transparent text-lg font-semibold outline-none cursor-pointer min-w-[90px]">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
                  </select>
                  <span className="flex-1 text-right text-2xl font-bold font-mono text-green-700">
                    {rate > 0 ? receiveAmount.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Rate & Fee Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span className="font-mono">{rate > 0 ? `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}` : '—'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Fee</span>
                  <span className="font-mono">{(feeRate * 100).toFixed(1)}% ({feeAmount.toFixed(2)} {fromCurrency})</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Arrives</span>
                  <span>By tomorrow</span>
                </div>
              </div>

              {/* CTA */}
              <Link href={tradeLink}
                className="block w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-center text-lg hover:bg-blue-700 transition shadow-lg">
                Get started
              </Link>
              <p className="text-center text-xs text-gray-400 mt-3">
                {numAmount > 0 && rate > 0 ? (
                  <>Banks charge ~{(numAmount * rate * 0.05).toFixed(2)} {toCurrency} more. <span className="text-green-600 font-medium">You save ~{(numAmount * rate * 0.05 - feeAmount * rate).toFixed(2)} {toCurrency}</span></>
                ) : 'Enter amount to see savings'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('compare.title')}</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            {rate > 0 && numAmount > 0 ? `Sending ${numAmount.toLocaleString()} ${fromCurrency} to ${toCurrency}` : t('compare.subtitle')}
          </p>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Provider</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Recipient gets</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Fee</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-green-50">
                  <td className="px-6 py-4 font-semibold text-green-700">ExchangeHub ✓</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-green-700">{receiveAmount.toFixed(2)} {toCurrency}</td>
                  <td className="px-6 py-4 text-right font-mono text-green-700">{feeAmount.toFixed(2)} {fromCurrency}</td>
                  <td className="px-6 py-4 text-right text-xs text-green-700">Quick</td>
                </tr>
                {[
                  { name: 'Bank Transfer', receive: bankReceive, fee: '~5%', speed: '2-5 days' },
                  { name: 'PayPal', receive: numAmount * rate * 0.93, fee: '~7%', speed: '1-3 days' },
                  { name: 'Western Union', receive: numAmount * rate * 0.94, fee: '~6%', speed: '1-2 days' },
                ].map((p) => (
                  <tr key={p.name}>
                    <td className="px-6 py-4 text-gray-500">{p.name}</td>
                    <td className="px-6 py-4 text-right font-mono text-gray-500">{typeof p.receive === 'number' ? p.receive.toFixed(2) : '—'} {toCurrency}</td>
                    <td className="px-6 py-4 text-right font-mono text-red-500">{p.fee}</td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400">{p.speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><div className="text-3xl mb-2">🏦</div><p className="text-sm font-medium">Regulated Platform</p></div>
          <div><div className="text-3xl mb-2">🛡️</div><p className="text-sm font-medium">Escrow Protected</p></div>
          <div><div className="text-3xl mb-2">⚡</div><p className="text-sm font-medium">Fast Settlement</p></div>
          <div><div className="text-3xl mb-2">💬</div><p className="text-sm font-medium">24/7 Support</p></div>
        </div>
      </section>

      {/* Why & Testimonials - abbreviated */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('why.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">⚡</div>
              <h3 className="text-xl font-semibold mb-3">{t('why.speed.title')}</h3>
              <p className="text-gray-500">{t('why.speed.desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🔒</div>
              <h3 className="text-xl font-semibold mb-3">{t('why.security.title')}</h3>
              <p className="text-gray-500">{t('why.security.desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🌐</div>
              <h3 className="text-xl font-semibold mb-3">{t('why.global.title')}</h3>
              <p className="text-gray-500">{t('why.global.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('testimonials.title')}</h2>
          <p className="text-gray-500 text-center mb-12">{t('testimonials.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl">
                <div className="text-yellow-400 mb-3">★★★★★</div>
                <p className="text-gray-600 mb-4">&ldquo;{t(`testimonial.${i}.text`)}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{t(`testimonial.${i}.author`)[0]}</div>
                  <div>
                    <div className="font-medium text-sm">{t(`testimonial.${i}.author`)}</div>
                    <div className="text-xs text-gray-400">{t(`testimonial.${i}.location`)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-lg text-blue-100 mb-8">{t('cta.subtitle')}</p>
          <Link href={`/${locale}/register`}
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition inline-block">
            {t('cta.button')}
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-white font-bold text-lg mb-4">{t('app.name')}</div>
            <p className="text-sm">{t('app.tagline')}</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/marketplace`} className="hover:text-white transition">Marketplace</Link></li>
              <li><Link href={`/${locale}/shops`} className="hover:text-white transition">Exchange Shops</Link></li>
              <li><Link href={`/${locale}/rates`} className="hover:text-white transition">Live Rates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/register`} className="hover:text-white transition">Sign Up</Link></li>
              <li><Link href={`/${locale}/login`} className="hover:text-white transition">Log In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>24/7 Customer Support</li>
              <li>Security & Compliance</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>{t('footer.rights', { year: '2026' })}</p>
        </div>
      </footer>
    </div>
  )
}
