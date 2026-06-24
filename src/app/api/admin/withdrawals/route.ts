import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AWD-${ts}-${rand}`
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const withdrawals = await prisma.adminWithdrawal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const settled = await prisma.commission.aggregate({ _sum: { amount: true }, where: { status: 'SETTLED' } })
  const withdrawn = await prisma.adminWithdrawal.aggregate({ _sum: { amount: true }, where: { status: { in: ['COMPLETED', 'PENDING', 'PROCESSING'] } } })

  const available = (settled._sum.amount || 0) - (withdrawn._sum.amount || 0)

  return NextResponse.json({ withdrawals, availableBalance: Math.max(0, available) })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { amount, currency, bankName, accountLast4, accountHolder } = body

  if (!amount || !currency || !bankName || !accountLast4 || !accountHolder) {
    return NextResponse.json({ error: '请填写完整的提现信息' }, { status: 400 })
  }

  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return NextResponse.json({ error: '提现金额必须大于0' }, { status: 400 })
  }

  const settled = await prisma.commission.aggregate({ _sum: { amount: true }, where: { status: 'SETTLED', currency } })
  const withdrawn = await prisma.adminWithdrawal.aggregate({ _sum: { amount: true }, where: { status: { in: ['COMPLETED', 'PENDING', 'PROCESSING'] }, currency } })

  const available = (settled._sum.amount || 0) - (withdrawn._sum.amount || 0)
  if (numAmount > available) {
    return NextResponse.json({ error: `可用余额不足: ${available.toFixed(2)} ${currency}` }, { status: 400 })
  }

  const withdrawal = await prisma.adminWithdrawal.create({
    data: {
      adminId: auth.adminId,
      amount: numAmount,
      currency,
      bankName,
      accountLast4,
      accountHolder,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ withdrawal }, { status: 201 })
}
