import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WTH-${ts}-${rand}`
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const transactions = await prisma.transaction.findMany({
    where: { userId: auth.userId, type: 'WITHDRAWAL' },
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
    return NextResponse.json({ error: '请先完成身份认证后再提现' }, { status: 403 })
  }

  const body = await request.json()
  const { amount, currency, bankAccountId } = body

  if (!amount || !currency || !bankAccountId) {
    return NextResponse.json({ error: '请填写完整的提现信息' }, { status: 400 })
  }

  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return NextResponse.json({ error: '提现金额必须大于0' }, { status: 400 })
  }

  const account = await prisma.bankAccount.findFirst({ where: { id: bankAccountId, userId: auth.userId, isActive: true } })
  if (!account) {
    return NextResponse.json({ error: '银行账户不存在' }, { status: 404 })
  }

  const wallet = await prisma.wallet.findFirst({ where: { userId: auth.userId, currency: currency.toUpperCase() } })
  const availableBalance = wallet ? wallet.balance - wallet.frozenBalance : 0

  const fee = Math.max(numAmount * 0.005, 1)
  const totalDeduction = numAmount + fee

  if (availableBalance < totalDeduction) {
    return NextResponse.json({
      error: `余额不足。可用余额: ${availableBalance.toFixed(2)} ${currency}，需要: ${totalDeduction.toFixed(2)} ${currency}（含手续费 ${fee.toFixed(2)}）`,
    }, { status: 400 })
  }

  const transaction = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId_currency: { userId: auth.userId, currency: currency.toUpperCase() } },
      data: { frozenBalance: { increment: totalDeduction } },
    })

    return tx.transaction.create({
      data: {
        userId: auth.userId,
        type: 'WITHDRAWAL',
        amount: numAmount,
        currency: currency.toUpperCase(),
        fee,
        status: 'PENDING',
        referenceNo: generateRef(),
        paymentMethod: 'BANK_TRANSFER',
        relatedAccountId: bankAccountId,
      },
    })
  })

  simulateWithdrawalProcessing(transaction.id, auth.userId, currency.toUpperCase(), totalDeduction)

  return NextResponse.json({ transaction: { id: transaction.id, referenceNo: transaction.referenceNo, status: 'PENDING', fee } }, { status: 201 })
}

async function simulateWithdrawalProcessing(transactionId: string, userId: string, currency: string, totalDeduction: number) {
  await new Promise((r) => setTimeout(r, 3000))
  await prisma.transaction.update({ where: { id: transactionId }, data: { status: 'PROCESSING' } })

  await new Promise((r) => setTimeout(r, 5000))
  const txn = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!txn || txn.status !== 'PROCESSING') return

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    await tx.wallet.update({
      where: { userId_currency: { userId, currency } },
      data: { balance: { decrement: totalDeduction }, frozenBalance: { decrement: totalDeduction } },
    })
  })
}
