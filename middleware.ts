/* ───────────── middleware.ts  FINAL & STABLE ───────────── */
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

/* ---------- i18n ---------- */
const intlMiddleware = createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "ar",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* 1️⃣  “/” → “/ar” */
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/ar";
    return NextResponse.redirect(url);
  }

  /* 2️⃣  Auth-guard for locale routes */
  if (pathname.startsWith("/ar") || pathname.startsWith("/en")) {
    const token = request.cookies.get("accessToken")?.value || "";
    if (!token)
      return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  /* 3️⃣  Build response
         – Skip next-intl on /auth so we avoid locale-redirect loops. */
  const res = pathname.startsWith("/auth")
    ? NextResponse.next()
    : intlMiddleware(request);

  /* 4️⃣  Security headers for /auth pages only: deny framing */
  if (pathname.startsWith("/auth")) {
    res.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'none'");
    res.headers.set("X-Frame-Options", "DENY");
  }

  return res;
}

/* 5️⃣  Run on everything except API routes, Next.js internals & static assets */
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
