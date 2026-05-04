import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (session && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = profile?.role ?? 'homeowner';
    return NextResponse.redirect(new URL(ROLE_REDIRECTS[role] ?? '/dashboard/homeowner', request.url));
  }

  // Protect dashboard routes
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  if (isProtected && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = profile?.role ?? 'homeowner';
    const allowedPrefix = ROLE_REDIRECTS[role];

    // Admin can access everything
    if (role === 'admin' || role === 'qa_inspector') return response;

    // Check if user is accessing their correct portal
    if (!pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-.*\\.js).*)',
  ],
};
