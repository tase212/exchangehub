import { NextResponse } from 'next/server'

let cachedRates: Record<string, number> | null = null
let lastFetch = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

async function fetchLiveRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - lastFetch < CACHE_TTL) {
    return cachedRates
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!res.ok) throw new Error('Rate API failed')
    const data = await res.json()
    const rates = data.rates as Record<string, number>
    cachedRates = rates
    lastFetch = Date.now()
    return rates
  } catch {
    return cachedRates || getFallbackRates()
  }
}

function getFallbackRates(): Record<string, number> {
  return {
    CNY: 7.25, HKD: 7.82, EUR: 0.92, JPY: 157.3, GBP: 0.79,
    SGD: 1.34, TWD: 32.5, THB: 36.5, KRW: 1380, USD: 1,
  }
}

export async function GET(request: Request) {
  try {
    const rates = await fetchLiveRates()
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')?.toUpperCase()
    const to = searchParams.get('to')?.toUpperCase()

    if (from && to) {
      const fromRate = rates[from]
      const toRate = rates[to]
      if (!fromRate || !toRate) {
        return NextResponse.json({ error: '不支持的货币' }, { status: 400 })
      }
      const rate = toRate / fromRate
      return NextResponse.json({
        from, to, rate,
        inverseRate: 1 / rate,
        timestamp: lastFetch,
      })
    }

    // Return common pairs
    const pairs = [
      { from: 'CNY', to: 'HKD' },
      { from: 'CNY', to: 'USD' },
      { from: 'CNY', to: 'EUR' },
      { from: 'CNY', to: 'JPY' },
      { from: 'CNY', to: 'GBP' },
      { from: 'HKD', to: 'CNY' },
      { from: 'HKD', to: 'USD' },
      { from: 'USD', to: 'CNY' },
      { from: 'USD', to: 'HKD' },
      { from: 'EUR', to: 'CNY' },
      { from: 'EUR', to: 'HKD' },
      { from: 'GBP', to: 'CNY' },
    ]

    const result = pairs.map(({ from, to }) => {
      const fromRate = rates[from]
      const toRate = rates[to]
      const rate = fromRate && toRate ? toRate / fromRate : 0
      return { from, to, rate: Math.round(rate * 10000) / 10000 }
    })

    return NextResponse.json({ rates: result, timestamp: lastFetch })
  } catch (error) {
    console.error('Rates API error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
