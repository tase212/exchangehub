import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAdminToken, setAdminTokenCookie } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
  }

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin || !admin.isActive) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }

  const token = signAdminToken({ adminId: admin.id, email: admin.email, role: admin.role })
  const response = NextResponse.json({
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  })
  setAdminTokenCookie(response, token)
  return response
}
