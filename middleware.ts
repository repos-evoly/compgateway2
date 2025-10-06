/* ───────── middleware.ts (Companygw + locales, loop-proof) ───────── */
import { NextResponse, type NextRequest } from "next/server";

/* Config (keep BASE in sync with next.config basePath) */
const BASE: string = "/Companygw";
const LOCALES = ["en", "ar"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "ar";

/* Helpers */
const isStatic = (p: string): boolean =>
  p === "/favicon.ico" ||
  p === `${BASE}/favicon.ico` ||
  /\.(?:js|mjs|css|map|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|json|pdf|woff2?|ttf|otf)$/i.test(p);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  /* 0) Bypass Next internals & static files (also under /Companygw) */
  if (path.startsWith("/_next") || path.startsWith(`${BASE}/_next`) || isStatic(path)) {
    return NextResponse.next();
  }

  /* 1) Health */
  if (path === "/api/health" || path === `${BASE}/api/health`) {
    return new NextResponse("ok", { status: 200 });
  }

  /* 2) Landings: / and /Companygw → /Companygw/ar */
  if (path === "/") {
    return NextResponse.redirect(new URL(`${BASE}/${DEFAULT_LOCALE}`, url));
  }
  if (path === BASE) {
    return NextResponse.redirect(new URL(`${BASE}/${DEFAULT_LOCALE}`, url));
  }

  /* 3) Auth zone is never guarded but gets security headers */
  if (path === `${BASE}/auth` || path.startsWith(`${BASE}/auth/`)) {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'none'");
    res.headers.set("X-Frame-Options", "DENY");
    return res;
  }

  /* 4) Only guard localized app paths: /Companygw/(en|ar)/** */
  const isLocalePath =
    path.startsWith(`${BASE}/en/`) ||
    path === `${BASE}/en` ||
    path.startsWith(`${BASE}/ar/`) ||
    path === `${BASE}/ar`;

  if (isLocalePath) {
    const token = request.cookies.get("accessToken")?.value ?? "";
    if (!token) {
      return NextResponse.redirect(new URL(`${BASE}/auth/login`, url));
    }
    return NextResponse.next();
  }

  /* 5) Everything else passes through (e.g., legacy or non-scoped routes in dev) */
  return NextResponse.next();
}

/* 6) Explicit matcher (no template strings; avoids touching _next & files by logic above) */
export const config = {
  matcher: [
    "/",                 // root → redirect to /Companygw/ar
    "/api/health",       // health probe
    "/Companygw",        // base landing → /Companygw/ar
    "/Companygw/:path*", // all app routes under basePath
  ],
};
