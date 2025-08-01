/* ─────────── app/auth/layout.tsx  COMPLETE & FIXED ─────────── */
import "../globals.css";
import { Cairo } from "next/font/google";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/* Google font */
const cairo = Cairo({ subsets: ["latin", "arabic"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  /* locale resolution */
  const { locale = "en" } = await params;
  const isRtl = locale === "ar";

  /* 🔐 read the per-request nonce from middleware */
  const hdrs = await headers(); // ← await here
  const nonce = hdrs.get("x-nonce") ?? "";

  /* allowed full URL comes from env */
  const ALLOWED_URL = process.env.NEXT_PUBLIC_ALLOWED_URL;

  return (
    <html
      className={`h-full ${cairo.className}`}
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <body className="h-full flex flex-row">
        {children}

        {/* self-destruct on wrong URL */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var allowed = ${JSON.stringify(ALLOWED_URL)};
                if (window.location.href !== allowed) {
                  document.documentElement.innerHTML =
                    '<style>body{font-family:sans-serif;text-align:center;padding:4rem}</style>' +
                    '<h1>موقع مزيّف</h1>' +
                    '<p>الرابط الصحيح هو <b>' + allowed + '</b></p>';
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
