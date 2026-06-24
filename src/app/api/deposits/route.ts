import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TXN-${ts}-${rand}`
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const transactions = await prisma.transaction.findMany({
    where: { userId: auth.userId, type: 'DEPOSIT' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ transactions })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { kycStatus: true } })
  if (user?.kycStatus !== 'APPROVED') {
    return NextResponse.json({ error: '请先完成身份认证后再充值' }, { status: 403 })
  }

  const body = await request.json()
  const { amount, currency, cardId } = body

  if (!amount || !currency || !cardId) {
    return NextResponse.json({ error: '请填写完整的充值信息' }, { status: 400 })
  }

  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return NextResponse.json({ error: '充值金额必须大于0' }, { status: 400 })
  }
  if (numAmount > 100000) {
    return NextResponse.json({ error: '单笔充值不能超过100,000' }, { status: 400 })
  }

  const card = await prisma.bankCard.findFirst({ where: { id: cardId, userId: auth.userId, isActive: true } })
  if (!card) {
    return NextResponse.json({ error: '银行卡不存在' }, { status: 404 })
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: auth.userId,
      type: 'DEPOSIT',
      amount: numAmount,
      currency: currency.toUpperCase(),
      fee: 0,
      status: 'PENDING',
      referenceNo: generateRef(),
      paymentMethod: 'BANK_CARD',
      relatedCardId: cardId,
    },
  })

  simulateProcessing(transaction.id)

  return NextResponse.json({ transaction: { id: transaction.id, referenceNo: transaction.referenceNo, status: 'PENDING' } }, { status: 201 })
}

async function simulateProcessing(transactionId: string) {
  await new Promise((r) => setTimeout(r, 3000))
  await prisma.transaction.update({ where: { id: transactionId }, data: { status: 'PROCESSING' } })

  await new Promise((r) => setTimeout(r, 4000))
  const txn = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!txn || txn.status !== 'PROCESSING') return

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    await tx.wallet.upsert({
      where: { userId_currency: { userId: txn.userId, currency: txn.currency } },
      create: { userId: txn.userId, currency: txn.currency, balance: txn.amount },
      update: { balance: { increment: txn.amount } },
    })
  })
}
