import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware — Performance-optimized
 * Only runs on protected routes, not on public pages or static assets.
 * Client-side AuthContext handles the actual auth check.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dashboard/admin routes — could add cookie-based auth check here
  // For now, client-side ProtectedRoute handles auth redirection
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // Placeholder for server-side auth check via cookie
    // const token = request.cookies.get('access_token')?.value;
    // if (!token) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// PERF: Only match routes that actually need middleware processing
// Skip all static assets, API routes, and public pages to reduce edge function invocations
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile',
    '/cooperative/manage/:path*',
  ],
};
