import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const cards = await prisma.bankCard.findMany({
    where: { userId: auth.userId, isActive: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, cardLast4: true, cardholder: true, expiryMonth: true, expiryYear: true, brand: true, bankName: true, isDefault: true },
  })

  return NextResponse.json({ cards })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { cardNumber, cardholder, expiryMonth, expiryYear, bankName } = body

  if (!cardNumber || !cardholder || !expiryMonth || !expiryYear) {
    return NextResponse.json({ error: '请填写完整的卡片信息' }, { status: 400 })
  }

  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) {
    return NextResponse.json({ error: '无效的卡号' }, { status: 400 })
  }

  const last4 = cleaned.slice(-4)
  let brand = 'UNKNOWN'
  if (cleaned.startsWith('4')) brand = 'VISA'
  else if (cleaned.startsWith('5') || cleaned.startsWith('2')) brand = 'MASTERCARD'
  else if (cleaned.startsWith('3')) brand = 'AMEX'

  const existingCard = await prisma.bankCard.findFirst({
    where: { userId: auth.userId, cardLast4: last4, brand, isActive: true },
  })
  if (existingCard) {
    return NextResponse.json({ error: '此卡已添加' }, { status: 400 })
  }

  const cardCount = await prisma.bankCard.count({ where: { userId: auth.userId, isActive: true } })

  const card = await prisma.bankCard.create({
    data: {
      userId: auth.userId,
      cardLast4: last4,
      cardholder,
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      brand,
      bankName: bankName || null,
      isDefault: cardCount === 0,
    },
    select: { id: true, cardLast4: true, cardholder: true, expiryMonth: true, expiryYear: true, brand: true, bankName: true, isDefault: true },
  })

  return NextResponse.json({ card }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get('id')
  if (!cardId) {
    return NextResponse.json({ error: '缺少卡片ID' }, { status: 400 })
  }

  const card = await prisma.bankCard.findFirst({ where: { id: cardId, userId: auth.userId } })
  if (!card) {
    return NextResponse.json({ error: '卡片不存在' }, { status: 404 })
  }

  await prisma.bankCard.update({ where: { id: cardId }, data: { isActive: false } })

  return NextResponse.json({ message: '已删除' })
}
