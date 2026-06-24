import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    const where: any = {}
    if (orderId) where.orderId = orderId

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: { select: { id: true, username: true } },
        target: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Fetch reviews error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { orderId, targetId, rating, comment } = body

    if (!orderId || !targetId || !rating) {
      return NextResponse.json({ error: '请填写必填字段' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: '评分范围 1-5' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order || order.status !== 'COMPLETED') {
      return NextResponse.json({ error: '只能评价已完成的订单' }, { status: 400 })
    }

    if (order.sellerId !== auth.userId && order.buyerId !== auth.userId) {
      return NextResponse.json({ error: '无权评价此订单' }, { status: 403 })
    }

    const existing = await prisma.review.findUnique({
      where: {
        orderId_reviewerId: {
          orderId,
          reviewerId: auth.userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: '你已经评价过了' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: auth.userId,
        targetId,
        rating,
        comment: comment || null,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
