'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

const RATES: Record<string, number> = {
  'CNY-HKD': 1.08,
  'CNY-USD': 0.138,
  'CNY-EUR': 0.127,
  'HKD-CNY': 0.926,
  'HKD-USD': 0.128,
  'USD-CNY': 7.25,
  'USD-HKD': 7.82,
  'EUR-CNY': 7.87,
}

const FEES: Record<string, number> = {
  'CNY-HKD': 0.005,
  'CNY-USD': 0.008,
  'CNY-EUR': 0.008,
  'HKD-CNY': 0.005,
  'HKD-USD': 0.006,
  'USD-CNY': 0.008,
  'USD-HKD': 0.005,
  'EUR-CNY': 0.008,
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const [fromCurrency, setFromCurrency] = useState('CNY')
  const [toCurrency, setToCurrency] = useState('HKD')
  const [amount, setAmount] = useState('1000')

  const rateKey = `${fromCurrency}-${toCurrency}`
  const rate = RATES[rateKey] || 0
  const fee = FEES[rateKey] || 0.008
  const numAmount = parseFloat(amount) || 0
  const feeAmount = numAmount * fee
  const receiveAmount = (numAmount - feeAmount) * rate
  const bankReceive = numAmount * rate * 0.96
  const saving = receiveAmount - bankReceive

  const swap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight whitespace-pre-line">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/register`}
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
              >
                {t('hero.getStarted')}
              </Link>
              <Link
                href={`/${locale}/marketplace`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition text-center"
              >
                {t('hero.browseRates')}
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-2xl">
            <h3 className="text-sm font-medium text-gray-500 mb-4">{t('converter.title')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('converter.youSend')}</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-3">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-transparent font-medium text-lg outline-none cursor-pointer"
                  >
                    {['CNY', 'HKD', 'USD', 'EUR', 'JPY', 'GBP'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-right text-xl font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={swap}
                  className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition"
                >
                  ⇅
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('converter.recipientGets')}</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <span className="font-medium text-lg">{toCurrency}</span>
                  <span className="flex-1 text-right text-xl font-mono">
                    {receiveAmount > 0 ? receiveAmount.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{t('converter.arrives')}</span>
                <span className="text-gray-900">{t('converter.instant')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{t('converter.totalFees')}</span>
                <span className="text-gray-900">{feeAmount.toFixed(2)} {fromCurrency}</span>
              </div>
              {saving > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{t('converter.youSave')}</span>
                  <span>~{saving.toFixed(2)} {toCurrency}</span>
                </div>
              )}
            </div>

            <Link
              href={`/${locale}/create-order`}
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center mt-6 hover:bg-blue-700 transition"
            >
              {t('converter.sendMoney')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('compare.title')}</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">{t('compare.subtitle')}</p>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">{t('compare.provider')}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">{t('compare.recipientGets')}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">{t('compare.fee')}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">{t('compare.totalCost')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 font-semibold text-blue-600">{t('compare.exchangehub')}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold">{receiveAmount.toFixed(2)} {toCurrency}</td>
                  <td className="px-6 py-4 text-right font-mono">{feeAmount.toFixed(2)} {fromCurrency}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-green-600">{t('compare.lowest')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">{t('compare.bank')}</td>
                  <td className="px-6 py-4 text-right font-mono">{bankReceive.toFixed(2)} {toCurrency}</td>
                  <td className="px-6 py-4 text-right font-mono">~3%</td>
                  <td className="px-6 py-4 text-right font-mono text-red-500">~5%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">{t('compare.paypal')}</td>
                  <td className="px-6 py-4 text-right font-mono">{(numAmount * rate * 0.93).toFixed(2)} {toCurrency}</td>
                  <td className="px-6 py-4 text-right font-mono">~4%</td>
                  <td className="px-6 py-4 text-right font-mono text-red-500">~7%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">{t('compare.western')}</td>
                  <td className="px-6 py-4 text-right font-mono">{(numAmount * rate * 0.94).toFixed(2)} {toCurrency}</td>
                  <td className="px-6 py-4 text-right font-mono">~2%</td>
                  <td className="px-6 py-4 text-right font-mono text-red-500">~6%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

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
          <h2 className="text-3xl font-bold text-center mb-12">{t('methods.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-3">{t('methods.virtual.title')}</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.virtual.1')}</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.virtual.2')}</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.virtual.3')}</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="text-3xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold mb-3">{t('methods.shop.title')}</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.shop.1')}</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.shop.2')}</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.shop.3')}</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">{t('methods.digital.title')}</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.digital.1')}</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.digital.2')}</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {t('methods.digital.3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('testimonials.title')}</h2>
          <p className="text-gray-500 text-center mb-12">{t('testimonials.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4">&ldquo;{t('testimonial.1.text')}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">L</div>
                <div>
                  <div className="font-medium text-sm">{t('testimonial.1.author')}</div>
                  <div className="text-xs text-gray-400">{t('testimonial.1.location')}</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4">&ldquo;{t('testimonial.2.text')}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">C</div>
                <div>
                  <div className="font-medium text-sm">{t('testimonial.2.author')}</div>
                  <div className="text-xs text-gray-400">{t('testimonial.2.location')}</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4">&ldquo;{t('testimonial.3.text')}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">W</div>
                <div>
                  <div className="font-medium text-sm">{t('testimonial.3.author')}</div>
                  <div className="text-xs text-gray-400">{t('testimonial.3.location')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl text-blue-100 mb-8">{t('cta.subtitle')}</p>
          <Link
            href={`/${locale}/register`}
            className="bg-white text-blue-700 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition inline-block"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-lg mb-4">{t('app.name')}</div>
              <p className="text-sm">{t('app.tagline')}</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/marketplace`} className="hover:text-white transition">{t('nav.marketplace')}</Link></li>
                <li><Link href={`/${locale}/shops`} className="hover:text-white transition">{t('nav.shops')}</Link></li>
                <li><Link href={`/${locale}/rates`} className="hover:text-white transition">{t('nav.rates')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/register`} className="hover:text-white transition">{t('nav.signup')}</Link></li>
                <li><Link href={`/${locale}/login`} className="hover:text-white transition">{t('nav.login')}</Link></li>
                <li><Link href={`/${locale}/dashboard`} className="hover:text-white transition">{t('nav.dashboard')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>24/7 Customer Support</li>
                <li>Security & Compliance</li>
                <li>API Documentation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{t('footer.rights', { year: '2024' })}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
