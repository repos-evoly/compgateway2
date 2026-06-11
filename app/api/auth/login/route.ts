import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API; 
// e.g. https://compgw.backend.bcd.ly/compauthapi/api/auth

if (!AUTH_BASE) {
  // Fail fast at boot if misconfigured
  // (Next will throw at import time in dev)
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

type UpstreamLoginResponse = {
  success?: boolean;
  requiresTwoFactorEnable?: boolean;
  requiresTwoFactor?: boolean;
  accessToken?: string;
  refreshToken?: string;
  kycToken?: string;
  sessionId?: string;
  deviceId?: string;
  sessionExpiresAt?: string;
  heartbeatIntervalMinutes?: number;
  // optionally any extra fields your backend returns
};

const COMPANY_BASE_PATH = "/Companygw";
const AUTH_COOKIE_SECONDS = 60 * 180;
const DEVICE_COOKIE_SECONDS = 60 * 60 * 24 * 365;
const COOKIE_SECURE = process.env.NEXT_PUBLIC_COOKIE_SECURE?.trim().toLowerCase() !== "false";

const authCookieConfig = {
  httpOnly: true as const,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: COMPANY_BASE_PATH,
  maxAge: AUTH_COOKIE_SECONDS,
};

const deviceCookieConfig = {
  httpOnly: true as const,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: COMPANY_BASE_PATH,
  maxAge: DEVICE_COOKIE_SECONDS,
};

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

function buildForwardedHeaders(req: NextRequest): Record<string, string> {
  const forwardedHeaders: Record<string, string> = {};
  const headerNames = ["x-forwarded-for", "x-real-ip", "forwarded"] as const;

  for (const name of headerNames) {
    const value = req.headers.get(name);
    if (value) {
      forwardedHeaders[name] = value;
    }
  }

  return forwardedHeaders;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const cookieHeader = buildCookieHeader(req);
  const forwardedHeaders = buildForwardedHeaders(req);

  const upstream = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...forwardedHeaders,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body,
  });

  const text = await upstream.text();

  // Pass through error statuses directly
  if (!upstream.ok) {
    return new NextResponse(text || "Login failed", {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "text/plain" },
    });
  }

  let data: UpstreamLoginResponse = {};
  try {
    data = text ? (JSON.parse(text) as UpstreamLoginResponse) : {};
  } catch {
    // if backend returns non-JSON 200 (unlikely), just pass it back
  }

  const res = NextResponse.json(data, { status: 200 });

  if (data.deviceId) {
    res.cookies.set("authDeviceId", data.deviceId, deviceCookieConfig);
  }

  // Set tokens as HttpOnly cookies if present and no 2FA gate
  if (data.accessToken && data.refreshToken && data.kycToken && !data.requiresTwoFactor && !data.requiresTwoFactorEnable) {
    res.cookies.set("accessToken", data.accessToken, authCookieConfig);
    res.cookies.set("refreshToken", data.refreshToken, authCookieConfig);
    res.cookies.set("kycToken", data.kycToken, authCookieConfig);

    if (data.sessionId) {
      res.cookies.set("authSessionId", data.sessionId, authCookieConfig);
    }
  }

  return res;
}
