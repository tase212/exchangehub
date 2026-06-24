'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/useTranslation'

const RATES: Record<string, number> = {
  'CNY-HKD': 1.1531, 'CNY-USD': 0.1471, 'CNY-EUR': 0.1291, 'CNY-JPY': 23.755, 'CNY-GBP': 0.1114,
  'HKD-CNY': 0.8673, 'HKD-USD': 0.1275, 'HKD-EUR': 0.1120, 'HKD-JPY': 20.601, 'HKD-GBP': 0.0966,
  'USD-CNY': 6.800, 'USD-HKD': 7.841, 'USD-EUR': 0.878, 'USD-JPY': 161.54, 'USD-GBP': 0.757,
  'EUR-CNY': 7.746, 'EUR-HKD': 8.932, 'EUR-USD': 1.139, 'EUR-JPY': 184.0, 'EUR-GBP': 1.159,
  'GBP-CNY': 8.980, 'GBP-HKD': 10.354, 'GBP-USD': 1.321, 'GBP-EUR': 0.863, 'GBP-JPY': 213.33,
  'JPY-CNY': 0.0421, 'JPY-HKD': 0.0485, 'JPY-USD': 0.00619, 'JPY-EUR': 0.00544, 'JPY-GBP': 0.00469,
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

const COMPETITORS = [
  { name: 'Bank', logo: '🏦', fee: (a: number) => 65 + a * 0.002, feeRate: () => 0.005, markupPct: () => 0.03 },
  { name: 'PayPal', logo: '🅿️', fee: (a: number) => 39 + a * 0.035, feeRate: () => 0.01, markupPct: () => 0.04 },
]

const SECURITY_SVGS = [
  <svg key="1" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#9fe870" strokeWidth="2"><path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  <svg key="2" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#9fe870" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  <svg key="3" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#9fe870" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M5 10v11M19 10v11"/></svg>,
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
  const feeAmount = Math.max(numAmount * feeRate, 16.22)
  const receiveAmount = (numAmount - feeAmount) * rate
  const swap = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency) }
  const tradeLink = `/${locale}/create-order?sell=${fromCurrency}&buy=${toCurrency}&amount=${encodeURIComponent(amount)}`

  const texts = {
    heroTitle: t('hero.title') || 'Send money globally for less',
    heroSub: t('hero.subtitle') || 'Save on international transfers in over 50 currencies, without any hidden fees.',
    getStarted: t('hero.getStarted') || 'Open an account',
    youSend: t('converter.youSend') || 'You send exactly',
    recipientGets: t('converter.recipientGets') || 'Recipient gets',
    arrives: t('converter.arrives') || 'by Tomorrow',
    fees: t('converter.totalFees') || 'Total fees',
    saves: t('converter.youSave') || 'You could save up to',
    sendMoney: t('converter.sendMoney') || 'Send money',
    bestValue: t('compare.bestValue') || 'Best value',
    compareTitle: t('compare.title') || 'Never pay a hidden fee again',
    compareSub: t('compare.subtitle') || 'Banks add markups. We don\'t.',
    cta1: t('compare.cta1') || 'Send money now',
    cta2: t('compare.cta2') || 'Learn how to send money',
    transferFee: t('compare.transferFee') || 'Transfer fee',
    exchangeRate: t('compare.exchangeRate') || 'Exchange rate',
    markup: t('compare.markup') || 'Exchange rate markup',
    cost: t('compare.cost') || 'Cost',
    secTitle: t('security.title') || 'Disappoint thieves',
    secSub: t('security.subtitle') || 'Millions trust us to move billions.',
    secItems: [t('security.1'), t('security.2'), t('security.3')].map(s => s || ''),
    secMore: t('security.more') || 'How we keep your money safe',
    testimonials: t('testimonials.title') || 'For people going places',
    missTitle: t('mission.title') || 'Meet money without borders',
    missSub: t('mission.subtitle') || 'Min fees. Max ease. Full speed.',
    missMore: t('mission.more') || 'Explore the marketplace',
    countries: t('countries.title') || 'ExchangeHub works nearly everywhere',
    countriesSub: t('countries.subtitle') || 'Send money',
    ctaTitle: t('cta.title') || 'Ready to send money without borders?',
    ctaSub: t('cta.subtitle') || 'Join millions who save on international transfers',
    ctaButton: t('cta.button') || 'Open an account for free',
  }

  const trustItems = [
    ['Trusted by millions', 'We move billions worldwide every month'],
    ['Regulated', 'Licensed as a Money Service Operator'],
    ['24/7 customer support', 'Get help any time over email and chat'],
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO + TRUST BAR — all on dark green #1C4227 background, matching Wise exactly */}
      <section className="relative overflow-hidden" style={{ background: '#1C4227' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 xl:px-[100px] pt-16 md:pt-24 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left: Text */}
            <div className="pt-8 lg:pt-12 lg:max-w-[480px]">
              <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold mb-5 text-white leading-[1.05] tracking-tight whitespace-pre-line">
                {texts.heroTitle}
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {texts.heroSub}
              </p>
              <Link href={`/${locale}/register`}
                className="inline-flex rounded-xl py-3.5 px-10 font-bold text-base"
                style={{ background: '#9fe870', color: '#163300' }}>
                {texts.getStarted}
              </Link>
            </div>

            {/* Right: Calculator embedded on green bg */}
            <div className="relative lg:max-w-[480px] lg:ml-auto">
              <h3 className="text-[#9fe870] text-sm font-semibold mb-4">Send securely to 140+ countries</h3>
              
              {/* You send */}
              <div className="mb-5">
                <label className="block text-white font-semibold text-xs mb-2">{texts.youSend}</label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3.5">
                  <span className="text-lg">{FLAGS[fromCurrency]}</span>
                  <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="bg-transparent font-bold text-base outline-none cursor-pointer">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 text-right text-xl font-bold font-mono outline-none" />
                </div>
              </div>

              {/* Swap */}
              <div className="flex items-center justify-center my-2">
                <button onClick={swap} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                </button>
              </div>

              {/* Recipient gets */}
              <div className="mb-6">
                <label className="block text-white font-semibold text-xs mb-2">{texts.recipientGets}</label>
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3.5">
                  <span className="text-lg">{FLAGS[toCurrency]}</span>
                  <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="bg-transparent font-bold text-base outline-none cursor-pointer">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="flex-1 text-right text-xl font-bold font-mono text-[#163300]">
                    {rate > 0 ? receiveAmount.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Details - embedded on green */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="text-[#9fe870] text-xs">●</span> {texts.arrives}
                </div>
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="text-[#9fe870] text-xs">●</span> {texts.fees} — {feeAmount.toFixed(2)} {fromCurrency}
                </div>
                <div className="flex items-center gap-3 text-[#9fe870] text-sm font-medium">
                  <span className="text-[#9fe870] text-xs">●</span> {texts.saves} — {((numAmount * rate * 0.05 - feeAmount * rate)).toFixed(2)} {toCurrency}
                </div>
              </div>

              <Link href={tradeLink}
                className="block w-full text-center rounded-xl py-4 font-bold text-base"
                style={{ background: '#9fe870', color: '#163300' }}>
                {texts.sendMoney}
              </Link>
            </div>
          </div>
        </div>

        {/* Trust bar — embedded on same green bg */}
        <div className="border-t border-white/10 py-8 mt-4">
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
            <div className="grid md:grid-cols-3 gap-8">
              {trustItems.map(([title, desc], i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(159,232,112,0.15)' }}>
                    {SECURITY_SVGS[i]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{title}</h4>
                    <p className="text-xs text-white/60 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Comparison Table */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold text-center mb-3 text-[#0e0f0c]">{texts.compareTitle}</h2>
          <p className="text-gray-500 text-center mb-8 max-w-[604px] mx-auto">{texts.compareSub}</p>
          <div className="flex items-center justify-center gap-6 mb-10">
            <Link href={tradeLink} className="rounded-xl py-[14px] px-8 font-semibold text-sm" style={{ background: '#9fe870', color: '#163300' }}>{texts.cta1}</Link>
            <Link href={`/${locale}/rates`} className="font-semibold text-sm" style={{ color: '#163300' }}>{texts.cta2} →</Link>
          </div>

          <div style={{ boxShadow: '20px 0 30px -10px rgba(0,0,0,.06), -20px 0 30px -10px rgba(0,0,0,.06)' }} className="rounded-2xl">
            <div className="grid grid-cols-4">
              <div className="p-6 text-center bg-[#e0f5e0]">
                <div className="text-xs font-bold uppercase mb-2 text-[#163300]">{texts.bestValue}</div>
                <div className="text-lg font-extrabold mb-3 text-[#163300]">ExchangeHub</div>
                <div className="text-2xl font-bold text-[#0e0f0c]">{receiveAmount.toFixed(2)} {toCurrency}</div>
                <div className="text-xs text-gray-500 mt-1 mb-4">Recipient gets</div>
                <div className="space-y-2 text-xs border-t border-gray-300 pt-3">
                  <div className="flex justify-between"><span className="text-gray-500">{texts.transferFee}</span><span className="font-mono">{feeAmount.toFixed(2)} {fromCurrency}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{texts.exchangeRate}</span><span className="font-mono">1 HKD = {rate.toFixed(4)} USD</span></div>
                  <div className="flex justify-between font-medium text-[#163300]"><span>{texts.markup}</span><span>0 HKD</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-[#0e0f0c]"><span>{texts.cost}</span><span>{feeAmount.toFixed(2)} HKD</span></div>
                </div>
              </div>
              {COMPETITORS.map((p) => {
                const compFee = p.fee(numAmount)
                const markupAmount = numAmount * p.markupPct()
                const compRate = rate * (1 - p.feeRate() - p.markupPct())
                const compRecv = numAmount * compRate
                return (
                  <div key={p.name} className="p-6 text-center bg-white border-r border-gray-100 last:border-r-0">
                    <div className="text-2xl mb-2">{p.logo}</div>
                    <div className="text-sm font-bold mb-3 text-gray-600">{p.name}</div>
                    <div className="text-2xl font-bold text-[#0e0f0c]">{compRecv.toFixed(2)} {toCurrency}</div>
                    <div className="text-xs text-red-500 mt-1 mb-4">-{(receiveAmount - compRecv).toFixed(2)} {toCurrency}</div>
                    <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                      <div className="flex justify-between text-left"><span className="text-gray-500">{texts.transferFee}</span><span className="font-mono">{compFee.toFixed(2)} HKD</span></div>
                      <div className="flex justify-between text-left"><span className="text-gray-500">{texts.exchangeRate}</span><span className="font-mono">1 HKD = {compRate.toFixed(4)} USD</span></div>
                      <div className="flex justify-between text-red-500 font-medium"><span>{texts.markup}</span><span>{markupAmount.toFixed(2)} HKD</span></div>
                      <div className="border-t pt-2 flex justify-between font-bold text-[#0e0f0c]"><span>{texts.cost}</span><span>{(compFee + markupAmount).toFixed(2)} HKD</span></div>
                    </div>
                  </div>
                )
              })}
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
              <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-4 text-[#0e0f0c]">{texts.secTitle}</h2>
              <p className="text-gray-500 mb-8">{texts.secSub}</p>
              <ul className="space-y-6 mb-8">
                {texts.secItems.map((txt, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(22,51,0,0.08)' }}>
                      {SECURITY_SVGS[i]}
                    </span>
                    <span className="text-sm font-semibold text-[#0e0f0c] pt-4">{txt}</span>
                  </li>
                ))}
              </ul>
              <span className="font-semibold text-sm cursor-pointer hover:underline" style={{ color: '#163300' }}>{texts.secMore} →</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Testimonials */}
      <section className="py-20 px-4" style={{ background: 'rgba(22,51,0,0.04)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-12 text-[#0e0f0c]">{texts.testimonials}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['🇭🇰','🇨🇳','🇯🇵','🇺🇸'].map((flag, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-2xl">{flag}</span>
                <p className="text-sm font-semibold text-[#0e0f0c] leading-relaxed">"{t(`testimonial.${i+1}.text`) || 'Great experience'}"</p>
                <div className="mt-auto text-xs">
                  <span className="font-bold text-[#0e0f0c]">{t(`testimonial.${i+1}.author`) || 'User'}</span>
                  <span className="text-gray-400"> · {t(`testimonial.${i+1}.location`) || ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 grid md:grid-cols-2 gap-12 items-center">
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none">
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
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-4 text-[#0e0f0c]">{texts.missTitle}</h2>
            <p className="text-gray-500 mb-4">{texts.missSub}</p>
            <Link href={`/${locale}/marketplace`} className="font-semibold text-sm hover:underline" style={{ color: '#163300' }}>{texts.missMore} →</Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: Countries grid */}
      <section className="py-20 px-4" style={{ background: 'rgba(22,51,0,0.04)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <h2 className="text-2xl font-extrabold mb-1 text-[#0e0f0c]">{texts.countries}</h2>
          <p className="text-gray-500 mb-8 text-sm">{texts.countriesSub}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-1.5">
            {COUNTRIES.map(([flag, name]) => (
              <span key={name} className="text-sm text-gray-600 hover:text-[#163300] cursor-pointer transition-colors flex items-center gap-2 py-1"><span className="text-base">{flag}</span> {name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA */}
      <section className="py-20 px-4 bg-white text-center">
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold mb-4 text-[#0e0f0c]">{texts.ctaTitle}</h2>
        <p className="text-gray-500 mb-8">{texts.ctaSub}</p>
        <Link href={`/${locale}/register`} className="inline-flex rounded-xl py-[18px] px-12 font-bold text-lg" style={{ background: '#9fe870', color: '#163300' }}>{texts.ctaButton}</Link>
      </section>

      {/* SECTION 9: Footer */}
      <footer className="py-16 px-4" style={{ background: 'rgba(22,51,0,0.078)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <FooterCol title="Products" links={[['Marketplace',`/${locale}/marketplace`],['Exchange Shops',`/${locale}/shops`],['Live Rates',`/${locale}/rates`]]} />
            <FooterCol title="Account" links={[['Sign Up',`/${locale}/register`],['Log In',`/${locale}/login`],['Deposit',`/${locale}/deposit`],['Withdraw',`/${locale}/withdraw`]]} />
            <FooterCol title="Resources" links={[['Verify Identity',`/${locale}/kyc`],['Transactions',`/${locale}/transactions`],['Payment Methods',`/${locale}/payment-methods`],['Rate Alerts','']]} />
            <FooterCol title="Company" links={[['About Us',''],['Security',''],['Careers',''],['Press','']]} />
            <FooterCol title="Help" links={[['Help Center',''],['API Docs',''],['Contact Us','']]} />
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-[#0e0f0c]">Legal</span>
              <span className="cursor-pointer hover:text-[#0e0f0c]">Privacy</span>
              <span className="cursor-pointer hover:text-[#0e0f0c]">Cookies</span>
              <span className="cursor-pointer hover:text-[#0e0f0c]">Accessibility</span>
            </div>
            <span>© 2026 ExchangeHub</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-bold mb-4 text-[#0e0f0c]">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            {href ? <Link href={href} className="text-sm text-gray-500 hover:text-[#0e0f0c] transition-colors">{label}</Link>
            : <span className="text-sm text-gray-500 hover:text-[#0e0f0c] cursor-pointer transition-colors">{label}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
