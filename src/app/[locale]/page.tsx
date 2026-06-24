'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

const RATES: Record<string, number> = {
  'CNY-HKD': 1.08, 'CNY-USD': 0.138, 'CNY-EUR': 0.127, 'CNY-JPY': 20.85, 'CNY-GBP': 0.109,
  'HKD-CNY': 0.926, 'HKD-USD': 0.128, 'HKD-EUR': 0.117, 'HKD-JPY': 19.1, 'HKD-GBP': 0.101,
  'USD-CNY': 7.25, 'USD-HKD': 7.82, 'USD-EUR': 0.92, 'USD-JPY': 149.5, 'USD-GBP': 0.79,
  'EUR-CNY': 7.87, 'EUR-HKD': 8.51, 'EUR-USD': 1.09, 'EUR-JPY': 162.6, 'EUR-GBP': 0.86,
  'GBP-CNY': 9.15, 'GBP-HKD': 9.91, 'GBP-USD': 1.27, 'GBP-EUR': 1.17, 'GBP-JPY': 189.5,
  'JPY-CNY': 0.048, 'JPY-HKD': 0.052, 'JPY-USD': 0.0067, 'JPY-EUR': 0.0062, 'JPY-GBP': 0.0053,
}
const CURRENCIES = ['CNY', 'HKD', 'USD', 'EUR', 'GBP', 'JPY']
const FLAGS: Record<string, string> = { CNY: '🇨🇳', HKD: '🇭🇰', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵' }

const COUNTRIES: [string, string][] = [
  ['🇺🇸','United States'],['🇬🇧','United Kingdom'],['🇨🇳','China'],['🇭🇰','Hong Kong'],['🇯🇵','Japan'],
  ['🇰🇷','South Korea'],['🇸🇬','Singapore'],['🇦🇺','Australia'],['🇨🇦','Canada'],['🇩🇪','Germany'],
  ['🇫🇷','France'],['🇮🇹','Italy'],['🇪🇸','Spain'],['🇳🇱','Netherlands'],['🇨🇭','Switzerland'],
  ['🇸🇪','Sweden'],['🇳🇴','Norway'],['🇩🇰','Denmark'],['🇫🇮','Finland'],['🇧🇪','Belgium'],
  ['🇦🇹','Austria'],['🇵🇹','Portugal'],['🇮🇪','Ireland'],['🇳🇿','New Zealand'],['🇹🇼','Taiwan'],
  ['🇹🇭','Thailand'],['🇲🇾','Malaysia'],['🇮🇩','Indonesia'],['🇵🇭','Philippines'],['🇻🇳','Vietnam'],
  ['🇮🇳','India'],['🇵🇰','Pakistan'],['🇧🇩','Bangladesh'],['🇱🇰','Sri Lanka'],['🇦🇪','UAE'],
  ['🇸🇦','Saudi Arabia'],['🇮🇱','Israel'],['🇹🇷','Turkey'],['🇧🇷','Brazil'],['🇲🇽','Mexico'],
  ['🇦🇷','Argentina'],['🇨🇱','Chile'],['🇨🇴','Colombia'],['🇵🇪','Peru'],['🇿🇦','South Africa'],
  ['🇳🇬','Nigeria'],['🇰🇪','Kenya'],['🇪🇬','Egypt'],['🇲🇦','Morocco'],['🇬🇭','Ghana'],
  ['🇵🇱','Poland'],['🇨🇿','Czech Republic'],['🇭🇺','Hungary'],['🇷🇴','Romania'],['🇧🇬','Bulgaria'],
  ['🇭🇷','Croatia'],['🇬🇷','Greece'],['🇺🇦','Ukraine'],['🇪🇪','Estonia'],['🇱🇻','Latvia'],
  ['🇱🇹','Lithuania'],['🇸🇰','Slovakia'],
]

export default function HomePage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const [fromCurrency, setFromCurrency] = useState('HKD')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('1000')

  const rateKey = `${fromCurrency}-${toCurrency}`
  const rate = RATES[rateKey] || 0
  const numAmount = parseFloat(amount) || 0
  const feeRate = 0.005
  const feeAmount = Math.max(numAmount * feeRate, fromCurrency === 'HKD' ? 16.22 : 5)
  const receiveAmount = (numAmount - feeAmount) * rate
  const swap = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency) }
  const tradeLink = `/${locale}/create-order?sell=${fromCurrency}&buy=${toCurrency}&amount=${encodeURIComponent(amount)}`

  const competitors = [
    { name: 'Bank', fee: numAmount * 0.03 + 65, recv: numAmount * rate * 0.95, markup: numAmount * 0.03 + 3.27, er: rate * 0.997 },
    { name: 'PayPal', fee: numAmount * 0.04 + 39, recv: numAmount * rate * 0.93, markup: numAmount * 0.04 + 40, er: rate * 0.96 },
    { name: 'Western Union', fee: numAmount * 0.05 + 15, recv: numAmount * rate * 0.94, markup: numAmount * 0.05 + 38, er: rate * 0.97 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1: Hero - light blue-green gradient bg */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f7f4 30%, #f9fafb 60%, #eaf5f0 100%)' }}>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="pt-4">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-[#1a1f36] whitespace-pre-line">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-md">
                {t('hero.subtitle')}
              </p>
              <Link href={`/${locale}/register`}
                className="inline-block bg-[#163300] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#0f2400] transition shadow-md">
                {t('hero.getStarted')}
              </Link>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('converter.youSend')}</label>
                <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:border-[#00b9ff] transition">
                  <span className="text-lg mr-1">{FLAGS[fromCurrency]}</span>
                  <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="bg-transparent font-semibold text-lg outline-none cursor-pointer">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 text-right text-2xl font-bold font-mono outline-none min-w-0" />
                </div>
                {numAmount > 25000 && <p className="text-xs text-green-600 mt-1">{t('converter.largeHint')}</p>}
              </div>
              <div className="relative my-2">
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={swap} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  </button>
                </div>
                <div className="border-t border-gray-100 my-4" />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('converter.recipientGets')}</label>
                <div className="flex items-center border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <span className="text-lg mr-1">{FLAGS[toCurrency]}</span>
                  <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="bg-transparent font-semibold text-lg outline-none cursor-pointer">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="flex-1 text-right text-2xl font-bold font-mono text-green-700">{rate > 0 ? receiveAmount.toFixed(2) : '0.00'}</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-gray-100 pt-4 mb-6 text-sm">
                <div className="flex justify-between"><span className="flex items-center gap-1"><span className="text-green-500 text-xs">✓</span> {t('converter.arrives')}</span><span className="font-medium">{t('converter.arrives')}</span></div>
                <div className="flex justify-between"><span className="flex items-center gap-1"><span className="text-green-500 text-xs">✓</span> {t('converter.totalFees')}</span><span className="font-medium">{feeAmount.toFixed(2)} {fromCurrency}</span></div>
                <div className="flex justify-between"><span className="flex items-center gap-1"><span className="text-green-500 text-xs">✓</span> {t('converter.youSave')}</span><span className="font-bold text-green-600">{((numAmount * rate * 0.05 - feeAmount * rate)).toFixed(2)} {toCurrency}</span></div>
              </div>
              <Link href={tradeLink} className="block w-full bg-[#00b9ff] text-white py-3.5 rounded-full font-bold text-center hover:bg-[#00a5e5] transition">{t('converter.sendMoney')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Trust Bar */}
      <section className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div><div className="text-2xl mb-2">💵</div><p className="text-sm font-semibold text-gray-800">{t('trust.title1')}</p><p className="text-xs text-gray-500">{t('trust.desc1')}</p></div>
          <div><div className="text-2xl mb-2">🛡️</div><p className="text-sm font-semibold text-gray-800">{t('trust.title2')}</p><p className="text-xs text-gray-500">{t('trust.desc2')}</p></div>
          <div><div className="text-2xl mb-2">💬</div><p className="text-sm font-semibold text-gray-800">{t('trust.title3')}</p><p className="text-xs text-gray-500">{t('trust.desc3')}</p></div>
        </div>
      </section>

      {/* SECTION 3: Comparison */}
      <section className="py-16 md:py-24 px-4 bg-[#f5f7fa]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-[#1a1f36]">{t('compare.title')}</h2>
          <p className="text-gray-500 text-center mb-8 max-w-2xl mx-auto text-sm">{t('compare.subtitle')}</p>
          <div className="flex items-center justify-center gap-10 mb-8">
            <Link href={tradeLink} className="bg-[#163300] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0f2400] transition">{t('compare.cta1')}</Link>
            <Link href={`/${locale}/rates`} className="text-blue-600 hover:underline font-semibold text-sm">{t('compare.cta2')} →</Link>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-[#d4edda] border-2 border-green-500 rounded-2xl p-5 relative">
              <div className="text-xs font-bold text-green-700 uppercase mb-2">{t('compare.bestValue')}</div>
              <div className="text-lg font-bold mb-3">ExchangeHub</div>
              <div className="text-2xl font-bold mb-1">{receiveAmount.toFixed(2)} {toCurrency}</div>
              <div className="text-xs text-gray-500 mb-4">{t('compare.recipientGets')}</div>
              <div className="space-y-2 border-t pt-3 text-xs">
                <div className="flex justify-between"><span>{t('compare.transferFee')}</span><span className="font-mono">{feeAmount.toFixed(2)} {fromCurrency}</span></div>
                <div className="flex justify-between"><span>{t('compare.exchangeRate')}</span><span className="font-mono">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span></div>
                <div className="flex justify-between text-green-700 font-medium"><span>{t('compare.markup')}</span><span>0 {fromCurrency}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold"><span>{t('compare.cost')}</span><span>{feeAmount.toFixed(2)} {fromCurrency}</span></div>
              </div>
            </div>
            {competitors.map((p) => (
              <div key={p.name} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="text-lg font-bold mb-3">{p.name}</div>
                <div className="text-2xl font-bold mb-1">{p.recv.toFixed(2)} {toCurrency}</div>
                <div className="text-xs text-red-500 mb-4">-{(receiveAmount - p.recv).toFixed(2)} {toCurrency}</div>
                <div className="space-y-2 border-t pt-3 text-xs">
                  <div className="flex justify-between"><span>{t('compare.transferFee')}</span><span className="font-mono">{p.fee.toFixed(2)} {fromCurrency}</span></div>
                  <div className="flex justify-between"><span>{t('compare.exchangeRate')}</span><span className="font-mono">1 {fromCurrency} = {p.er.toFixed(4)} {toCurrency}</span></div>
                  <div className="flex justify-between text-red-500 font-medium"><span>{t('compare.markup')}</span><span>{p.markup.toFixed(2)} {fromCurrency}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold"><span>{t('compare.cost')}</span><span>{(p.fee + p.markup).toFixed(2)} {fromCurrency}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Security */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-[#f5f7fa] rounded-3xl flex items-center justify-center shadow-inner">
              <svg className="w-32 h-32 text-[#00b9ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#1a1f36]">{t('security.title')}</h2>
            <p className="text-gray-500 mb-6">{t('security.subtitle')}</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mt-0.5">✓</span><span className="text-sm">{t('security.1')}</span></li>
              <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mt-0.5">✓</span><span className="text-sm">{t('security.2')}</span></li>
              <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mt-0.5">✓</span><span className="text-sm">{t('security.3')}</span></li>
            </ul>
            <span className="text-blue-600 hover:underline font-semibold text-sm cursor-pointer">{t('security.more')} →</span>
          </div>
        </div>
      </section>

      {/* SECTION 5: Testimonials */}
      <section className="py-16 px-4 bg-[#f5f7fa]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-[#1a1f36]">{t('testimonials.title')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['🇭🇰','🇨🇳','🇯🇵','🇺🇸'].map((flag, i) => {
              const n = i + 1
              return (
                <div key={n} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-lg mb-2">{flag}</div>
                  <p className="text-sm font-medium text-gray-700 mb-4 leading-relaxed">"{t(`testimonial.${n}.text`)}"</p>
                  <div className="text-xs"><span className="font-semibold text-gray-700">{t(`testimonial.${n}.author`)}</span> · <span className="text-gray-400">{t(`testimonial.${n}.location`)}</span></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: Mission */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center"><span className="text-9xl">🌍</span></div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#1a1f36]">{t('mission.title')}</h2>
            <p className="text-gray-500 mb-4">{t('mission.subtitle')}</p>
            <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:underline font-semibold text-sm">{t('mission.more')} →</Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: Country Grid with Flags */}
      <section className="py-16 px-4 bg-[#f5f7fa]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold mb-2 text-[#1a1f36]">{t('countries.title')}</h2>
          <p className="text-gray-500 mb-8 text-sm">{t('countries.subtitle')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2">
            {COUNTRIES.map(([flag, name]) => (
              <span key={name} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition flex items-center gap-2 py-0.5">
                <span>{flag}</span> {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA */}
      <section className="py-16 px-4 text-center" style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f7f4 50%, #eaf5f0 100%)' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4 text-[#1a1f36]">{t('cta.title')}</h2>
          <p className="text-gray-500 mb-8">{t('cta.subtitle')}</p>
          <Link href={`/${locale}/register`} className="inline-block bg-[#163300] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#0f2400] transition shadow-md">{t('cta.button')}</Link>
        </div>
      </section>

      {/* SECTION 9: Footer */}
      <footer className="bg-[#111] text-gray-400 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div><h4 className="text-white font-bold mb-4">ExchangeHub</h4>
              <ul className="space-y-2 text-sm"><li><Link href={`/${locale}/marketplace`} className="hover:text-white transition">{t('footer.marketplace')}</Link></li><li><Link href={`/${locale}/shops`} className="hover:text-white transition">{t('footer.shops')}</Link></li><li><Link href={`/${locale}/rates`} className="hover:text-white transition">{t('footer.rates')}</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">{t('footer.account')}</h4>
              <ul className="space-y-2 text-sm"><li><Link href={`/${locale}/register`} className="hover:text-white transition">{t('footer.signup')}</Link></li><li><Link href={`/${locale}/login`} className="hover:text-white transition">{t('footer.login')}</Link></li><li><Link href={`/${locale}/deposit`} className="hover:text-white transition">{t('footer.deposit')}</Link></li><li><Link href={`/${locale}/withdraw`} className="hover:text-white transition">{t('footer.withdraw')}</Link></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">{t('footer.resources')}</h4>
              <ul className="space-y-2 text-sm"><li><Link href={`/${locale}/kyc`} className="hover:text-white transition">{t('footer.kyc')}</Link></li><li><Link href={`/${locale}/transactions`} className="hover:text-white transition">{t('footer.transactions')}</Link></li><li><Link href={`/${locale}/payment-methods`} className="hover:text-white transition">{t('footer.paymentMethods')}</Link></li><li><span className="cursor-pointer hover:text-white">{t('footer.alerts')}</span></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm"><li><span className="cursor-pointer hover:text-white">{t('footer.about')}</span></li><li><span className="cursor-pointer hover:text-white">{t('footer.security')}</span></li><li><span className="cursor-pointer hover:text-white">{t('footer.careers')}</span></li><li><span className="cursor-pointer hover:text-white">{t('footer.press')}</span></li></ul></div>
            <div><h4 className="text-white font-bold mb-4">{t('footer.help')}</h4>
              <ul className="space-y-2 text-sm"><li><span className="cursor-pointer hover:text-white">{t('footer.helpCenter')}</span></li><li><span className="cursor-pointer hover:text-white">{t('footer.api')}</span></li><li><span className="cursor-pointer hover:text-white">{t('footer.contact')}</span></li></ul></div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-4 text-gray-500"><span className="cursor-pointer hover:text-white">{t('footer.legal')}</span><span className="cursor-pointer hover:text-white">{t('footer.privacy')}</span><span className="cursor-pointer hover:text-white">{t('footer.cookies')}</span><span className="cursor-pointer hover:text-white">{t('footer.accessibility')}</span></div>
            <p className="text-xs">{t('footer.registered')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
