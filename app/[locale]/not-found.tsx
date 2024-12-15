"use client";

import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">{t("title")}</h1>
        <p className="mt-4 text-lg text-gray-600">{t("des")}</p>
      </div>
    </div>
  );
}
