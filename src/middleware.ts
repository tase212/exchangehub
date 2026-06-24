import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'zh', 'zh-HK', 'ja', 'ko']
const DEFAULT_LOCALE = 'zh'

function getLocale(request: NextRequest): string {
  const cookie = request.cookies.get('locale')?.value
  if (cookie && LOCALES.includes(cookie)) return cookie

  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    if (acceptLanguage.includes('zh-HK') || acceptLanguage.includes('zh-hk')) return 'zh-HK'
    if (acceptLanguage.includes('zh')) return 'zh'
    if (acceptLanguage.includes('ja')) return 'ja'
    if (acceptLanguage.includes('ko')) return 'ko'
    if (acceptLanguage.includes('en')) return 'en'
  }

  return DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (!hasLocale) {
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)'],
}
