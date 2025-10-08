/* ───────── middleware.ts (Companygw + locales, loop-proof) ───────── */
import { NextResponse, type NextRequest } from "next/server";

/* Config (keep BASE in sync with next.config basePath) */
const BASE: string = "/Companygw";

const LOCALES = ["en", "ar"] as const;

/* Build CSP connect-src allow list from env (include new backend domains) */
const connectSrcValues: Set<string> = (() => {
  const sources = new Set<string>(["'self'"]);

  const addOrigin = (value: string | undefined): void => {
    if (!value) return;
    try {
      const origin = new URL(value).origin;
      if (origin) sources.add(origin);
    } catch {
      /* ignore relative or invalid entries */
    }
  };

  const addCsvOrigins = (csv: string | undefined): void => {
    if (!csv) return;
    csv
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach(addOrigin);
  };

  addOrigin(process.env.NEXT_PUBLIC_BASE_API);
  addOrigin(process.env.NEXT_PUBLIC_AUTH_API);
  addOrigin(process.env.NEXT_PUBLIC_IMAGE_URL);
  addCsvOrigins(process.env.NEXT_PUBLIC_ALLOWED_URLS);

  return sources;
})();

const CONNECT_SRC_DIRECTIVE = Array.from(connectSrcValues).join(" ");

/* Helpers */
const isStatic = (p: string): boolean =>
  p === "/favicon.ico" ||
  /\.(?:js|mjs|css|map|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|json|pdf|woff2?|ttf|otf)$/i.test(p);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  /* 0) Bypass Next internals & static files */
  if (path.startsWith("/_next") || isStatic(path)) {
    return NextResponse.next();
  }

  /* 1) Health */
  if (path === "/api/health") {
    return new NextResponse("ok", { status: 200 });
  }

  /* 2) Landings: / and basePath → auth login */
  if (path === "/") {
    return NextResponse.redirect(new URL(`${BASE}/auth/login`, url));
  }

  /* 3) Auth zone is never guarded but gets security headers */
  if (path === "/auth" || path.startsWith("/auth/")) {
    const res = NextResponse.next();
    const cspParts = [
      "frame-ancestors 'none'",
      "base-uri 'none'",
      CONNECT_SRC_DIRECTIVE ? `connect-src ${CONNECT_SRC_DIRECTIVE}` : "",
    ].filter(Boolean);

    res.headers.set("Content-Security-Policy", cspParts.join("; "));
    res.headers.set("X-Frame-Options", "DENY");
    return res;
  }

  /* 4) Only guard localized app paths: /(en|ar)/** */
  const isLocalePath =
    path.startsWith("/en/") ||
    path === "/en" ||
    path.startsWith("/ar/") ||
    path === "/ar";

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
