import { NextResponse } from "next/server";

const COOKIE_NAMES = [
  "acceessToken",
  "accessToken",
  "refreshToken",
  "kycToken",
] as const;

const COOKIE_PATHS = ["/Companygw", "/"] as const;

export function buildLogoutResponse() {
  const res = NextResponse.json({ success: true }, { status: 200 });

  COOKIE_NAMES.forEach((name) => {
    COOKIE_PATHS.forEach((path) => {
      res.cookies.set({
        name,
        value: "",
        path,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 0,
      });
    });
  });

  return res;
}

export async function POST() {
  return buildLogoutResponse();
}
