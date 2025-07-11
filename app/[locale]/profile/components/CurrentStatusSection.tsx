// components/SingleCompanyPage/CurrentStatusSection.tsx

"use client";

import React, { JSX } from "react";
import { MdOutlineVerified } from "react-icons/md";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Company } from "../types";

interface Props {
  company: Company;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function CurrentStatusSection({
  company,
  getStatusBadge,
}: Props) {
  const t = useTranslations("profile.currentStatusSection");

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MdOutlineVerified className="text-gray-600" />
          {t("title")}
        </h2>
      </div>
      <div className="px-6 py-6 text-center">
        <div className="mb-4">{getStatusBadge(company.registrationStatus)}</div>
        <p className="text-sm text-gray-600">
          {t("subtitle1")}{" "}
          <span className="font-medium text-gray-900">
            {company.registrationStatus.toLowerCase()}
          </span>
          .
        </p>

        {company.RegistrationStatusMessage && (
          <div className="mt-4 bg-info-main border border-info-dark rounded-md p-3">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-black text-sm mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-medium text-black">
                  {t("additionalInfo")}
                </p>
                <p className="text-xs text-black mt-1">
                  {company.RegistrationStatusMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
