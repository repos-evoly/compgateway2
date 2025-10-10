import { NextRequest, NextResponse } from "next/server";
import { resolveAuthAssetUrl } from "@/app/api/auth/_base";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ message: "Missing path parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = resolveAuthAssetUrl(path);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid QR image path";
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
    const message = err instanceof Error ? err.message : "Failed to reach QR image";
    return NextResponse.json({ message }, { status: 502 });
  }

  if (!upstream.ok) {
    const message = `Upstream responded with status ${upstream.status}`;
    return NextResponse.json({ message }, { status: upstream.status });
  }

  const arrayBuffer = await upstream.arrayBuffer();
  const response = new NextResponse(Buffer.from(arrayBuffer), {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "no-store",
    },
  });

  const contentLength = upstream.headers.get("content-length");
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
