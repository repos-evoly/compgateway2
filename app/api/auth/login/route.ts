import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  deviceCookieConfig,
  setCanonicalAuthCookies,
} from "@/app/api/_lib/authCookies";
import { isRecoveryBrowserKey, recoveryBrowserCookie, recoveryBrowserHeader, recoveryCookieConfig, recoveryProofCookie } from "../_authenticatorRecovery";

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
  webRecoveryProof?: string;
  // optionally any extra fields your backend returns
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
  const existingBrowserKey = req.cookies.get(recoveryBrowserCookie)?.value;
  const browserKey = isRecoveryBrowserKey(existingBrowserKey) ? existingBrowserKey : randomBytes(32).toString("hex");

  const upstream = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    redirect: "error",
    headers: {
      "Content-Type": "application/json",
      [recoveryBrowserHeader]: browserKey,
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

  const { webRecoveryProof, ...publicData } = data;
  const recoveryAttempt = data.requiresTwoFactor === true && typeof webRecoveryProof === "string" && webRecoveryProof.length <= 2048 && webRecoveryProof.length > 0
    ? randomBytes(16).toString("hex") : undefined;
  const res = NextResponse.json({ ...publicData, recoveryAttempt }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  if (recoveryAttempt) {
    res.cookies.set(recoveryBrowserCookie, browserKey, recoveryCookieConfig);
    res.cookies.set(recoveryProofCookie, `${recoveryAttempt}.${webRecoveryProof}`, { ...recoveryCookieConfig, maxAge: 300 });
  } else {
    res.cookies.set(recoveryProofCookie, "", { ...recoveryCookieConfig, maxAge: 0 });
  }

  if (data.deviceId) {
    res.cookies.set("authDeviceId", data.deviceId, deviceCookieConfig);
  }

  // Set tokens as HttpOnly cookies if present and no 2FA gate
  if (data.accessToken && data.refreshToken && data.kycToken && !data.requiresTwoFactor && !data.requiresTwoFactorEnable) {
    setCanonicalAuthCookies(res, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      kycToken: data.kycToken,
      authSessionId: data.sessionId,
    });
  }

  return res;
}
