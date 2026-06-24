import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const wallets = await prisma.wallet.findMany({
      where: { userId: auth.userId },
      orderBy: { currency: 'asc' },
    })

    return NextResponse.json({ wallets })
  } catch (error) {
    console.error('Fetch wallets error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
