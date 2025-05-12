import "../globals.css";
import { Cairo } from "next/font/google";

// Importing Cairo font from Google Fonts
const cairo = Cairo({ subsets: ["latin", "arabic"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en"; // Fallback to "en" if locale is undefined

  try {
    const isRtl = locale === "ar";

    return (
      <html
        className={`h-full ${cairo.className}`}
        lang={locale}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <body className="h-full flex flex-row">{children}</body>
      </html>
    );
  } catch (error) {
    console.error("LocaleLayout Error:", error);

    return (
      <html className="h-full" lang="en" dir="ltr">
        <body>
          <div>An error occurred. Please refresh the page.</div>
        </body>
      </html>
    );
  }
}
