import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const sessionToken =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');

  // Allow unauthenticated users to browse problems list and individual problem pages.
  // Block them from the attempt/solve pages.
  const isAttemptPage = pathname.includes('/attempt');

  if (!sessionToken && isAttemptPage) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/problems/:path*', '/attempts/:path*'],
};
