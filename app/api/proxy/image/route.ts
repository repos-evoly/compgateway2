import { NextRequest, NextResponse } from "next/server";

const rawBase = process.env.NEXT_PUBLIC_IMAGE_URL;

if (!rawBase) {
  throw new Error("NEXT_PUBLIC_IMAGE_URL is not defined");
}

const normalizedBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const baseUrl = new URL(normalizedBase);
const baseOrigin = baseUrl.origin;
const basePath = baseUrl.pathname.replace(/\/$/, "");
const basePathNoLeading = basePath.replace(/^\/+/, "");

const resolveTarget = (rawPath: string): URL => {
  const trimmed = rawPath.replace(/\\+/g, "/").trim();
  if (!trimmed) {
    throw new Error("Empty path");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const candidate = new URL(trimmed);
    if (candidate.origin !== baseOrigin) {
      throw new Error("Origin not allowed");
    }
    if (basePath && !candidate.pathname.startsWith(basePath)) {
      throw new Error("Path not allowed");
    }
    return candidate;
  }

  const withoutLeadingSlash = trimmed.replace(/^\/+/, "");
  let relative = withoutLeadingSlash;
  if (basePathNoLeading && relative.startsWith(basePathNoLeading)) {
    relative = relative.slice(basePathNoLeading.length);
    relative = relative.replace(/^\/+/, "");
  }

  const candidate = new URL(relative, baseUrl);
  if (!candidate.href.startsWith(baseUrl.href)) {
    throw new Error("Resolved URL outside of allowed base");
  }
  return candidate;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ message: "Missing path parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = resolveTarget(path);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid target";
    return NextResponse.json({ message }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers: {
        Accept: req.headers.get("accept") ?? "*/*",
      },
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach upstream";
    return NextResponse.json({ message }, { status: 502 });
  }

  if (!upstream.ok) {
    const message = `Upstream responded with status ${upstream.status}`;
    return NextResponse.json({ message }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");
  const cacheControl =
    upstream.headers.get("cache-control") ?? "public, max-age=60, stale-while-revalidate=300";

  const arrayBuffer = await upstream.arrayBuffer();
  const response = new NextResponse(Buffer.from(arrayBuffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    },
  });

  if (contentLength) {
    response.headers.set("Content-Length", contentLength);
  }

  const etag = upstream.headers.get("etag");
  if (etag) {
    response.headers.set("ETag", etag);
  }

  const lastModified = upstream.headers.get("last-modified");
  if (lastModified) {
    response.headers.set("Last-Modified", lastModified);
  }

  return response;
}
