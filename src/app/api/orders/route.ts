import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const sellCurrency = searchParams.get('sellCurrency')
    const buyCurrency = searchParams.get('buyCurrency')
    const method = searchParams.get('method')
    const my = searchParams.get('my')

    const where: any = {}

    if (my === 'true' && !(auth instanceof NextResponse)) {
      where.OR = [
        { sellerId: auth.userId },
        { buyerId: auth.userId },
      ]
    } else {
      where.status = 'OPEN'
    }

    if (sellCurrency) where.sellCurrency = sellCurrency
    if (buyCurrency) where.buyCurrency = buyCurrency
    if (method) where.method = method

    const orders = await prisma.order.findMany({
      where,
      include: {
        seller: { select: { id: true, username: true } },
        buyer: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const {
      sellCurrency, sellAmount, buyCurrency, buyAmount,
      method, location, note,
    } = body

    if (!sellCurrency || !buyCurrency || !sellAmount || !buyAmount) {
      return NextResponse.json({ error: '请填写完整的交易信息' }, { status: 400 })
    }

    if (sellCurrency === buyCurrency) {
      return NextResponse.json({ error: '卖出和买入货币不能相同' }, { status: 400 })
    }

    const sellAmt = parseFloat(sellAmount)
    const buyAmt = parseFloat(buyAmount)

    if (sellAmt <= 0 || buyAmt <= 0) {
      return NextResponse.json({ error: '金额必须大于0' }, { status: 400 })
    }

    const rate = buyAmt / sellAmt

    const sellerWallet = await prisma.wallet.findUnique({
      where: {
        userId_currency: {
          userId: auth.userId,
          currency: sellCurrency.toUpperCase(),
        },
      },
    })

    if (!sellerWallet || sellerWallet.balance < sellAmt) {
      return NextResponse.json(
        { error: `${sellCurrency} 余额不足，当前余额: ${sellerWallet?.balance || 0}` },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data: {
          balance: { decrement: sellAmt },
          frozenBalance: { increment: sellAmt },
        },
      })

      return tx.order.create({
        data: {
          sellerId: auth.userId,
          sellCurrency: sellCurrency.toUpperCase(),
          sellAmount: sellAmt,
          buyCurrency: buyCurrency.toUpperCase(),
          buyAmount: buyAmt,
          rate,
          method: method || 'ONLINE_CARD',
          location,
          note,
          frozenWalletId: sellerWallet.id,
        },
      })
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
