import { NextRequest } from "next/server";

import { buildBaseApiUrl, nextResponseFrom, proxyUpstream } from "@/app/api/_lib/authProxy";

type RouteContext = { params: Promise<{ code: string; attachmentId: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { code, attachmentId } = await context.params;
  const target = buildBaseApiUrl(
    `companies/${encodeURIComponent(code)}/attachments/${encodeURIComponent(attachmentId)}`
  );

  const hasAccessToken = req.cookies.has("accessToken");

  if (!hasAccessToken) {
    const headers = new Headers();

    const accept = req.headers.get("accept");
    if (accept) headers.set("accept", accept);

    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage) headers.set("accept-language", acceptLanguage);

    const upstream = await fetch(target.toString(), {
      method: "DELETE",
      headers,
      cache: "no-store",
      redirect: "manual",
    });

    return nextResponseFrom(upstream);
  }

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}
