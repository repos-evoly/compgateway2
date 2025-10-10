import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API;

if (!AUTH_BASE) {
  throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
}

type TwoFactorResponse = {
  accessToken?: string;
  refreshToken?: string;
  kycToken?: string;
  requiresTwoFactorEnable?: boolean;
  requiresTwoFactor?: boolean;
  [key: string]: unknown;
};

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const cookieConfig = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: "lax" as const,
  path: "/Companygw",
  maxAge: ONE_WEEK_SECONDS,
};

export async function handleTwoFactorVerification(
  req: NextRequest,
  endpoint: "verify-2fa" | "verify-initial-2fa"
): Promise<NextResponse> {
  const body = await req.text();

  const upstream = await fetch(`${AUTH_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  }

  return res;
}
