import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API;

const COOKIE_NAMES = [
  "acceessToken",
  "accessToken",
  "refreshToken",
  "kycToken",
  "authSessionId",
] as const;

const COOKIE_PATHS = ["/Companygw", "/"] as const;
const COOKIE_SECURE = process.env.NEXT_PUBLIC_COOKIE_SECURE?.trim().toLowerCase() !== "false";

export function buildLogoutResponse() {
  const res = NextResponse.json({ success: true }, { status: 200 });

  COOKIE_NAMES.forEach((name) => {
    COOKIE_PATHS.forEach((path) => {
      res.cookies.set({
        name,
        value: "",
        path,
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: "lax",
        maxAge: 0,
      });
    });
  });

  return res;
}

function buildCookieHeader(req: NextRequest): string | undefined {
  const cookieNames = ["authDeviceId", "authSessionId"] as const;
  const cookies = cookieNames
    .map((name) => {
      const value = req.cookies.get(name)?.value;
      return value ? `${name}=${encodeURIComponent(value)}` : null;
    })
    .filter(Boolean);

  return cookies.length > 0 ? cookies.join("; ") : undefined;
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (AUTH_BASE && accessToken) {
    const cookieHeader = buildCookieHeader(req);

    try {
      await fetch(`${AUTH_BASE}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        cache: "no-store",
      });
    } catch {
      // Local cookies are still cleared so the browser leaves the authenticated area.
    }
  }

  return buildLogoutResponse();
}
