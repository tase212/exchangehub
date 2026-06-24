import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, newPassword } = body

    if (!email || !newPassword) {
      return NextResponse.json({ error: '请填写邮箱和新密码' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: '密码长度至少8位' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { message: '如果该邮箱已注册，密码重置邮件已发送' }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ message: '密码已重置' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
