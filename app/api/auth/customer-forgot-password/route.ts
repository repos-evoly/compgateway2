import { NextRequest, NextResponse } from "next/server";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API!;
export async function POST(req: NextRequest) {
  const body = await req.text();
  const upstream = await fetch(`${AUTH_BASE}/customer-forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text || "", {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
