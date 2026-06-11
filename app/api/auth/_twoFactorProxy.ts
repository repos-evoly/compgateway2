import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API;

if (!AUTH_BASE) {
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

type TwoFactorResponse = {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  kycToken?: string;
  sessionId?: string;
  deviceId?: string;
  sessionExpiresAt?: string;
  heartbeatIntervalMinutes?: number;
  requiresTwoFactorEnable?: boolean;
  requiresTwoFactor?: boolean;
  [key: string]: unknown;
};

const AUTH_COOKIE_SECONDS = 60 * 180;
const DEVICE_COOKIE_SECONDS = 60 * 60 * 24 * 365;
const COOKIE_SECURE = process.env.NEXT_PUBLIC_COOKIE_SECURE?.trim().toLowerCase() !== "false";

const cookieConfig = {
  httpOnly: true as const,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: "/Companygw",
  maxAge: AUTH_COOKIE_SECONDS,
};

const deviceCookieConfig = {
  httpOnly: true as const,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: "/Companygw",
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

export async function handleTwoFactorVerification(
  req: NextRequest,
  endpoint: "verify-2fa" | "verify-initial-2fa"
): Promise<NextResponse> {
  const body = await req.text();
  const cookieHeader = buildCookieHeader(req);
  const forwardedHeaders = buildForwardedHeaders(req);

  const upstream = await fetch(`${AUTH_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...forwardedHeaders,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";

  if (!upstream.ok) {
    return new NextResponse(text || "Two-factor verification failed", {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  }

  let data: TwoFactorResponse = {};
  try {
    data = text ? (JSON.parse(text) as TwoFactorResponse) : {};
  } catch {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  }

  const res = NextResponse.json(data, { status: upstream.status });

  if (data.deviceId) {
    res.cookies.set("authDeviceId", data.deviceId, deviceCookieConfig);
  }

  if (
    data.accessToken &&
    data.refreshToken &&
    !data.requiresTwoFactor &&
    !data.requiresTwoFactorEnable
  ) {
    res.cookies.set("accessToken", data.accessToken, cookieConfig);
    res.cookies.set("refreshToken", data.refreshToken, cookieConfig);

    if (data.kycToken) {
      res.cookies.set("kycToken", data.kycToken, cookieConfig);
    }

    if (data.sessionId) {
      res.cookies.set("authSessionId", data.sessionId, cookieConfig);
    }
  }

  return res;
}
