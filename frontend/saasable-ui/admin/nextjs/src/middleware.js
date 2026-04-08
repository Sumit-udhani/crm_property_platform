import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = localStorage.getItem('token')
  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname=== '/login'
  const isDashboard =  pathname.startsWith('/dashboard')

  // ✅ No token + trying to access dashboard → go to login
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ✅ Has token + trying to access login → go to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login/:path*']
}