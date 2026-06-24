import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const [totalUsers, totalOrders, pendingKyc, totalCommission, pendingCommission] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.kycSubmission.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
    prisma.commission.aggregate({ _sum: { amount: true }, where: { status: 'SETTLED' } }),
    prisma.commission.aggregate({ _sum: { amount: true }, where: { status: 'PENDING' } }),
  ])

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, sellCurrency: true, sellAmount: true, buyCurrency: true, buyAmount: true, status: true, createdAt: true, seller: { select: { username: true } } },
  })

  return NextResponse.json({
    stats: {
      totalUsers,
      totalOrders,
      pendingKyc,
      totalCommission: totalCommission._sum.amount || 0,
      pendingCommission: pendingCommission._sum.amount || 0,
    },
    recentOrders,
  })
}
