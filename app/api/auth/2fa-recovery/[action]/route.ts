import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_BASE } from "@/app/api/auth/_base";
import { isRecoveryBrowserKey, recoveryBrowserCookie, recoveryBrowserHeader, recoveryCookieConfig, recoveryProofCookie } from "@/app/api/auth/_authenticatorRecovery";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!["request", "status", "setup", "complete"].includes(action))
    return NextResponse.json({}, { status: 404, headers: noStore });

  const site = request.headers.get("sec-fetch-site");
  if ((site && site !== "same-origin") || !request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({}, { status: 403, headers: noStore });

  const proofCookie = request.cookies.get(recoveryProofCookie)?.value;
  const browserKey = request.cookies.get(recoveryBrowserCookie)?.value;
  const deviceId = request.cookies.get("authDeviceId")?.value;
  if (!proofCookie || proofCookie.length > 2081 || !isRecoveryBrowserKey(browserKey) || !deviceId || !/^[\w-]{1,64}$/.test(deviceId))
    return NextResponse.json({}, { status: 401, headers: noStore });

  const body = await request.json().catch(() => null);
  if (typeof body?.attempt !== "string" || !/^[a-f0-9]{32}$/.test(body.attempt) || !proofCookie.startsWith(`${body.attempt}.`))
    return NextResponse.json({}, { status: 401, headers: noStore });
  const proof = proofCookie.slice(33);
  if (action === "complete" && (typeof body?.code !== "string" || !/^\d{6}$/.test(body.code)))
    return NextResponse.json({ code: "invalid_recovery_otp" }, { status: 400, headers: noStore });

  try {
    const upstream = await fetch(`${AUTH_API_BASE.replace(/\/+$/, "")}/2fa-recovery/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [recoveryBrowserHeader]: browserKey,
        Cookie: `authDeviceId=${deviceId}`,
      },
      body: JSON.stringify({ proof, code: body?.code }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json().catch(() => null);
    const response = NextResponse.json(data, { status: upstream.status, headers: noStore });
    if (action === "complete" && upstream.ok && data?.status === "completed")
      response.cookies.set(recoveryProofCookie, "", { ...recoveryCookieConfig, maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({}, { status: 502, headers: noStore });
  }
}
