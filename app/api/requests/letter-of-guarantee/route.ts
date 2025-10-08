import { NextRequest } from "next/server";
import { buildBaseApiUrl, nextResponseFrom, proxyUpstream } from "@/app/api/_lib/authProxy";

const CREDIT_PATH = "creditfacilities" as const;

function buildFilteredSearch(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    if (key === "searchTerm" || key === "searchBy") continue;
    params.append(key, value);
  }

  params.set("searchTerm", "letterOfGuarantee");
  params.set("searchBy", "type");

  searchParams
    .getAll("searchTerm")
    .filter((value) => value && value !== "letterOfGuarantee")
    .forEach((value) => params.append("searchTerm", value));

  searchParams
    .getAll("searchBy")
    .filter((value) => value && value !== "type")
    .forEach((value) => params.append("searchBy", value));

  return params.toString();
}

export async function GET(req: NextRequest) {
  const target = buildBaseApiUrl(CREDIT_PATH);
  const search = buildFilteredSearch(req.nextUrl.searchParams);
  target.search = search;

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}

export async function POST(req: NextRequest) {
  const target = buildBaseApiUrl(CREDIT_PATH);

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}

export async function PUT(req: NextRequest) {
  const target = buildBaseApiUrl(CREDIT_PATH);

  const { upstream, refreshed } = await proxyUpstream(req, target);
  return nextResponseFrom(upstream, refreshed);
}
