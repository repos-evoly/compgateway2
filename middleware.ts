// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "ar",
});

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === "/") {
    url.pathname = "/ar";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
      match everything EXCEPT:
       - api
       - _next
       - auth
       - files with extensions (png, jpg, etc.)
    */
    "/((?!api|_next|auth|.*\\..*).*)",
  ],
};
