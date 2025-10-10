/* --------------------------------------------------------------------------
   app/[locale]/layout.tsx
   – Locale root layout WITH <html>/<body> (no app/layout.tsx).
   Locale-aware shell: fixed sidebar + header. Works with basePath "/Companygw".
-------------------------------------------------------------------------- */
import React from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";

import MainHeader from "@/app/components/mainHeader/MainHeader";
import SideBar2 from "@/app/components/SideBar/SideBar2";
import { GlobalProvider } from "@/app/context/GlobalContext";

import logoUrl from "@/public/Companygw/images/logo-trans.png";
import "../globals.css";

/* ---------- Locale type (no unused value) ---------- */
type Locale = "en" | "ar";

/* ---------- Cairo font ---------- */
const cairo = localFont({
  src: [
    {
      path: "../../public/Companygw/fonts/Cairo-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/Companygw/fonts/Cairo-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/Companygw/fonts/Cairo-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

/* ---------- Component ---------- */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  // Debug
  console.log("LocaleLayout: Rendering started");
  const resolvedParams = await params;
  console.log("LocaleLayout: Resolved params:", resolvedParams);

  const locale = resolvedParams.locale;
  setRequestLocale(locale); // bind locale for this subtree
  console.log("LocaleLayout: Locale resolved as:", locale);

  try {
    const messages: AbstractIntlMessages = await getMessages({ locale });
    console.log("LocaleLayout: Messages fetched");

    const isRtl = locale === "ar";
    console.log("LocaleLayout: Direction:", isRtl ? "rtl" : "ltr");

    // Keeping <html>/<body> here (no app/layout.tsx in your project)
    return (
      <html
        lang={locale}
        dir={isRtl ? "rtl" : "ltr"}
        className={`${cairo.className} min-h-screen w-full`}
        suppressHydrationWarning
      >
        <body
          className="min-h-screen w-full flex flex-row overflow-x-hidden bg-gray-100 lg:h-screen lg:overflow-hidden"
          suppressHydrationWarning
        >
          <GlobalProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              {/* Sidebar */}
              <SideBar2 />

              {/* Main column */}
              <div
                className="
                  flex-1
                  flex
                  flex-col
                  min-h-screen
                  lg:min-h-0
                  lg:h-screen
                  lg:max-h-screen
                  transition-all
                  duration-300
                  ease-in-out
                "
                style={{ maxWidth: "calc(100vw - var(--sidebar-width))" }}
              >
                {/* Header */}
                <MainHeader logoUrl={logoUrl} isRtl={isRtl} title="" />

                {/* Content */}
                <main className="flex-1 overflow-y-auto overflow-x-auto min-w-0 min-h-0">
                  {children}
                </main>
              </div>
            </NextIntlClientProvider>
          </GlobalProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error("LocaleLayout Error:", error);

    // Keep <html>/<body> here for your no-root-layout setup
    return (
      <html lang="en" dir="ltr" className="min-h-screen w-full">
        <body className="min-h-screen flex items-center justify-center">
          <div>An error occurred. Please refresh the page.</div>
        </body>
      </html>
    );
  } finally {
    console.log("LocaleLayout: Render completed");
  }
}
