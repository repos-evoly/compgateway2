// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API!;
if (!BASE_API) {
  throw new Error("NEXT_PUBLIC_BASE_API is not defined");
}

export async function GET() {
  // NOTE: in some Next/TS combos cookies() is typed async — await it to satisfy TS
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const userId = safeParseNameIdFromJwt(token);
  if (!userId) {
    return NextResponse.json({ error: "Bad token" }, { status: 400 });
  }

  const upstream = await fetch(`${BASE_API}/users/by-auth/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    // cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text || "", {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

/** Edge/Node-safe JWT payload parser; extracts numeric `nameid` (or `sub`). */
function safeParseNameIdFromJwt(jwt: string): number | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlToString(parts[1]);
    const payload = JSON.parse(payloadJson) as { nameid?: unknown; sub?: unknown };
    const raw = (payload.nameid ?? payload.sub) as unknown;
    const n = Number.parseInt(String(raw), 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Base64URL → UTF-8 string (works in Edge/Node runtimes). */
function base64UrlToString(b64url: string): string {
  // Replace URL-safe chars and pad
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad !== 0) b64 += "==";

  // Prefer atob in Edge; fallback to Buffer in Node
  if (typeof atob === "function") {
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } else {
    return Buffer.from(b64, "base64").toString("utf8");
  }
}
