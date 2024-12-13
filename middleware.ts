import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
});

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Force default locale for the root path (`/`)
  if (url.pathname === '/') {
    url.pathname = `/ar`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*'],
};
