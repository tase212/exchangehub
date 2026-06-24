import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateCommission } from '@/lib/commission'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, username: true, kycStatus: true } },
      buyer: { select: { id: true, username: true, kycStatus: true } },
    },
  })
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

  const isSeller = order.sellerId === auth.userId
  const isBuyer = order.buyerId === auth.userId

  if (body.status === 'CANCELLED') {
    if (order.status === 'OPEN' && isSeller) {
      const result = await prisma.$transaction(async (tx) => {
        if (order.frozenWalletId) {
          await tx.wallet.update({
            where: { id: order.frozenWalletId },
            data: { balance: { increment: order.sellAmount }, frozenBalance: { decrement: order.sellAmount } },
          })
        }
        return tx.order.update({ where: { id: params.id }, data: { status: 'CANCELLED' } })
      })
      return NextResponse.json({ order: result })
    }

    if (order.status === 'ACCEPTED' && (isBuyer || isSeller)) {
      const buyerWallet = await prisma.wallet.findFirst({
        where: { userId: order.buyerId!, currency: order.buyCurrency },
      })
      const result = await prisma.$transaction(async (tx) => {
        if (order.frozenWalletId) {
          await tx.wallet.update({
            where: { id: order.frozenWalletId },
            data: { balance: { increment: order.sellAmount }, frozenBalance: { decrement: order.sellAmount } },
          })
        }
        if (buyerWallet) {
          await tx.wallet.update({
            where: { id: buyerWallet.id },
            data: { balance: { increment: order.buyAmount }, frozenBalance: { decrement: order.buyAmount } },
          })
        }
        const cancelled = await tx.order.update({ where: { id: params.id }, data: { status: 'CANCELLED' } })

        const recipientId = isBuyer ? order.sellerId : order.buyerId!
        await tx.notification.create({
          data: {
            userId: recipientId,
            type: 'ORDER_CANCELLED',
            title: '订单已取消',
            message: `订单 ${params.id.slice(0, 8)}... 已被${isBuyer ? '买家' : '卖家'}取消`,
            link: `/orders/${params.id}`,
          },
        })

        return cancelled
      })
      return NextResponse.json({ order: result })
    }

    return NextResponse.json({ error: '无权取消此订单' }, { status: 403 })
  }

  if (body.status === 'COMPLETED') {
    if (!isSeller) return NextResponse.json({ error: '只有卖家可以确认完成' }, { status: 403 })
    if (order.status !== 'PAID') return NextResponse.json({ error: '只能确认已付款的订单' }, { status: 400 })
    if (!order.buyerId) return NextResponse.json({ error: '订单没有买家' }, { status: 400 })

    const commissionAmount = calculateCommission(order.sellAmount)
    const buyerReceives = order.sellAmount - commissionAmount

    const result = await prisma.$transaction(async (tx) => {
      if (order.frozenWalletId) {
        await tx.wallet.update({
          where: { id: order.frozenWalletId },
          data: { frozenBalance: { decrement: order.sellAmount } },
        })
      }

      await tx.wallet.upsert({
        where: { userId_currency: { userId: order.buyerId!, currency: order.sellCurrency } },
        update: { balance: { increment: buyerReceives } },
        create: { userId: order.buyerId!, currency: order.sellCurrency, balance: buyerReceives },
      })

      await tx.wallet.upsert({
        where: { userId_currency: { userId: order.sellerId, currency: order.buyCurrency } },
        update: { balance: { increment: order.buyAmount }, frozenBalance: { decrement: order.buyAmount } },
        create: { userId: order.sellerId, currency: order.buyCurrency, balance: order.buyAmount },
      })

      await tx.commission.create({
        data: { orderId: order.id, orderAmount: order.sellAmount, rate: 0.01, amount: commissionAmount, currency: order.sellCurrency, status: 'PENDING' },
      })

      const updated = await tx.order.update({
        where: { id: params.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })

      await tx.notification.create({
        data: { userId: order.buyerId!, type: 'ORDER_COMPLETED', title: '交易完成', message: `订单 ${params.id.slice(0, 8)}... 已完成，收到 ${buyerReceives.toFixed(2)} ${order.sellCurrency}`, link: `/orders/${params.id}` },
      })

      return updated
    })

    return NextResponse.json({ message: '交易完成', order: result })
  }

  return NextResponse.json({ error: '无效操作' }, { status: 400 })
}
