/* app/helpers/authentication/refreshTokens.ts
   – Client-only helper (no UI).
   – Reads accessToken + refreshToken from document.cookie (exact regex style).
   – Calls http://10.3.3.11/compauthapi/api/auth/refresh-token (POST)
       Authorization: Bearer <accessToken>
       Body: { refreshToken }
   – Calls the API only once per identical token pair (per page load).
   – On success, OVERWRITES the existing cookies with the new tokens and returns them.
   – Strict TypeScript; uses `type` only.
*/
"use client";

/* ----------------------------- Types ------------------------------------ */
export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

/* ------------------------------ Config ----------------------------------- */
export const REFRESH_API_URL =
  "http://10.3.3.11/compauthapi/api/auth/refresh-token" as const;

/* ------------------------- Cookie Helpers -------------------------------- */
/* EXACT style as requested */
export const getAccessTokenFromCookies = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
  return match ? match[2] : null;
};

export const getRefreshTokenFromCookies = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )refreshToken=([^;]+)"));
  return match ? match[2] : null;
};

/* Setter: path=/, SameSite=Lax, adds Secure on HTTPS
   Writing a cookie with the same name+path overwrites the existing one. */
const setCookie = (name: string, value: string): void => {
  if (typeof document === "undefined") return;
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${value}; path=/; SameSite=Lax${
    isHttps ? "; Secure" : ""
  }`;
};

/* Some backends/cookie libs wrap values in quotes or URI-encode them */
const sanitize = (v: string): string => decodeURIComponent(v).replace(/^"|"$/g, "");

/* ------------------------- Type Guards ----------------------------------- */
const isRefreshResponse = (v: unknown): v is RefreshResponse => {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.accessToken === "string" && typeof obj.refreshToken === "string";
};

/* ----------------------- Duplicate-call Guard ---------------------------- */
let lastUsedPair: TokenPair | null = null;

/* Optional: reset guard (useful in tests) */
export const _resetRefreshGuard = (): void => {
  lastUsedPair = null;
};

/* ---------------------------- Main Helper -------------------------------- */
/**
 * Refresh auth tokens using the current cookies.
 * - Reads accessToken + refreshToken from document.cookie
 * - Ensures the same pair is not used more than once per page load
 * - POSTs to REFRESH_API_URL
 * - On success, sets NEW cookies (overwriting old ones) and returns { accessToken, refreshToken }
 * - Throws on missing cookies, invalid response, or non-2xx status
 */
export const refreshAuthTokens = async (): Promise<RefreshResponse> => {
  if (typeof document === "undefined") {
    throw new Error("refreshAuthTokens requires a browser environment.");
  }
  const rawAccess = getAccessTokenFromCookies();
  const rawRefresh = getRefreshTokenFromCookies();

  if (!rawAccess || !rawRefresh) {
    const msg =
      !rawAccess && !rawRefresh
        ? "Missing accessToken and refreshToken cookies."
        : !rawAccess
        ? "Missing accessToken cookie."
        : "Missing refreshToken cookie.";
    throw new Error(msg);
  }

  const accessToken = sanitize(rawAccess);
  const refreshToken = sanitize(rawRefresh);

  if (
    lastUsedPair &&
    lastUsedPair.accessToken === accessToken &&
    lastUsedPair.refreshToken === refreshToken
  ) {
    throw new Error(
      "This accessToken/refreshToken pair was already used for refresh. Use the newly stored tokens."
    );
  }

  const res = await fetch(REFRESH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    throw new Error(
      `Refresh failed with status ${res.status}${
        parsed ? ` – ${JSON.stringify(parsed)}` : ""
      }`
    );
  }

  if (!isRefreshResponse(parsed)) {
    throw new Error(
      "Unexpected refresh-token response. Expected { accessToken, refreshToken }."
    );
  }

  // OVERWRITE existing cookies with the newly returned tokens
  setCookie("accessToken", parsed.accessToken);
  setCookie("refreshToken", parsed.refreshToken);

  lastUsedPair = { accessToken, refreshToken };

  return parsed;
};
