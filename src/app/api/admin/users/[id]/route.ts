import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, username: true, email: true, phone: true, kycStatus: true, createdAt: true,
      wallets: { select: { currency: true, balance: true, frozenBalance: true } },
      kycSubmissions: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, idType: true, status: true, createdAt: true } },
      sellOrders: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, sellCurrency: true, sellAmount: true, buyCurrency: true, buyAmount: true, status: true, createdAt: true } },
    },
  })
  if (!user) return NextResponse.json({ error: '未找到' }, { status: 404 })

  return NextResponse.json({ user })
}
