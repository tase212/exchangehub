import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const alerts = await prisma.rateAlert.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Fetch alerts error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { fromCurrency, toCurrency, targetRate, isAbove } = body

    if (!fromCurrency || !toCurrency || !targetRate) {
      return NextResponse.json({ error: '请填写必填字段' }, { status: 400 })
    }

    const alert = await prisma.rateAlert.create({
      data: {
        userId: auth.userId,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        targetRate: parseFloat(targetRate),
        isAbove: isAbove !== undefined ? isAbove : true,
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 })
    }

    const alert = await prisma.rateAlert.findUnique({ where: { id } })

    if (!alert || alert.userId !== auth.userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    await prisma.rateAlert.delete({ where: { id } })

    return NextResponse.json({ message: '已删除' })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
