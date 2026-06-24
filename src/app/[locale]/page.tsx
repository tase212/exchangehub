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
    { name: 'W. Union', fee: numAmount * 0.05 + 15, recv: numAmount * rate * 0.94, markup: numAmount * 0.05 + 38, er: rate * 0.97 },
  ]

  // SVG icons as inline components
  const BankIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none"><rect x="4" y="16" width="40" height="24" rx="3" fill="rgba(22,51,0,0.08)"/><rect x="8" y="20" width="12" height="6" rx="1" fill="#163300" opacity="0.2"/><rect x="22" y="20" width="18" height="6" rx="1" fill="#163300" opacity="0.2"/></svg>
  )
  const ShieldIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none"><path d="M24 4L8 12v12c0 9.941 7.059 17.647 16 20 8.941-2.353 16-10.059 16-20V12L24 4z" fill="rgba(22,51,0,0.08)"/><path d="M24 4L8 12v12c0 9.941 7.059 17.647 16 20" stroke="#163300" strokeWidth="2" opacity="0.4"/><path d="M17 23l5 5 9-9" stroke="#163300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  const ChatIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="rgba(22,51,0,0.08)"/><path d="M16 20h16M16 26h10" stroke="#163300" strokeWidth="2" strokeLinecap="round" opacity="0.4"/></svg>
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1: Hero - White bg, Wise-green calculator card */}
      <section className="bg-white pt-0 pb-12 md:pb-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 xl:px-[100px] pt-12 md:pt-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Text */}
            <div className="pt-8 lg:pt-12">
              <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold mb-6 text-[#0e0f0c] leading-[1.1] tracking-tight whitespace-pre-line">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-md leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <Link href={`/${locale}/register`}
                className="inline-flex rounded-[3px] py-[14px] px-8 font-semibold text-base transition-colors duration-150"
                style={{ background: '#9fe870', color: '#163300' }}>
                {t('hero.getStarted')}
              </Link>
            </div>

            {/* Right: Calculator Card - Wise style */}
            <div className="relative" style={{ maxWidth: 515 }}>
              <div className="rounded-[32px] overflow-hidden" style={{ boxShadow: '0 10px 32px rgba(0,0,0,.15), 0 40px 40px rgba(0,0,0,.04)' }}>
                {/* Top: dark green with pattern */}
                <div className="p-8 relative overflow-hidden" style={{ background: '#163300' }}>
                  <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #9fe870 1px, transparent 1px), radial-gradient(circle at 70% 30%, #9fe870 1px, transparent 1px), radial-gradient(circle at 50% 80%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px, 60px 60px, 50px 50px' }} />
                  <div className="relative">
                    <h3 className="text-[#9fe870] text-sm font-semibold mb-6">ExchangeHub works in 140+ countries</h3>
                    {/* You send */}
                    <div className="mb-5">
                      <label className="block text-xs text-white/70 font-medium mb-2">{t('converter.youSend')}</label>
                      <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                        <span className="text-lg">{FLAGS[fromCurrency]}</span>
                        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="bg-transparent font-semibold text-base outline-none cursor-pointer">
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 text-right text-xl font-bold font-mono outline-none min-w-0" />
                      </div>
                      {numAmount > 25000 && <p className="text-xs text-[#9fe870] mt-1.5">{t('converter.largeHint')}</p>}
                    </div>

                    {/* Swap row */}
                    <div className="flex items-center gap-3 my-3">
                      <button onClick={swap} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                        <svg className="w-4 h-4 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </button>
                      <div className="flex-1 border-t border-white/10" />
                    </div>

                    {/* Recipient gets */}
                    <div>
                      <label className="block text-xs text-white/70 font-medium mb-2">{t('converter.recipientGets')}</label>
                      <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                        <span className="text-lg">{FLAGS[toCurrency]}</span>
                        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="bg-transparent font-semibold text-base outline-none cursor-pointer">
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <span className="flex-1 text-right text-xl font-bold font-mono" style={{ color: '#163300' }}>
                          {rate > 0 ? receiveAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: white detail card */}
                <div className="bg-white p-6 space-y-2 text-sm" style={{ borderRadius: '32px 32px 0 0', marginTop: -8, position: 'relative' }}>
                  <div className="flex justify-between items-center py-1.5"><span className="flex items-center gap-2 text-gray-500"><span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: '#9fe870' }}>✓</span>{t('converter.arrives')}</span><span className="font-medium">by Tomorrow</span></div>
                  <div className="flex justify-between items-center py-1.5"><span className="flex items-center gap-2 text-gray-500"><span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: '#9fe870' }}>✓</span>{t('converter.totalFees')}</span><span className="font-medium">{feeAmount.toFixed(2)} {fromCurrency}</span></div>
                  <div className="flex justify-between items-center py-1.5"><span className="flex items-center gap-2 text-gray-500"><span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: '#9fe870' }}>✓</span>{t('converter.youSave')}</span><span className="font-bold" style={{ color: '#163300' }}>{((numAmount * rate * 0.05 - feeAmount * rate)).toFixed(2)} {toCurrency}</span></div>
                  <Link href={tradeLink} className="block w-full text-center rounded-[3px] py-3.5 mt-4 font-bold text-base transition-colors duration-150"
                    style={{ background: '#9fe870', color: '#163300' }}>
                    {t('converter.sendMoney')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Trust Bar */}
      <section className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <BankIcon />
              <div><h4 className="text-sm font-bold text-[#0e0f0c]">{t('trust.title1')}</h4><p className="text-xs text-gray-500 mt-1">{t('trust.desc1')}</p></div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ShieldIcon />
              <div><h4 className="text-sm font-bold text-[#0e0f0c]">{t('trust.title2')}</h4><p className="text-xs text-gray-500 mt-1">{t('trust.desc2')}</p></div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ChatIcon />
              <div><h4 className="text-sm font-bold text-[#0e0f0c]">{t('trust.title3')}</h4><p className="text-xs text-gray-500 mt-1">{t('trust.desc3')}</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Never pay a hidden fee again */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold text-center mb-3 text-[#0e0f0c]">{t('compare.title')}</h2>
          <p className="text-gray-500 text-center mb-8 max-w-[604px] mx-auto">{t('compare.subtitle')}</p>
          <div className="flex items-center justify-center gap-6 mb-10">
            <Link href={tradeLink} className="rounded-[3px] py-[14px] px-8 font-semibold text-sm transition-colors duration-150" style={{ background: '#9fe870', color: '#163300' }}>{t('compare.cta1')}</Link>
            <Link href={`/${locale}/rates`} className="font-semibold text-sm" style={{ color: '#163300' }}>{t('compare.cta2')} →</Link>
          </div>

          {/* Comparison cards */}
          <div style={{ boxShadow: '20px 0 30px -10px rgba(0,0,0,.06), -20px 0 30px -10px rgba(0,0,0,.06)' }} className="rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-4">
              {/* ExchangeHub */}
              <div className="p-6 text-center" style={{ background: '#e0f5e0' }}>
                <div className="text-xs font-bold uppercase mb-2" style={{ color: '#163300' }}>{t('compare.bestValue')}</div>
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='16'%3E%3Ctext x='0' y='14' font-weight='bold' font-size='14' fill='%23163300'%3EExchangeHub%3C/text%3E%3C/svg%3E" alt="ExchangeHub" className="mx-auto mb-3 h-5" />
                <div className="text-2xl font-bold text-[#0e0f0c]">{receiveAmount.toFixed(2)} {toCurrency}</div>
                <div className="text-xs text-gray-500 mt-1 mb-4">{t('compare.recipientGets')}</div>
                <div className="space-y-2 text-xs text-left border-t pt-3 border-gray-300">
                  <div className="flex justify-between"><span className="text-gray-500">{t('compare.transferFee')}</span><span className="font-mono">{feeAmount.toFixed(2)} {fromCurrency}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('compare.exchangeRate')}</span><span className="font-mono">1={rate.toFixed(4)}</span></div>
                  <div className="flex justify-between font-medium" style={{ color: '#163300' }}><span>{t('compare.markup')}</span><span>0 {fromCurrency}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-[#0e0f0c]"><span>{t('compare.cost')}</span><span>{feeAmount.toFixed(2)} {fromCurrency}</span></div>
                </div>
              </div>
              {/* Competitors */}
              {competitors.map((p) => (
                <div key={p.name} className="p-6 text-center bg-white border-r border-gray-100 last:border-r-0">
                  <div className="text-xl font-bold mb-3 text-gray-400">{p.name}</div>
                  <div className="text-2xl font-bold text-[#0e0f0c]">{p.recv.toFixed(2)} {toCurrency}</div>
                  <div className="text-xs text-red-500 mt-1 mb-4">-{(receiveAmount - p.recv).toFixed(2)} {toCurrency}</div>
                  <div className="space-y-2 text-xs text-left border-t pt-3 border-gray-100">
                    <div className="flex justify-between"><span className="text-gray-500">{t('compare.transferFee')}</span><span className="font-mono">{p.fee.toFixed(2)} {fromCurrency}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('compare.exchangeRate')}</span><span className="font-mono">1={p.er.toFixed(4)}</span></div>
                    <div className="flex justify-between text-red-500 font-medium"><span>{t('compare.markup')}</span><span>{p.markup.toFixed(2)} {fromCurrency}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold text-[#0e0f0c]"><span>{t('compare.cost')}</span><span>{(p.fee + p.markup).toFixed(2)} {fromCurrency}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Security */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:justify-between mb-16">
            <div className="flex-shrink-0">
              <svg viewBox="0 0 300 300" className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]" fill="none">
                <circle cx="150" cy="130" r="80" stroke="#163300" strokeWidth="3" opacity="0.15" />
                <rect x="90" y="140" width="120" height="100" rx="8" fill="rgba(22,51,0,0.05)" stroke="#163300" strokeWidth="2" opacity="0.3" />
                <circle cx="150" cy="190" r="12" fill="#163300" opacity="0.2" />
              </svg>
            </div>
            <div className="flex-1 max-w-lg">
              <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-4 text-[#0e0f0c]">{t('security.title')}</h2>
              <p className="text-gray-500 mb-8">{t('security.subtitle')}</p>
              <ul className="space-y-6 mb-8">
                {[1,2,3].map((i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-[65px] h-[65px] md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(22,51,0,0.08)' }}>
                      <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="#163300" strokeWidth="2" opacity="0.6">
                        {i === 1 && <path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                        {i === 2 && <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>}
                        {i === 3 && <><path d="M3 21h18M3 10h18M5 6l7-3 7 3M5 10v11M19 10v11" /></>}
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-[#0e0f0c] pt-2">{t(`security.${i}`)}</span>
                  </li>
                ))}
              </ul>
              <span className="font-semibold text-sm cursor-pointer hover:underline" style={{ color: '#163300' }}>{t('security.more')} →</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Testimonials */}
      <section className="py-20 px-4" style={{ background: 'rgba(22,51,0,0.04)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-12 text-[#0e0f0c]">{t('testimonials.title')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['🇭🇰','🇨🇳','🇯🇵','🇺🇸'].map((flag, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-2xl">{flag}</span>
                <p className="text-sm font-semibold text-[#0e0f0c] leading-relaxed">"{t(`testimonial.${i+1}.text`)}"</p>
                <div className="mt-auto text-xs">
                  <span className="font-bold text-[#0e0f0c]">{t(`testimonial.${i+1}.author`)}</span>
                  <span className="text-gray-400"> · {t(`testimonial.${i+1}.location`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48" fill="none">
              <circle cx="100" cy="100" r="90" fill="rgba(22,51,0,0.05)" />
              <circle cx="70" cy="80" r="25" fill="#9fe870" opacity="0.3" />
              <circle cx="130" cy="60" r="20" fill="#163300" opacity="0.15" />
              <circle cx="140" cy="120" r="15" fill="#9fe870" opacity="0.25" />
              <circle cx="60" cy="130" r="12" fill="#163300" opacity="0.2" />
              <line x1="70" y1="80" x2="100" y2="100" stroke="#163300" strokeWidth="1.5" opacity="0.2" />
              <line x1="130" y1="60" x2="100" y2="100" stroke="#163300" strokeWidth="1.5" opacity="0.2" />
              <line x1="140" y1="120" x2="100" y2="100" stroke="#163300" strokeWidth="1.5" opacity="0.2" />
              <line x1="60" y1="130" x2="100" y2="100" stroke="#163300" strokeWidth="1.5" opacity="0.2" />
            </svg>
          </div>
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-4 text-[#0e0f0c]">{t('mission.title')}</h2>
            <p className="text-gray-500 mb-4">{t('mission.subtitle')}</p>
            <Link href={`/${locale}/marketplace`} className="font-semibold text-sm hover:underline" style={{ color: '#163300' }}>{t('mission.more')} →</Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: Countries */}
      <section className="py-20 px-4" style={{ background: 'rgba(22,51,0,0.04)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-2xl font-extrabold mb-1 text-[#0e0f0c]">{t('countries.title')}</h2>
          <p className="text-gray-500 mb-8 text-sm">{t('countries.subtitle')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-1.5">
            {COUNTRIES.map(([flag, name]) => (
              <span key={name} className="text-sm text-gray-600 hover:text-[#163300] cursor-pointer transition-colors flex items-center gap-2 py-1">
                <span className="text-base">{flag}</span> {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-4 text-[#0e0f0c]">{t('cta.title')}</h2>
          <p className="text-gray-500 mb-8">{t('cta.subtitle')}</p>
          <Link href={`/${locale}/register`}
            className="inline-flex rounded-[3px] py-[18px] px-12 font-bold text-lg transition-colors duration-150"
            style={{ background: '#9fe870', color: '#163300' }}>
            {t('cta.button')}
          </Link>
        </div>
      </section>

      {/* SECTION 9: Footer */}
      <footer className="py-16 px-4" style={{ background: 'rgba(22,51,0,0.078)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12" style={{ columnCount: 5 }}>
            {[
              ['ExchangeHub', [['marketplace', `/${locale}/marketplace`], ['shops', `/${locale}/shops`], ['rates', `/${locale}/rates`]]],
              ['account', [['signup', `/${locale}/register`], ['login', `/${locale}/login`], ['deposit', `/${locale}/deposit`], ['withdraw', `/${locale}/withdraw`]]],
              ['resources', [['kyc', `/${locale}/kyc`], ['transactions', `/${locale}/transactions`], ['paymentMethods', `/${locale}/payment-methods`], ['alerts', '']]],
              ['company', [['about', ''], ['security', ''], ['careers', ''], ['press', '']]],
              ['help', [['helpCenter', ''], ['api', ''], ['contact', '']]],
            ].map(([title, items]: [string, any[]]) => (
              <div key={title as string}>
                <h4 className="font-bold mb-4 text-[#0e0f0c]">{(t as any)(`footer.${title}`)}</h4>
                <ul className="space-y-2">
                  {(items as [string, string][]).map(([k, href]) => (
                    <li key={k}>
                      {href ? (
                        <Link href={href} className="text-sm text-gray-500 hover:text-[#0e0f0c] transition-colors">{(t as any)(`footer.${k}`)}</Link>
                      ) : (
                        <span className="text-sm text-gray-500 hover:text-[#0e0f0c] cursor-pointer transition-colors">{(t as any)(`footer.${k}`)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-[#0e0f0c] transition-colors">Legal</span>
              <span className="cursor-pointer hover:text-[#0e0f0c] transition-colors">Privacy</span>
              <span className="cursor-pointer hover:text-[#0e0f0c] transition-colors">Cookies</span>
              <span className="cursor-pointer hover:text-[#0e0f0c] transition-colors">Accessibility</span>
            </div>
            <span>© 2026 ExchangeHub</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
