// app/api/users/by-auth/[userId]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API!;
if (!BASE_API) {
  throw new Error("NEXT_PUBLIC_BASE_API is not defined");
}

export async function GET(req: Request) {
  // In some Next/TS combos cookies() is async-typed; await to satisfy TS.
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  // Extract userId from the URL instead of using the context param
  const { pathname } = new URL(req.url);
  // Expecting: /api/users/by-auth/<userId>
  const parts = pathname.split("/").filter(Boolean);
  const byAuthIdx = parts.findIndex((p) => p === "by-auth");
  const userId = byAuthIdx >= 0 ? parts[byAuthIdx + 1] : undefined;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId in path" }, { status: 400 });
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
