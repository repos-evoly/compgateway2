/* --------------------------------------------------------------------------
   components/SingleCompanyPage/HeaderSection.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { JSX } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useTranslations } from "next-intl";
import { Company } from "../types";

type HeaderSectionProps = {
  company: Company;
  getStatusBadge: (status: string) => JSX.Element;
  getActiveBadge: (isActive: boolean) => JSX.Element;
  /** Optional path BackButton should navigate to when `isEditing` is `true`. */
  fallbackPath?: string;
  /** Set `true` if the page is in “edit” mode so BackButton uses `fallbackPath`. */
  isEditing?: boolean;
};

export default function HeaderSection({
  company,
  getStatusBadge,
}: HeaderSectionProps): JSX.Element {
  const t = useTranslations("profile.headerSection");

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Left – back button, logo & meta */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 bg-info-dark rounded-lg flex items-center justify-center">
              <HiOutlineOfficeBuilding className="text-white text-xl" />
            </div>

            <div className="flex ">
              <h1 className="text-2xl font-bold text-gray-900">
                {company.name}
              </h1>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-gray-500 mr-2 ml-2">
                  {t("code")} {company.code}
                </span>
              </div>
            </div>
          </div>

          {/* Right – registration status */}
          <div className="mt-4 sm:mt-0">
            {getStatusBadge(company.registrationStatus)}
          </div>
        </div>
      </div>
    </div>
  );
}
