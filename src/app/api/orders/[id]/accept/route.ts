import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  if (order.status !== 'OPEN') return NextResponse.json({ error: '该订单已被接受或已完成' }, { status: 400 })
  if (order.sellerId === auth.userId) return NextResponse.json({ error: '不能接受自己的订单' }, { status: 400 })

  const buyerWallet = await prisma.wallet.findUnique({
    where: { userId_currency: { userId: auth.userId, currency: order.buyCurrency } },
  })

  if (!buyerWallet || buyerWallet.balance < order.buyAmount) {
    return NextResponse.json(
      { error: `余额不足，需要 ${order.buyAmount} ${order.buyCurrency}，当前余额: ${buyerWallet?.balance || 0}` },
      { status: 400 }
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: buyerWallet.id },
      data: { balance: { decrement: order.buyAmount }, frozenBalance: { increment: order.buyAmount } },
    })

    const updated = await tx.order.update({
      where: { id: params.id },
      data: { buyerId: auth.userId, status: 'ACCEPTED' },
      include: {
        seller: { select: { id: true, username: true } },
        buyer: { select: { id: true, username: true } },
      },
    })

    await tx.notification.create({
      data: {
        userId: order.sellerId,
        type: 'ORDER_ACCEPTED',
        title: '订单已被接受',
        message: `订单 ${params.id.slice(0, 8)}... 已被买家接受，请等待付款确认`,
        link: `/orders/${params.id}`,
      },
    })

    return updated
  })

  return NextResponse.json({ message: '交易已匹配，请在24小时内完成付款', order: result })
}
