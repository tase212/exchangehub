import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  return NextResponse.json({ admin: { adminId: auth.adminId, email: auth.email, role: auth.role } })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: '请填写当前密码和新密码' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: '新密码至少6个字符' }, { status: 400 })
  }

  const admin = await prisma.admin.findUnique({ where: { id: auth.adminId } })
  if (!admin) return NextResponse.json({ error: '管理员不存在' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash)
  if (!valid) return NextResponse.json({ error: '当前密码错误' }, { status: 400 })

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.admin.update({ where: { id: auth.adminId }, data: { passwordHash } })

  return NextResponse.json({ message: '密码修改成功' })
}
