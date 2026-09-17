import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  clearCookieAtAllAuthPaths,
} from "@/app/api/_lib/authCookies";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API;

export function buildLogoutResponse() {
  const res = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookies(res);
  clearCookieAtAllAuthPaths(res, "acceessToken");

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
