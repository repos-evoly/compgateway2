import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_BASE, resolveAuthAssetUrl } from "@/app/api/auth/_base";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const upstream = await fetch(`${AUTH_API_BASE}/enable-2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";

  if (!upstream.ok) {
    return new NextResponse(text || "Enable 2FA failed", {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  }

  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  }

  const qrCodePath = typeof data.qrCodePath === "string" ? data.qrCodePath : null;
  if (qrCodePath) {
    try {
      data.qrCodeUrl = resolveAuthAssetUrl(qrCodePath).toString();
    } catch {
      data.qrCodeUrl = qrCodePath;
    }
  }

  return NextResponse.json(data, { status: upstream.status });
}
