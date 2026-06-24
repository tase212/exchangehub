import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')

    const where: any = {
      isActive: true,
    }

    if (city) where.city = city
    if (country) where.country = country

    const shops = await prisma.exchangeShop.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: 50,
    })

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Fetch shops error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
