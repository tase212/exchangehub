import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status

  const [commissions, total] = await Promise.all([
    prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { order: { select: { id: true, sellCurrency: true, sellAmount: true, buyCurrency: true, buyAmount: true } } },
    }),
    prisma.commission.count({ where }),
  ])

  const summary = await prisma.commission.aggregate({
    _sum: { amount: true },
    _count: true,
    where: { status: 'SETTLED' },
  })

  const pending = await prisma.commission.aggregate({
    _sum: { amount: true },
    where: { status: 'PENDING' },
  })

  return NextResponse.json({
    commissions,
    total,
    page,
    limit,
    summary: {
      totalEarned: summary._sum.amount || 0,
      totalSettled: summary._count,
      pendingAmount: pending._sum.amount || 0,
    },
  })
}
