// components/SingleCompanyPage/ContactSupportSection.tsx
"use client";

import React from "react";
import { FiLifeBuoy, FiPhone, FiMail } from "react-icons/fi";
import { useTranslations } from "next-intl";

/**
 * “Contact Support” card showing the real phone numbers.
 * Keeps the same layout, icons, and translation keys as before.
 */
export default function ContactSupportSection() {
  const t = useTranslations("profile.contactSupportSection");

  /* Real support numbers */
  const LOCAL_PHONE = "1595"; // داخل ليبيا
  const INTERNATIONAL_PHONE = "+218 21 366 0451";

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiLifeBuoy className="text-gray-600" />
          {t("title")}
        </h2>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-4">
        {/* Local phone number */}
        <div className="flex items-start gap-3">
          <FiPhone className="text-gray-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">{t("phone")}</p>
            <p className="text-sm font-semibold text-gray-900">{LOCAL_PHONE}</p>
          </div>
        </div>

        {/* International phone number */}
        <div className="flex items-start gap-3">
          <FiMail className="text-gray-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">{t("email")}</p>
            <p className="text-sm font-semibold text-gray-900">
              {INTERNATIONAL_PHONE}
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-start gap-3">
          <FiLifeBuoy className="text-gray-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("availability")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
