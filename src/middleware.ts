import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseAuthToken')?.value;
  const role = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protect dashboard routes if no auth token is present -> redirect to /login
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Reader user trying to access admin dashboard routes -> Redirect to /dashboard/profile
  if (role === 'user' && pathname.startsWith('/dashboard') && pathname !== '/dashboard/profile') {
    return NextResponse.redirect(new URL('/dashboard/profile', request.url));
  }

  // 3. Prevent landing on dead-end /no-access page
  if (pathname === '/no-access') {
    return NextResponse.redirect(new URL(token ? '/dashboard/profile' : '/login', request.url));
  }

  // 4. Authenticated users and admin/editor/superadmin routes are allowed
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/no-access'],
};
