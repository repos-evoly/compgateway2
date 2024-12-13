import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { Cairo } from "next/font/google";
import MainHeader from "../components/mainHeader/MainHeader";
import logoUrl from "@/public/images/logo.jpeg";
import SideBar2 from "../components/SideBar/SideBar2";

// Importing Cairo font from Google Fonts
const cairo = Cairo({ subsets: ["latin", "arabic"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>; // Adjust to match the expected type
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
        <body className="h-full flex flex-col">
          <NextIntlClientProvider messages={messages}>
            {/* Main Header */}
            <MainHeader title={"title"} logoUrl={logoUrl} isRtl={isRtl} />

            {/* Main Content Layout */}
            <div className="flex flex-1 h-full">
              {/* Sidebar */}
              <SideBar2 />

              {/* Page Content */}
              <main className="flex-1 p-4 overflow-auto bg-gray-100">
                {children}
              </main>
            </div>
          </NextIntlClientProvider>
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
