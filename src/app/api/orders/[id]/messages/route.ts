import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const order = await prisma.order.findUnique({ where: { id: params.id }, select: { sellerId: true, buyerId: true } })
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  if (order.sellerId !== auth.userId && order.buyerId !== auth.userId) {
    return NextResponse.json({ error: '无权查看' }, { status: 403 })
  }

  const messages = await prisma.message.findMany({
    where: { orderId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, username: true } } },
  })

  return NextResponse.json({ messages })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const order = await prisma.order.findUnique({ where: { id: params.id }, select: { sellerId: true, buyerId: true } })
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  if (order.sellerId !== auth.userId && order.buyerId !== auth.userId) {
    return NextResponse.json({ error: '无权发送消息' }, { status: 403 })
  }

  const body = await request.json()
  const { content } = body
  if (!content || !content.trim()) {
    return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: { orderId: params.id, senderId: auth.userId, content: content.trim() },
    include: { sender: { select: { id: true, username: true } } },
  })

  const recipientId = auth.userId === order.sellerId ? order.buyerId : order.sellerId
  if (recipientId) {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: '新消息',
        message: `订单 ${params.id.slice(0, 8)}... 有新消息`,
        link: `/orders/${params.id}`,
      },
    })
  }

  return NextResponse.json({ message }, { status: 201 })
}
