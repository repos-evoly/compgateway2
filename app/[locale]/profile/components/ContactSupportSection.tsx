// components/SingleCompanyPage/ContactSupportSection.tsx
"use client";

import React from "react";
import { FiLifeBuoy, FiPhone, FiMail } from "react-icons/fi";
import { useTranslations } from "next-intl";

/**
 * A static “Contact Support” card – **no props, no API calls**.
 * Hard-coded support phone, e-mail, and availability.
 */
export default function ContactSupportSection() {
  const t = useTranslations("profile.contactSupportSection");

  /* Hard-coded details */
  const SUPPORT_PHONE = "+961 1 234 567";
  const SUPPORT_EMAIL = "support@compgateway.com";

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
        {/* Phone */}
        <div className="flex items-start gap-3">
          <FiPhone className="text-gray-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">{t("phone")}</p>
            <p className="text-sm font-semibold text-gray-900">
              {SUPPORT_PHONE}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <FiMail className="text-gray-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">{t("email")}</p>
            <p className="text-sm font-semibold text-gray-900">
              {SUPPORT_EMAIL}
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
