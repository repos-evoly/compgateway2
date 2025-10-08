import { NextRequest } from "next/server";

import { buildBaseApiUrl, nextResponseFrom, proxyUpstream } from "@/app/api/_lib/authProxy";

type RouteContext = { params: Promise<{ userId: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  const target = buildBaseApiUrl(`companies/public/users/${encodeURIComponent(userId)}`);

  const hasAccessToken = req.cookies.has("accessToken");

  if (!hasAccessToken) {
    const headers = new Headers();

    const contentType = req.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    const accept = req.headers.get("accept");
    if (accept) headers.set("accept", accept);

    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage) headers.set("accept-language", acceptLanguage);

    const body = await req.arrayBuffer();

    const upstream = await fetch(target.toString(), {
      method: "PUT",
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });

    return nextResponseFrom(upstream);
  }

  const { upstream, refreshed } = await proxyUpstream(req, target, { method: "PUT" });
  return nextResponseFrom(upstream, refreshed);
}
