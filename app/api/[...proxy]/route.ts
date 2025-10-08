import { NextRequest } from "next/server";
import { buildBaseApiUrl, nextResponseFrom, proxyUpstream } from "@/app/api/_lib/authProxy";

type RouteParams = { proxy?: string[] };

type RouteContext = { params: Promise<RouteParams> };

type Handler = (req: NextRequest, context: RouteContext) => Promise<Response>;

const forward: Handler = async (req, context) => {
  const params = await context.params;
  const segments = params.proxy ?? [];
  const path = segments.join("/");
  const target = buildBaseApiUrl(path);
  target.search = req.nextUrl.search;

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
};

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const HEAD = forward;
export const OPTIONS = forward;
