import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { setCanonicalAuthCookies } from "@/app/api/_lib/authCookies";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
};

type ProxyOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: ArrayBuffer;
  forwardRequestHeaders?: boolean;
};

const shouldRefresh = async (response: Response): Promise<boolean> => {
  if (response.status === 401) return true;
  if (response.status !== 403) return false;

  // The Mobile BFF can surface an expired forwarded user JWT as an upstream
  // authorization error because its private CompGate route also authenticates
  // the BFF service identity. Refresh that authentication-specific response,
  // but never refresh a real device-administrator permission denial.
  try {
    const body = (await response.clone().json()) as { code?: unknown };
    return body.code === "device_administration_upstream_error";
  } catch {
    return false;
  }
};

const sanitizeCookie = (value?: string): string | undefined => {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value).replace(/^"|"$/g, "");
  } catch {
    return value.replace(/^"|"$/g, "");
  }
};

export const ensureCompanyGatewayPath = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return trimmed;
  }

  // If the base already includes an /api segment, respect it as-is.
  if (/\/api\b/.test(trimmed)) {
    return trimmed;
  }

  // Otherwise, assume the API lives under an /api suffix.
  return `${trimmed}/api`;
};

const getBaseApiRoot = (): string => {
  const base = process.env.NEXT_PUBLIC_BASE_API;
  if (!base) {
    throw new Error("NEXT_PUBLIC_BASE_API is not defined");
  }
  return ensureCompanyGatewayPath(base);
};

const getAuthApiRoot = (): string => {
  const base = process.env.NEXT_PUBLIC_AUTH_API;
  if (!base) {
    throw new Error("NEXT_PUBLIC_AUTH_API is not defined");
  }
  return ensureCompanyGatewayPath(base);
};

const getRefreshUrl = (): string => `${getAuthApiRoot()}/refresh-token`;

export const buildBaseApiUrl = (path: string): URL => {
  const base = getBaseApiRoot();
  const normalized = path.replace(/^\//, "");
  return new URL(normalized, `${base}/`);
};

const fetchRefreshTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<TokenPair | null> => {
  const res = await fetch(getRefreshUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return null;
  }

  if (
    !data ||
    typeof (data as Partial<TokenPair>).accessToken !== "string" ||
    typeof (data as Partial<TokenPair>).refreshToken !== "string"
  ) {
    return null;
  }

  return data as TokenPair;
};

export const proxyUpstream = async (
  req: NextRequest,
  target: URL,
  options: ProxyOptions = {}
): Promise<{ upstream: Response; refreshed?: TokenPair }> => {
  const cookieStore = await cookies();
  let accessToken = sanitizeCookie(cookieStore.get("accessToken")?.value);
  const refreshToken = sanitizeCookie(cookieStore.get("refreshToken")?.value);

  if (!accessToken) {
    const body = JSON.stringify({ message: "Missing access token" });
    return {
      upstream: new Response(body, {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const method = options.method ?? req.method;

  let bodyBuffer: ArrayBuffer | undefined = options.body;
  if (
    bodyBuffer === undefined &&
    method !== "GET" &&
    method !== "HEAD"
  ) {
    bodyBuffer = await req.arrayBuffer();
  }

  const hopByHopHeaders = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
  ]);

  const buildHeaders = (bearer: string): Headers => {
    const headers = new Headers(options.headers);

    if (options.forwardRequestHeaders !== false) {
      req.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (
          hopByHopHeaders.has(lower) ||
          lower === "cookie" ||
          lower === "authorization" ||
          lower === "content-length"
        ) {
          return;
        }
        if (!headers.has(key)) {
          headers.set(key, value);
        }
      });
    }

    const contentType = req.headers.get("content-type");
    if (contentType && !headers.has("content-type")) {
      headers.set("content-type", contentType);
    }
    const accept = req.headers.get("accept");
    if (accept && !headers.has("accept")) {
      headers.set("accept", accept);
    }
    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage && !headers.has("accept-language")) {
      headers.set("accept-language", acceptLanguage);
    }

    headers.set("Authorization", `Bearer ${bearer}`);
    return headers;
  };

  const attempt = (bearer: string) =>
    fetch(target.toString(), {
      method,
      headers: buildHeaders(bearer),
      body:
        bodyBuffer !== undefined && method !== "GET" && method !== "HEAD"
          ? bodyBuffer
          : undefined,
      cache: "no-store",
      redirect: "manual",
    });

  let upstream = await attempt(accessToken);

  if ((await shouldRefresh(upstream)) && refreshToken) {
    const refreshed = await fetchRefreshTokens(accessToken, refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;
      upstream = await attempt(accessToken);
      return { upstream, refreshed };
    }
  }

  return { upstream };
};

export const nextResponseFrom = (
  upstream: Response,
  tokens?: TokenPair
): NextResponse => {
  const res = new NextResponse(upstream.body, {
    status: upstream.status,
  });

  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "content-length" || lower === "transfer-encoding" || lower === "connection") {
      return;
    }
    res.headers.set(key, value);
  });

  if (tokens) {
    setCanonicalAuthCookies(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      authSessionId: tokens.sessionId,
    });
  }

  return res;
};
