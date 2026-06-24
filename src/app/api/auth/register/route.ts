import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, setTokenCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_CURRENCIES = ['CNY', 'HKD', 'USD']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码长度至少8位' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '邮箱或用户名已被注册' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        wallets: {
          createMany: {
            data: DEFAULT_CURRENCIES.map((currency) => ({
              currency,
              balance: 0,
            })),
          },
        },
      },
    })

    const token = signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })

    setTokenCookie(response, token)

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
