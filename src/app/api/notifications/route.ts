import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  const where: any = { userId: auth.userId }
  if (unreadOnly) where.read = false

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId: auth.userId, read: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: auth.userId, read: false },
      data: { read: true },
    })
    return NextResponse.json({ message: '已全部标记为已读' })
  }

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: auth.userId },
      data: { read: true },
    })
    return NextResponse.json({ message: '已标记为已读' })
  }

  return NextResponse.json({ error: '缺少参数' }, { status: 400 })
}
