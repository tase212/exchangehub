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

  const [submissions, total] = await Promise.all([
    prisma.kycSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, username: true, email: true } } },
    }),
    prisma.kycSubmission.count({ where }),
  ])

  return NextResponse.json({ submissions, total, page, limit })
}
