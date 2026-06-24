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

  if (order.buyerId !== auth.userId) {
    return NextResponse.json({ error: '只有买家可以确认付款' }, { status: 403 })
  }
  if (order.status !== 'ACCEPTED') {
    return NextResponse.json({ error: '当前状态不允许确认付款' }, { status: 400 })
  }

  const body = await request.json()
  const { paymentProof, paymentNote } = body

  if (!paymentProof) {
    return NextResponse.json({ error: '请上传付款凭证' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: params.id },
      data: {
        status: 'PAID',
        paymentProof: paymentProof.substring(0, 50000),
        paymentNote: paymentNote || null,
        paidAt: new Date(),
      },
    })

    await tx.notification.create({
      data: {
        userId: order.sellerId,
        type: 'ORDER_PAID',
        title: '买家已付款',
        message: `订单 ${params.id.slice(0, 8)}... 的买家已确认付款，请查收`,
        link: `/orders/${params.id}`,
      },
    })

    return updated
  })

  return NextResponse.json({ order: result })
}
