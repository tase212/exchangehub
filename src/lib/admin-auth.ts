import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'exchangehub-admin-secret-2024'
const COOKIE_NAME = 'exchangehub_admin_token'
const COOKIE_MAX_AGE = 8 * 60 * 60

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: string
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '8h' })
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminTokenPayload
  } catch {
    return null
  }
}

export function setAdminTokenCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearAdminTokenCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

export function getAdminFromRequest(request: NextRequest): AdminTokenPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyAdminToken(token)
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminTokenPayload | NextResponse> {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: '请先登录管理后台' }, { status: 401 })
  }

  const dbAdmin = await prisma.admin.findUnique({ where: { id: admin.adminId }, select: { isActive: true } })
  if (!dbAdmin || !dbAdmin.isActive) {
    return NextResponse.json({ error: '管理员账号已停用' }, { status: 403 })
  }

  return admin
}
