import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    if (order.status !== 'OPEN') {
      return NextResponse.json({ error: '该订单已被接受或已完成' }, { status: 400 })
    }

    if (order.sellerId === auth.userId) {
      return NextResponse.json({ error: '不能接受自己的订单' }, { status: 400 })
    }

    const buyerWallet = await prisma.wallet.findUnique({
      where: {
        userId_currency: {
          userId: auth.userId,
          currency: order.buyCurrency,
        },
      },
    })

    if (!buyerWallet || buyerWallet.balance < order.buyAmount) {
      return NextResponse.json(
        {
          error: `余额不足，需要 ${order.buyAmount} ${order.buyCurrency}，当前余额: ${buyerWallet?.balance || 0}`,
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data: {
          balance: { decrement: order.buyAmount },
          frozenBalance: { increment: order.buyAmount },
        },
      })

      return tx.order.update({
        where: { id: params.id },
        data: {
          buyerId: auth.userId,
          status: 'MATCHED',
        },
        include: {
          seller: { select: { id: true, username: true } },
          buyer: { select: { id: true, username: true } },
        },
      })
    })

    return NextResponse.json({ message: '交易已匹配，等待卖家确认', order: result })
  } catch (error) {
    console.error('Accept order error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
