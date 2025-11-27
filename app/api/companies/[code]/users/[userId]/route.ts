import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { ensureCompanyGatewayPath } from "@/app/api/_lib/authProxy";

type RouteContext = {
  params: Promise<{ code: string; userId: string }>;
};

const rawBase = process.env.NEXT_PUBLIC_BASE_API;
if (!rawBase) {
  throw new Error("NEXT_PUBLIC_BASE_API is not defined");
}

const baseApiRoot = (() => {
  const ensured = ensureCompanyGatewayPath(rawBase);
  return ensured.endsWith("/") ? ensured : `${ensured}/`;
})();

const sanitizeCookie = (value?: string): string | undefined => {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value).replace(/^"|"$/g, "");
  } catch {
    return value.replace(/^"|"$/g, "");
  }
};

const buildTargetUrl = (code: string, userId: string, search: string): URL => {
  const normalized = `companies/${encodeURIComponent(code)}/users/${encodeURIComponent(userId)}`;
  const url = new URL(normalized, baseApiRoot);
  if (search) {
    url.search = search;
  }
  return url;
};

const buildHeaders = (
  req: NextRequest,
  token: string,
  companyCode: string
): HeadersInit => {
  const headers = new Headers();

  const accept = req.headers.get("accept") ?? "application/json";
  headers.set("Accept", accept);

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const acceptLanguage = req.headers.get("accept-language");
  if (acceptLanguage) headers.set("Accept-Language", acceptLanguage);

  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Company-Code", companyCode);
  headers.set("X-Company-Code", companyCode);

  return headers;
};

const forward = async (
  req: NextRequest,
  context: RouteContext,
  method: "GET" | "POST"
): Promise<NextResponse> => {
  const { code, userId } = await context.params;
  const cookieStore = await cookies();
  const accessToken = sanitizeCookie(cookieStore.get("accessToken")?.value);

  if (!accessToken) {
    return NextResponse.json({ message: "Missing access token" }, { status: 401 });
  }

  const target = buildTargetUrl(code, userId, req.nextUrl.search);

  if (method !== "GET") {
    target.pathname = target.pathname.replace(/\/$/, "") + "/update";
  }

  let body: ArrayBuffer | undefined;
  if (method !== "GET") {
    body = await req.arrayBuffer();
  }

  const init: RequestInit = {
    method,
    headers: buildHeaders(req, accessToken, code),
    cache: "no-store",
    redirect: "manual",
  };

  if (body !== undefined) {
    init.body = body;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), init);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reach upstream";
    return NextResponse.json({ message }, { status: 502 });
  }

  const canHaveBody =
    upstream.status !== 204 && upstream.status !== 205 && upstream.status !== 304;

  let downstreamBody: string | null = null;
  if (canHaveBody) {
    downstreamBody = await upstream.text();
  }

  const res = new NextResponse(canHaveBody ? downstreamBody ?? "" : null, {
    status: upstream.status,
  });

  const contentType = upstream.headers.get("content-type");
  if (canHaveBody && contentType) {
    res.headers.set("Content-Type", contentType);
  }

  return res;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return forward(req, context, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
  return forward(req, context, "POST");
}
