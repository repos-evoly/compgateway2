import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  nextResponseFrom,
  proxyUpstream,
} from "@/app/api/_lib/authProxy";

type RouteParams = { proxy?: string[] };
type RouteContext = { params: Promise<RouteParams> };

const DEVICE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const problem = (status: number, detail: string) =>
  NextResponse.json(
    { title: status === 404 ? "Not Found" : "Service Unavailable", status, detail },
    { status }
  );

const resolveTarget = (method: string, segments: string[]): URL | null => {
  const configuredBase = process.env.MOBILE_BFF_BASE_URL?.trim().replace(/\/+$/, "");
  if (!configuredBase) {
    throw new Error("MOBILE_BFF_BASE_URL is not configured");
  }

  let internalPath: string | null = null;
  if (method === "POST" && segments.length === 1 && segments[0] === "activation-codes") {
    internalPath = "/api/admin/devices/activation-codes";
  } else if (method === "GET" && segments.length === 1 && segments[0] === "devices") {
    internalPath = "/api/admin/devices";
  } else if (
    method === "POST" &&
    segments.length === 3 &&
    segments[0] === "devices" &&
    DEVICE_ID_PATTERN.test(segments[1]) &&
    (segments[2] === "approve" || segments[2] === "revoke")
  ) {
    internalPath = `/api/admin/devices/${segments[1]}/${segments[2]}`;
  }

  return internalPath ? new URL(`${configuredBase}${internalPath}`) : null;
};

const forward = async (request: NextRequest, context: RouteContext) => {
  const { proxy = [] } = await context.params;

  try {
    const target = resolveTarget(request.method, proxy);
    if (!target) {
      return problem(404, "The requested mobile-access operation does not exist.");
    }

    if (request.method === "GET") {
      target.search = request.nextUrl.search;
    }

    const correlationId =
      request.headers.get("X-Correlation-ID")?.trim() || randomUUID();
    const { upstream, refreshed } = await proxyUpstream(request, target, {
      headers: { "X-Correlation-ID": correlationId },
      forwardRequestHeaders: false,
    });

    return nextResponseFrom(upstream, refreshed);
  } catch (error) {
    console.error("Mobile BFF request failed", {
      message: error instanceof Error ? error.message : "Unknown proxy error",
    });
    return problem(503, "The mobile access service is currently unavailable.");
  }
};

export const dynamic = "force-dynamic";
export const GET = forward;
export const POST = forward;
