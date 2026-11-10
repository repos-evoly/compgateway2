import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_BASE } from "@/app/api/auth/_base";

export async function POST(request: NextRequest) {
  const response = await fetch(`${AUTH_API_BASE}/password-recovery/complete`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: await request.text(), cache: "no-store",
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
