import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { Cairo } from "next/font/google";
import MainHeader from "@/app/components/mainHeader/MainHeader";
import logoUrl from "@/public/images/logo-trans.png";
import SideBar2 from "@/app/components/SideBar/SideBar2";
import { GlobalProvider } from "@/app/context/GlobalContext";

// Importing Cairo font from Google Fonts
const cairo = Cairo({ subsets: ["latin", "arabic"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  console.log("LocaleLayout: Rendering started"); // Debug: Initial render log
  const resolvedParams = await params;
  console.log("LocaleLayout: Resolved params:", resolvedParams); // Debug: Check resolved params

  const locale = resolvedParams?.locale || "en"; // Fallback to "en" if locale is undefined
  console.log("LocaleLayout: Locale resolved as:", locale); // Debug: Locale check

  try {
    const messages = await getMessages({ locale });
    console.log("LocaleLayout: Messages fetched:", messages); // Debug: Fetched messages check

    const isRtl = locale === "ar";
    console.log("LocaleLayout: Direction resolved as:", isRtl ? "rtl" : "ltr"); // Debug: Direction check

    return (
      <html
        className={`h-full w-full ${cairo.className}`}
        lang={locale}
        dir={isRtl ? "rtl" : "ltr"}
        suppressHydrationWarning
      >
        <body className="h-full w-full flex flex-row" suppressHydrationWarning>
          <GlobalProvider>
            <NextIntlClientProvider messages={messages}>
              {/* Sidebar */}
              <SideBar2 />

              {/* 
                NOTE:
                We add Tailwind transition classes directly to the main container.
                This way, the container transitions its max-width smoothly when 
                --sidebar-width changes (or any related layout change occurs). 
              */}
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

                {/* Page Content */}
                <main className="flex-1 overflow-hidden min-w-0 bg-gray-100">
                  <div className="w-full h-full mb-2 overflow-x-auto">
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
    console.error("LocaleLayout Error:", error); // Debug: Catch block error log

    return (
      <html className="h-full" lang="en" dir="ltr">
        <body>
          <div>An error occurred. Please refresh the page.</div>
        </body>
      </html>
    );
  } finally {
    console.log("LocaleLayout: Render process completed"); // Debug: Final log
  }
}
