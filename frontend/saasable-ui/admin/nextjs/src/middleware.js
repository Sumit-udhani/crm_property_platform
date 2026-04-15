import { NextResponse } from 'next/server'

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
   
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; 
  }
}

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/set-password'

  const isDashboard = pathname.startsWith('/dashboard')


  const isValidToken = token && !isTokenExpired(token);

  
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(isValidToken ? '/dashboard' : '/login', request.url)
    )
  }


  if (isDashboard && !isValidToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
   
    return response;
  }


  if (isAuthPage && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/forgot-password', '/set-password']
}