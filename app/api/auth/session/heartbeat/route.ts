import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API;

if (!AUTH_BASE) {
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

const COOKIE_SECURE = process.env.NEXT_PUBLIC_COOKIE_SECURE?.trim().toLowerCase() !== "false";

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

function clearAuthCookies(res: NextResponse): void {
  const cookieNames = ["accessToken", "refreshToken", "kycToken", "authSessionId"] as const;
  const paths = ["/Companygw", "/"] as const;

  cookieNames.forEach((name) => {
    paths.forEach((path) => {
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
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    const res = NextResponse.json(
      {
        success: false,
        status: 401,
        code: "AUTH_SESSION_MISSING",
        message: "Authentication session is missing.",
      },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }

  const cookieHeader = buildCookieHeader(req);
  const upstream = await fetch(`${AUTH_BASE}/session/heartbeat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";
  let parsed: { success?: boolean } | null = null;
  try {
    parsed = text ? (JSON.parse(text) as { success?: boolean }) : null;
  } catch {
    parsed = null;
  }

  const res = new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });

  if (!upstream.ok || parsed?.success === false) {
    clearAuthCookies(res);
  }

  return res;
}
