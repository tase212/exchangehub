import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const submission = await prisma.kycSubmission.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, username: true, email: true, kycStatus: true, createdAt: true } } },
  })
  if (!submission) return NextResponse.json({ error: '未找到' }, { status: 404 })

  return NextResponse.json({ submission })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { status, rejectReason } = body

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: '无效状态' }, { status: 400 })
  }

  const submission = await prisma.kycSubmission.findUnique({ where: { id: params.id } })
  if (!submission) return NextResponse.json({ error: '未找到' }, { status: 404 })

  await prisma.$transaction([
    prisma.kycSubmission.update({
      where: { id: params.id },
      data: { status, rejectReason: status === 'REJECTED' ? rejectReason : null },
    }),
    prisma.user.update({
      where: { id: submission.userId },
      data: { kycStatus: status },
    }),
  ])

  return NextResponse.json({ message: status === 'APPROVED' ? '已通过' : '已拒绝' })
}
