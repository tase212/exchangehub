import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateCommission } from '@/lib/commission'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        seller: { select: { id: true, username: true, kycStatus: true } },
        buyer: { select: { id: true, username: true, kycStatus: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    const isSeller = order.sellerId === auth.userId
    const isBuyer = order.buyerId === auth.userId

    // Cancel: only seller can cancel OPEN orders
    if (body.status === 'CANCELLED') {
      if (!isSeller) {
        return NextResponse.json({ error: '无权取消此订单' }, { status: 403 })
      }
      if (order.status !== 'OPEN') {
        return NextResponse.json({ error: '只能取消开放状态的订单' }, { status: 400 })
      }

      const result = await prisma.$transaction(async (tx) => {
        if (order.frozenWalletId) {
          await tx.wallet.update({
            where: { id: order.frozenWalletId },
            data: {
              balance: { increment: order.sellAmount },
              frozenBalance: { decrement: order.sellAmount },
            },
          })
        }
        return tx.order.update({
          where: { id: params.id },
          data: { status: 'CANCELLED' },
        })
      })

      return NextResponse.json({ order: result })
    }

    // Confirm: only seller can confirm MATCHED orders
    if (body.status === 'COMPLETED') {
      if (!isSeller) {
        return NextResponse.json({ error: '只有卖家可以确认完成' }, { status: 403 })
      }
      if (order.status !== 'MATCHED') {
        return NextResponse.json({ error: '只能确认已匹配的订单' }, { status: 400 })
      }

      if (!order.buyerId) {
        return NextResponse.json({ error: '订单没有匹配买家' }, { status: 400 })
      }

      const result = await prisma.$transaction(async (tx) => {
        // Release seller's frozen sell currency and send to buyer
        if (order.frozenWalletId) {
          await tx.wallet.update({
            where: { id: order.frozenWalletId },
            data: { frozenBalance: { decrement: order.sellAmount } },
          })
        }

        // Transfer sell currency to buyer's wallet
        await tx.wallet.upsert({
          where: {
            userId_currency: {
              userId: order.buyerId!,
              currency: order.sellCurrency,
            },
          },
          update: { balance: { increment: order.sellAmount } },
          create: {
            userId: order.buyerId!,
            currency: order.sellCurrency,
            balance: order.sellAmount,
          },
        })

        // Release buyer's frozen buy currency and send to seller
        await tx.wallet.upsert({
          where: {
            userId_currency: {
              userId: order.sellerId,
              currency: order.buyCurrency,
            },
          },
          update: {
            balance: { increment: order.buyAmount },
            frozenBalance: { decrement: order.buyAmount },
          },
          create: {
            userId: order.sellerId,
            currency: order.buyCurrency,
            balance: order.buyAmount,
          },
        })

        // Create commission record
        const commissionAmount = calculateCommission(order.sellAmount)
        await tx.commission.create({
          data: {
            orderId: order.id,
            orderAmount: order.sellAmount,
            rate: 0.01,
            amount: commissionAmount,
            currency: order.sellCurrency,
            status: 'PENDING',
          },
        })

        return tx.order.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      })

      return NextResponse.json({ message: '交易完成', order: result })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
