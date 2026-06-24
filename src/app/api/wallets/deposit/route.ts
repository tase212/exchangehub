import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { currency, amount } = body

    if (!currency || !amount || amount <= 0) {
      return NextResponse.json(
        { error: '请输入有效的币种和金额' },
        { status: 400 }
      )
    }

    const wallet = await prisma.wallet.upsert({
      where: {
        userId_currency: {
          userId: auth.userId,
          currency: currency.toUpperCase(),
        },
      },
      update: {
        balance: { increment: parseFloat(amount) },
      },
      create: {
        userId: auth.userId,
        currency: currency.toUpperCase(),
        balance: parseFloat(amount),
      },
    })

    return NextResponse.json({
      message: '充值成功',
      wallet,
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
