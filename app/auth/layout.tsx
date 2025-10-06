/* app/auth/layout.tsx – allow-list enforcement for selected auth pages */
import { Cairo } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

export const dynamic = "force-dynamic";

const cairo = Cairo({ subsets: ["latin", "arabic"] });

type Props = { children: ReactNode };

export default function AuthLayout({ children }: Props): React.JSX.Element {
  // Comma-separated list of allowed URLs/paths (absolute enforces origin; relative resolved against current origin)
  const allowedRaw =
    process.env.NEXT_PUBLIC_ALLOWED_URLS ??
    process.env.NEXT_PUBLIC_ALLOWED_URL ??
    "";

  return (
    <html className={`h-full ${cairo.className}`} lang="ar" dir="rtl">
      <body className="h-full flex flex-row">
        {children}

        {/* Enforce only on allow-listed pages; ignore query/hash/trailing slashes */}
        <script
          // If you later add CSP script nonces, you can set nonce here.
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var raw = ${JSON.stringify(allowedRaw)};
  if (!raw) return;

  function norm(p) { return p.replace(/\\/+$/, "") || "/"; }

  // Build entries from env; support absolute URLs or relative paths; support "/*" wildcard suffix
  var items = raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  if (!items.length) return;

  var entries = items.map(function (item) {
    var url = new URL(item, window.location.origin);
    var wildcard = url.pathname.endsWith("/*");
    var path = wildcard ? url.pathname.slice(0, -2) : url.pathname; // remove "/*"
    return { origin: url.origin, path: norm(path), href: url.href, wildcard: wildcard };
  });

  var currentPath = norm(window.location.pathname);

  // Only enforce on paths present in the allow-list (exact match or wildcard prefix)
  var match = entries.find(function (e) {
    return e.wildcard ? currentPath.startsWith(e.path) : currentPath === e.path;
  });

  if (!match) return;                 // Not one of the enforced pages → do nothing
  if (window.location.origin === match.origin) return; // Correct origin → OK

  // Wrong origin on an enforced page → block
  document.documentElement.innerHTML =
    '<style>body{font-family:sans-serif;text-align:center;padding:4rem}</style>' +
    '<h1>موقع مزيّف</h1>' +
    '<p>الرابط الصحيح هو <b>' + match.href + '</b></p>';
})();
            `,
          }}
        />
      </body>
    </html>
  );
}
