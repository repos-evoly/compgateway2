/* ───────────── middleware.ts  COMPLETE ───────────── */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

/* next-intl locale detection */
const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* 1️⃣  Redirect “/” → “/ar” */
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/ar';
    return NextResponse.redirect(url);
  }

  /* 2️⃣  Auth-guard for locale routes */
  if (pathname.startsWith('/ar') || pathname.startsWith('/en')) {
    const token = request.cookies.get('accessToken')?.value || '';
    if (!token)
      return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  /* 3️⃣  Run next-intl middleware */
  const res = intlMiddleware(request);

  /* 4️⃣  🔐  ONLY for /auth pages: add nonce + strict CSP  */
  if (pathname.startsWith('/auth')) {
    const nonce = crypto.randomUUID(); // Edge-runtime safe

    res.headers.set('x-nonce', nonce);
    res.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'none'",
      ].join('; ')
    );
  }

  return res;
}

/* 5️⃣  Apply to everything except api, _next, auth assets, static files */
export const config = {
  matcher: ['/((?!api|_next|auth|.*\\..*).*)'],
};
