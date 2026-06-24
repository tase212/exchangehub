import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof NextResponse) return auth

  return NextResponse.json({ admin: { adminId: auth.adminId, email: auth.email, role: auth.role } })
}
