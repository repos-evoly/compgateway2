// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

/**
 * 1) We create the next-intl middleware for locale detection.
 */
const intlMiddleware = createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "ar",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2) If user hits "/", redirect to "/ar"
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/ar";
    return NextResponse.redirect(url);
  }

  /**
   * 3) If the path starts with "/ar" or "/en", check for the "accessToken" cookie.
   *    If missing or invalid format => redirect to "/auth/login"
   */
  if (pathname.startsWith("/ar") || pathname.startsWith("/en")) {
    const token = request.cookies.get("accessToken")?.value || "";

    // For example, if we want "Bearer X" format:
    if (!token) {
      // Note: "new URL('/auth/login', request.url)" => keeps the same origin
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // If you just need it to be non-empty, omit the "startsWith" check.
    // e.g.: if (!token) => redirect
  }

  // 4) If above checks pass => run the next-intl middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  /**
   * 5) We match everything EXCEPT:
   *    - api
   *    - _next
   *    - auth
   *    - any files with extensions (png, jpg, etc.)
   */
  matcher: ["/((?!api|_next|auth|.*\\..*).*)"],
};
