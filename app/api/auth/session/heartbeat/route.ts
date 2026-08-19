import { NextRequest, NextResponse } from "next/server";
import {
  classifySessionHeartbeat,
  type SessionHeartbeatPayload,
} from "@/app/lib/sessionHeartbeat";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API;

if (!AUTH_BASE) {
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

const COOKIE_SECURE = process.env.NEXT_PUBLIC_COOKIE_SECURE?.trim().toLowerCase() !== "false";
const UPSTREAM_TIMEOUT_MS = 10_000;

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
  const secureAttribute = COOKIE_SECURE ? "; Secure" : "";

  cookieNames.forEach((name) => {
    paths.forEach((path) => {
      res.headers.append(
        "Set-Cookie",
        `${name}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secureAttribute}`
      );
    });
  });
}

function parseHeartbeatPayload(text: string): SessionHeartbeatPayload | null {
  if (!text) return null;

  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as SessionHeartbeatPayload)
      : null;
  } catch {
    return null;
  }
}

function transientHeartbeatResponse(
  payload: SessionHeartbeatPayload | null,
  fallbackStatus = 503
): NextResponse {
  const normalizedFallbackStatus = fallbackStatus >= 400 ? fallbackStatus : 503;
  const reportedStatus =
    typeof payload?.status === "number" && payload.status >= 400
      ? payload.status
      : normalizedFallbackStatus;

  return NextResponse.json(
    {
      ...(payload ?? {}),
      success: false,
      status: reportedStatus,
      code: payload?.code ?? "AUTH_HEARTBEAT_UNAVAILABLE",
      message:
        payload?.message ??
        "The authentication service is temporarily unavailable.",
      sessionInvalid: false,
      transient: true,
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
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
        sessionInvalid: true,
        transient: false,
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
    clearAuthCookies(res);
    return res;
  }

  const cookieHeader = buildCookieHeader(req);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let upstream: Response | null = null;
  let text: string;

  try {
    upstream = await fetch(`${AUTH_BASE}/session/heartbeat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
    text = await upstream.text();
  } catch {
    return transientHeartbeatResponse(null, upstream?.status);
  } finally {
    clearTimeout(timeout);
  }

  const parsed = parseHeartbeatPayload(text);
  const heartbeatResult = classifySessionHeartbeat(upstream.status, parsed);

  if (heartbeatResult === "invalid") {
    const res = NextResponse.json(
      {
        ...(parsed ?? {}),
        success: false,
        status: 401,
        code: parsed?.code ?? "AUTH_SESSION_EXPIRED",
        sessionInvalid: true,
        transient: false,
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
    clearAuthCookies(res);
    return res;
  }

  if (heartbeatResult === "transient") {
    return transientHeartbeatResponse(parsed, upstream.status);
  }

  return NextResponse.json(
    {
      ...parsed,
      sessionInvalid: false,
      transient: false,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
