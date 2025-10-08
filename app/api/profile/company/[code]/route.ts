import { NextRequest } from "next/server";
import { buildBaseApiUrl, nextResponseFrom, proxyUpstream } from "@/app/api/_lib/authProxy";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { code } = await context.params;
  const target = buildBaseApiUrl(`companies/getInfo/${code}`);

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}
