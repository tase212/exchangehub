import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true, username: true, email: true,
        phone: true, avatar: true, kycStatus: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { username, phone, avatar, currentPassword, newPassword } = body

    const data: any = {}

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing && existing.id !== auth.userId) {
        return NextResponse.json({ error: '用户名已被使用' }, { status: 400 })
      }
      data.username = username
    }

    if (phone !== undefined) data.phone = phone
    if (avatar !== undefined) data.avatar = avatar

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: '请输入当前密码' }, { status: 400 })
      }
      const user = await prisma.user.findUnique({ where: { id: auth.userId } })
      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: '新密码长度至少8位' }, { status: 400 })
      }
      data.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: '没有要更新的字段' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data,
      select: {
        id: true, username: true, email: true,
        phone: true, avatar: true, kycStatus: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
