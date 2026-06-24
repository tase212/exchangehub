import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const existing = await prisma.admin.findUnique({ where: { email: 'admin@exchangehub.com' } })
  if (existing) {
    return NextResponse.json({ error: '管理员账号已存在', email: 'admin@exchangehub.com' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash('admin123', 12)
  await prisma.admin.create({
    data: {
      email: 'admin@exchangehub.com',
      passwordHash,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN',
    },
  })

  return NextResponse.json({ message: '管理员账号创建成功', email: 'admin@exchangehub.com', password: 'admin123' })
}
