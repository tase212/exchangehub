import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const submission = await prisma.kycSubmission.findFirst({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, idType: true, status: true, rejectReason: true, createdAt: true, updatedAt: true },
  })

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { kycStatus: true } })

  return NextResponse.json({ submission, kycStatus: user?.kycStatus })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { idType, idFrontImage, idBackImage, selfieImage } = body

  if (!idType || !idFrontImage || !selfieImage) {
    return NextResponse.json({ error: '请提供身份证件正面照片和自拍照' }, { status: 400 })
  }

  if (!['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE'].includes(idType)) {
    return NextResponse.json({ error: '无效的证件类型' }, { status: 400 })
  }

  const existing = await prisma.kycSubmission.findFirst({
    where: { userId: auth.userId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
  })
  if (existing) {
    return NextResponse.json({ error: '您已有待审核的认证申请' }, { status: 400 })
  }

  const submission = await prisma.kycSubmission.create({
    data: {
      userId: auth.userId,
      idType,
      idFrontImage: idFrontImage.substring(0, 100),
      idBackImage: idBackImage?.substring(0, 100),
      selfieImage: selfieImage.substring(0, 100),
      status: 'SUBMITTED',
    },
  })

  await prisma.user.update({ where: { id: auth.userId }, data: { kycStatus: 'SUBMITTED' } })

  return NextResponse.json({ submission: { id: submission.id, status: submission.status } }, { status: 201 })
}
