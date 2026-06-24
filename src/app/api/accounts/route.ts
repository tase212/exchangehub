import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: auth.userId, isActive: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, accountLast4: true, routingCode: true, bankName: true, accountHolder: true, country: true, currency: true, isDefault: true },
  })

  return NextResponse.json({ accounts })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { accountNumber, routingCode, bankName, accountHolder, country, currency } = body

  if (!accountNumber || !bankName || !accountHolder || !country || !currency) {
    return NextResponse.json({ error: '请填写完整的银行账户信息' }, { status: 400 })
  }

  const cleaned = accountNumber.replace(/\s/g, '')
  if (cleaned.length < 6) {
    return NextResponse.json({ error: '无效的账户号码' }, { status: 400 })
  }

  const last4 = cleaned.slice(-4)

  const existing = await prisma.bankAccount.findFirst({
    where: { userId: auth.userId, accountLast4: last4, bankName, isActive: true },
  })
  if (existing) {
    return NextResponse.json({ error: '此银行账户已添加' }, { status: 400 })
  }

  const count = await prisma.bankAccount.count({ where: { userId: auth.userId, isActive: true } })

  const account = await prisma.bankAccount.create({
    data: {
      userId: auth.userId,
      accountLast4: last4,
      routingCode: routingCode || null,
      bankName,
      accountHolder,
      country,
      currency,
      isDefault: count === 0,
    },
    select: { id: true, accountLast4: true, routingCode: true, bankName: true, accountHolder: true, country: true, currency: true, isDefault: true },
  })

  return NextResponse.json({ account }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('id')
  if (!accountId) {
    return NextResponse.json({ error: '缺少账户ID' }, { status: 400 })
  }

  const account = await prisma.bankAccount.findFirst({ where: { id: accountId, userId: auth.userId } })
  if (!account) {
    return NextResponse.json({ error: '银行账户不存在' }, { status: 404 })
  }

  await prisma.bankAccount.update({ where: { id: accountId }, data: { isActive: false } })

  return NextResponse.json({ message: '已删除' })
}
