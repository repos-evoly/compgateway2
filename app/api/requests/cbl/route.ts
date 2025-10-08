import { NextRequest } from "next/server";
import { buildBaseApiUrl, nextResponseFrom, proxyUpstream } from "@/app/api/_lib/authProxy";

export async function GET(req: NextRequest) {
  const target = buildBaseApiUrl("cblrequests");
  target.search = req.nextUrl.search;

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}

export async function POST(req: NextRequest) {
  const target = buildBaseApiUrl("cblrequests");

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}

