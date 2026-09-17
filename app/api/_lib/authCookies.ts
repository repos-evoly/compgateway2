import { NextResponse } from "next/server";

export const COMPANY_GATEWAY_COOKIE_PATH = "/Companygw";

const AUTH_COOKIE_SECONDS = 60 * 180;
const DEVICE_COOKIE_SECONDS = 60 * 60 * 24 * 365;
const COOKIE_SECURE =
  process.env.NEXT_PUBLIC_COOKIE_SECURE?.trim().toLowerCase() !== "false";

export const authCookieConfig = {
  httpOnly: true as const,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: COMPANY_GATEWAY_COOKIE_PATH,
  maxAge: AUTH_COOKIE_SECONDS,
};

export const deviceCookieConfig = {
  httpOnly: true as const,
  secure: COOKIE_SECURE,
  sameSite: "lax" as const,
  path: COMPANY_GATEWAY_COOKIE_PATH,
  maxAge: DEVICE_COOKIE_SECONDS,
};

export type AuthCookieValues = {
  accessToken?: string;
  refreshToken?: string;
  kycToken?: string;
  authSessionId?: string;
};

const authCookieNames = [
  "accessToken",
  "refreshToken",
  "kycToken",
  "authSessionId",
] as const;

type AuthCookieName = (typeof authCookieNames)[number];

function expireCookie(
  response: NextResponse,
  name: string,
  path: string,
): void {
  response.cookies.set({
    name,
    value: "",
    path,
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    maxAge: 0,
  });
}

export function setCanonicalAuthCookies(
  response: NextResponse,
  values: AuthCookieValues,
): void {
  for (const [name, value] of Object.entries(values) as [
    AuthCookieName,
    string | undefined,
  ][]) {
    if (!value) continue;

    // Previous refresh code wrote auth cookies at `/`. Remove those copies
    // before issuing the canonical `/Companygw` cookie so requests cannot carry
    // two different sessions under the same cookie name.
    expireCookie(response, name, "/");
    response.cookies.set(name, value, authCookieConfig);
  }
}

export function clearAuthCookies(response: NextResponse): void {
  for (const name of authCookieNames) {
    expireCookie(response, name, COMPANY_GATEWAY_COOKIE_PATH);
    expireCookie(response, name, "/");
  }
}

export function clearCookieAtAllAuthPaths(
  response: NextResponse,
  name: string,
): void {
  expireCookie(response, name, COMPANY_GATEWAY_COOKIE_PATH);
  expireCookie(response, name, "/");
}
