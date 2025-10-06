/* ───────────── middleware.ts (Companygw-scoped, locale-aware) ───────────── */
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

/* ---------- Constants ---------- */
const BASE = "/Companygw";
const LOCALES = ["en", "ar"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "ar";

/* ---------- next-intl ---------- */
const intlMiddleware = createMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  // next-intl will operate only on paths we forward to it (below)
});

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  /* 0) Legacy rewrites (keep old links working)
        /auth/**         -> /Companygw/auth/**
        /(en|ar)/**      -> /Companygw/(en|ar)/**
  */
  if (pathname.startsWith("/auth/") || pathname === "/auth") {
    const to = `${BASE}${pathname}`;
    const next = NextResponse.rewrite(new URL(to, url));
    // Security headers for auth
    next.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'none'");
    next.headers.set("X-Frame-Options", "DENY");
    return next;
  }
  for (const l of LOCALES) {
    const prefix = `/${l}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const to = `${BASE}${pathname}`;
      return NextResponse.redirect(new URL(to, url));
    }
  }

  /* 1) Base landings
        "/"              -> "/Companygw/ar"
        "/Companygw"     -> "/Companygw/ar"
  */
  if (pathname === "/") {
    const to = `${BASE}/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(new URL(to, url));
  }
  if (pathname === BASE) {
    const to = `${BASE}/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(new URL(to, url));
  }

  /* 2) Auth guard only for localized app paths under /Companygw/(ar|en)
        – Do NOT guard /Companygw/auth/**
  */
  const isUnderBase = pathname === BASE || pathname.startsWith(`${BASE}/`);
  const isAuth = pathname === `${BASE}/auth` || pathname.startsWith(`${BASE}/auth/`);

  const isLocalePath =
    isUnderBase &&
    LOCALES.some((l) => pathname === `${BASE}/${l}` || pathname.startsWith(`${BASE}/${l}/`));

  if (isLocalePath) {
    const token = request.cookies.get("accessToken")?.value ?? "";
    if (!token) {
      return NextResponse.redirect(new URL(`${BASE}/auth/login`, url));
    }
  }

  /* 3) Run next-intl for localized app paths only; skip for auth */
  if (!isAuth && isLocalePath) {
    return intlMiddleware(request);
  }

  /* 4) Security headers for /Companygw/auth/** */
  if (isAuth) {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'none'");
    res.headers.set("X-Frame-Options", "DENY");
    return res;
  }

  /* 5) Everything else proceeds as-is */
  return NextResponse.next();
}

/* 6) Match everything except API, Next internals, and static assets.
      Include legacy roots so we can rewrite /auth/** and /(en|ar)/**. */
export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/:locale(en|ar)/:path*",
    "/Companygw",
    "/Companygw/:path*",
    "/((?!api|_next|.*\\..*).*)",
  ],
};
