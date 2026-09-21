import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseAuthToken');
  const { pathname } = request.nextUrl;

  // Si el usuario intenta acceder a cualquier página del dashboard y no hay token de autenticación,
  // redirigirlo a la página de inicio de sesión.
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario ha iniciado sesión e intenta acceder a login/forgot-password,
  // redirigirlo al dashboard.
  if (token && (pathname === '/login' || pathname === '/forgot-password')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/articles', request.url));
  }

  // Redirigir desde /no-access si el usuario no ha iniciado sesión
  if (!token && pathname === '/no-access') {
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/login', '/forgot-password', '/no-access'],
};
