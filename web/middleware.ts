import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProblemListOrDetail = pathname === '/problems' || /^\/problems\/[^/]+$/.test(pathname);

  const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
  
  if (!sessionToken) {
    if (isProblemListOrDetail) {
      return NextResponse.next();
    }
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const res = await fetch(`${SERVER_URL}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      }
    });
    
    if (res.ok) {
      const session = await res.json();
      // Email verification disabled, no redirect needed
    }
  } catch (error) {
    console.error("Middleware session check failed", error);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/problems/:path*', '/attempts/:path*', '/problems', '/attempts'],
};
