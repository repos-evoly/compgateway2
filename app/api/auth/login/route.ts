import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API; 
// e.g. https://compgw.backend.bcd.ly/compauthapi/api/auth

if (!AUTH_BASE) {
  // Fail fast at boot if misconfigured
  // (Next will throw at import time in dev)
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

type UpstreamLoginResponse = {
  requiresTwoFactorEnable?: boolean;
  requiresTwoFactor?: boolean;
  accessToken?: string;
  refreshToken?: string;
  kycToken?: string;
  // optionally any extra fields your backend returns
};

export async function POST(req: NextRequest) {
  const body = await req.text();

  const upstream = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  // Set tokens as HttpOnly cookies if present and no 2FA gate
  if (data.accessToken && data.refreshToken && data.kycToken && !data.requiresTwoFactor && !data.requiresTwoFactorEnable) {
    const week = 60 * 60 * 24 * 7;
    const cookieCommon = {
      httpOnly: true as const,
      secure: true as const, // HTTPS only
      sameSite: "lax" as const,
      path: "/Companygw", // your basePath
      maxAge: week,
    };

    res.cookies.set("accessToken", data.accessToken, cookieCommon);
    res.cookies.set("refreshToken", data.refreshToken, cookieCommon);
    res.cookies.set("kycToken", data.kycToken, cookieCommon);
  }

  return res;
}
