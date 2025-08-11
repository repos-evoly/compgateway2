// /* app/test-refresh/page.tsx
//    – Client-only example page (no redirects).
//    – Reads tokens from document.cookie using your exact helper style.
//    – Calls http://10.3.3.11/compauthapi/api/auth/refresh-token (POST)
//        Authorization: Bearer <accessToken>
//        Body: { refreshToken }
//    – IMPORTANT: Calls the API only once per identical token pair.
//      After success, it overwrites the cookies with the new tokens returned.
//    – Displays the API response on the same page.
//    – Strict TypeScript: no `any`, only `type`.
// */
// "use client";

// import React, { useCallback, useState } from "react";

// /* ----------------------------- Types ------------------------------------ */
// type RefreshResponse = {
//   accessToken: string;
//   refreshToken: string;
// };

// type ApiData =
//   | RefreshResponse
//   | Record<string, unknown>
//   | { rawText: string }
//   | null;

// type ApiResult = {
//   ok: boolean;
//   status: number;
//   data: ApiData;
//   error?: string;
// };

// type TokenPair = {
//   accessToken: string;
//   refreshToken: string;
// };

// /* ------------------------- Cookie Helpers -------------------------------- */
// /* EXACT style as requested */
// export const getAccessTokenFromCookies = (): string | null => {
//   const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
//   return match ? match[2] : null;
// };

// export const getRefreshTokenFromCookies = (): string | null => {
//   const match = document.cookie.match(new RegExp("(^| )refreshToken=([^;]+)"));
//   return match ? match[2] : null;
// };

// /* Minimal cookie setter: path=/, SameSite=Lax, adds Secure on HTTPS */
// const setCookie = (name: string, value: string): void => {
//   const isHttps =
//     typeof window !== "undefined" && window.location.protocol === "https:";
//   document.cookie = `${name}=${value}; path=/; SameSite=Lax${
//     isHttps ? "; Secure" : ""
//   }`;
// };

// /* ------------------------- Type Guards ----------------------------------- */
// const isRefreshResponse = (v: unknown): v is RefreshResponse => {
//   if (typeof v !== "object" || v === null) return false;
//   const obj = v as Record<string, unknown>;
//   return (
//     typeof obj.accessToken === "string" && typeof obj.refreshToken === "string"
//   );
// };

// /* ------------------------------- Page ------------------------------------ */
// const API_URL = "http://10.3.3.11/compauthapi/api/auth/refresh-token" as const;

// export default function TestRefreshPage(): React.JSX.Element {
//   const [result, setResult] = useState<ApiResult | null>(null);
//   const [pending, setPending] = useState<boolean>(false);

//   /* Remember the last used pair to avoid calling again with the exact same tokens */
//   const [lastUsed, setLastUsed] = useState<TokenPair | null>(null);

//   const mask = (token: string): string => {
//     if (token.length <= 12) return "*".repeat(token.length);
//     return `${token.slice(0, 6)}...${token.slice(-6)}`;
//   };

//   const callOnceWithCurrentCookies = useCallback(async (): Promise<void> => {
//     setPending(true);
//     setResult(null);

//     const accessToken = getAccessTokenFromCookies();
//     const refreshToken = getRefreshTokenFromCookies();

//     if (!accessToken || !refreshToken) {
//       const errorMessage =
//         !accessToken && !refreshToken
//           ? "Missing accessToken and refreshToken cookies."
//           : !accessToken
//           ? "Missing accessToken cookie."
//           : "Missing refreshToken cookie.";

//       setResult({ ok: false, status: 400, data: null, error: errorMessage });
//       setPending(false);
//       return;
//     }

//     /* Enforce: do not call the API again with the same pair in this session */
//     if (
//       lastUsed &&
//       lastUsed.accessToken === accessToken &&
//       lastUsed.refreshToken === refreshToken
//     ) {
//       setResult({
//         ok: false,
//         status: 400,
//         data: null,
//         error:
//           "This accessToken/refreshToken pair was already used. Use the newly stored tokens (cookies are updated after a successful call).",
//       });
//       setPending(false);
//       return;
//     }

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({ refreshToken }),
//         cache: "no-store",
//       });

//       const text = await res.text();
//       let parsed: ApiData = null;

//       try {
//         parsed = text ? (JSON.parse(text) as Record<string, unknown>) : null;
//       } catch {
//         parsed = { rawText: text };
//       }

//       /* If the API returned new tokens, overwrite both cookies */
//       if (isRefreshResponse(parsed)) {
//         setCookie("accessToken", parsed.accessToken);
//         setCookie("refreshToken", parsed.refreshToken);
//         /* Mark the old pair as used so we don't call again with the same pair */
//         setLastUsed({ accessToken, refreshToken });

//         setResult({
//           ok: res.ok,
//           status: res.status,
//           data: parsed,
//           error: res.ok ? undefined : "Request failed",
//         });
//       } else {
//         /* Non-standard response: still show it */
//         setResult({
//           ok: res.ok,
//           status: res.status,
//           data: parsed,
//           error: res.ok ? undefined : "Request failed",
//         });
//       }
//     } catch (err) {
//       setResult({
//         ok: false,
//         status: 0,
//         data: null,
//         error: err instanceof Error ? err.message : "Unknown error",
//       });
//     } finally {
//       setPending(false);
//     }
//   }, [lastUsed]);

//   /* Snapshot of whatever is currently in cookies (for display only) */
//   const currentAccess = getAccessTokenFromCookies();
//   const currentRefresh = getRefreshTokenFromCookies();

//   return (
//     <main className="mx-auto my-10 max-w-2xl p-6">
//       <h1 className="mb-4 text-2xl font-semibold">Refresh Token Test</h1>

//       <div className="mb-4 text-sm text-gray-700">
//         <div>
//           <span className="font-medium">Current accessToken: </span>
//           {currentAccess
//             ? `${mask(currentAccess)} (len: ${currentAccess.length})`
//             : "— not set —"}
//         </div>
//         <div>
//           <span className="font-medium">Current refreshToken: </span>
//           {currentRefresh
//             ? `${mask(currentRefresh)} (len: ${currentRefresh.length})`
//             : "— not set —"}
//         </div>
//       </div>

//       <button
//         type="button"
//         onClick={callOnceWithCurrentCookies}
//         className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
//         disabled={pending}
//       >
//         {pending ? "Calling…" : "Call /auth/refresh-token"}
//       </button>

//       <section className="mt-6">
//         <h2 className="mb-2 text-lg font-medium">Result</h2>
//         <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm">
//           {result
//             ? JSON.stringify(result, null, 2)
//             : "Press the button to call the API."}
//         </pre>
//       </section>

//       <p className="mt-4 text-xs text-gray-600">
//         After a successful call, the new <code>accessToken</code> and{" "}
//         <code>refreshToken</code> returned by the API are saved to cookies and
//         will be used on subsequent calls.
//       </p>
//     </main>
//   );
// }

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
