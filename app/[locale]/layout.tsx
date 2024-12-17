import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { Cairo } from "next/font/google";
import MainHeader from "../components/mainHeader/MainHeader";
import logoUrl from "@/public/images/logo-trans.png";
import SideBar2 from "../components/SideBar/SideBar2";
import { GlobalProvider } from "../context/GlobalContext";

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
    const messages = await getMessages({ locale });
    const isRtl = locale === "ar";

    return (
      <html
        className={`h-full ${cairo.className}`}
        lang={locale}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <body className="h-full flex flex-row">
          <GlobalProvider>
            <NextIntlClientProvider messages={messages}>
              {/* Sidebar */}
              <SideBar2 />

              {/* Main Content Layout */}
              <div className="flex-1 flex flex-col">
                {/* Main Header */}
                <MainHeader title={"title"} logoUrl={logoUrl} isRtl={isRtl} />

                {/* Page Content */}
                <main className="flex-1 p-4 overflow-auto">
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

    return (
      <html className="h-full" lang="en" dir="ltr">
        <body>
          <div>An error occurred. Please refresh the page.</div>
        </body>
      </html>
    );
  }
}
