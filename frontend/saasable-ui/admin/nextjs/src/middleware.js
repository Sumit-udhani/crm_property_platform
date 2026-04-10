import { NextResponse } from 'next/server'

export function middleware(request) {
  console.log("Midlleware triggered")
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname === '/login'||pathname === '/set-password'
  const isDashboard = pathname.startsWith('/dashboard')

  // No token + trying to access dashboard → go to login
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Has token + trying to access login → go to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/set-password']
}