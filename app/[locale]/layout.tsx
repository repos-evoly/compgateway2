/* --------------------------------------------------------------------------
   app/[locale]/layout.tsx
   – Global layout with fixed sidebar + header, RTL/LTR aware.
   Strict TypeScript, no interface, no any.
-------------------------------------------------------------------------- */
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { Cairo } from "next/font/google";
import MainHeader from "@/app/components/mainHeader/MainHeader";
import logoUrl from "@/public/images/logo-trans.png";
import SideBar2 from "@/app/components/SideBar/SideBar2";
import { GlobalProvider } from "@/app/context/GlobalContext";

/* ---------- Cairo font ---------- */
const cairo = Cairo({ subsets: ["latin", "arabic"] });

/* ---------- Component ---------- */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  /* ---------------- debug logs ---------------- */
  console.log("LocaleLayout: Rendering started");

  const resolvedParams = await params;
  console.log("LocaleLayout: Resolved params:", resolvedParams);

  const locale: string = resolvedParams?.locale ?? "en";
  console.log("LocaleLayout: Locale resolved as:", locale);

  try {
    const messages = await getMessages({ locale });
    console.log("LocaleLayout: Messages fetched:", messages);

    const isRtl: boolean = locale === "ar";
    console.log("LocaleLayout: Direction resolved as:", isRtl ? "rtl" : "ltr");

    return (
      <html
        lang={locale}
        dir={isRtl ? "rtl" : "ltr"}
        className={`${cairo.className} min-h-screen w-full`}
        suppressHydrationWarning
      >
        <body
          className="min-h-screen w-full flex flex-row overflow-hidden"
          suppressHydrationWarning
        >
          <GlobalProvider>
            <NextIntlClientProvider messages={messages}>
              {/* ---------- Sidebar ---------- */}
              <SideBar2 />

              {/* ---------- Main column ---------- */}
              <div
                className="
                  flex-1
                  flex
                  flex-col
                  transition-all
                  duration-300
                  ease-in-out
                "
                style={{
                  maxWidth: "calc(100vw - var(--sidebar-width))",
                }}
              >
                <MainHeader logoUrl={logoUrl} isRtl={isRtl} title="" />

                {/* ---------- Page content ---------- */}
                <main className="flex-1 overflow-y-auto min-w-0 bg-gray-100">
                  <div className="w-full h-full overflow-x-auto">
                    {children}
                  </div>
                </main>
              </div>
            </NextIntlClientProvider>
          </GlobalProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error("LocaleLayout Error:", error);

    return (
      <html lang="en" dir="ltr" className="min-h-screen w-full">
        <body className="min-h-screen flex items-center justify-center">
          <div>An error occurred. Please refresh the page.</div>
        </body>
      </html>
    );
  } finally {
    console.log("LocaleLayout: Render process completed");
  }
}
