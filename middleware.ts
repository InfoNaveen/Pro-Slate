import { NextResponse, type NextRequest } from 'next/server';

const ROLE_REDIRECTS: Record<string, string> = {
  homeowner: '/dashboard/homeowner',
  b2b_client: '/dashboard/b2b',
  worker: '/dashboard/worker',
  admin: '/dashboard/admin',
  qa_inspector: '/dashboard/admin',
};

const PROTECTED_PREFIXES = [
  '/dashboard/homeowner',
  '/dashboard/b2b',
  '/dashboard/worker',
  '/dashboard/admin',
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });
  
  const mockAuth = request.cookies.get('mock_auth')?.value;
  const mockRole = request.cookies.get('mock_role')?.value ?? 'homeowner';
  
  const pathname = request.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (mockAuth && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS[mockRole] ?? '/dashboard/homeowner', request.url));
  }

  // Protect dashboard routes
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !mockAuth) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  if (isProtected && mockAuth) {
    const allowedPrefix = ROLE_REDIRECTS[mockRole];

    // Admin can access everything
    if (mockRole === 'admin' || mockRole === 'qa_inspector') return response;

    // Check if user is accessing their correct portal
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-.*\\.js|api).*)',
  ],
};
