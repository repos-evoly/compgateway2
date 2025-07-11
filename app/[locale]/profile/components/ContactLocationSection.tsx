// components/SingleCompanyPage/ContactLocationSection.tsx
"use client";

import React from "react";
import { FiMapPin, FiPhone, FiFlag, FiClock } from "react-icons/fi";
import { MdOutlineLocationCity } from "react-icons/md";
import { useTranslations } from "next-intl";
import { Company } from "../types";

export default function ContactLocationSection({
  company,
}: {
  company: Company;
}) {
  const tContact = useTranslations("profile.contactLocationSection");
  const tKyc = useTranslations("profile.kycTimelineSection");

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiMapPin className="text-gray-600" />
          {tContact("title")}
        </h2>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* ───────────────── Contact / Location ───────────────── */}
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <FiPhone className="text-gray-400" />
              {tContact("primaryContactNumber")}
            </dt>
            <dd className="text-sm text-gray-900 font-medium">
              {company?.kycMobile || tContact("missingKyc")}
            </dd>
          </div>

          {/* City */}
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <MdOutlineLocationCity className="text-gray-400" />
              {tContact("cityOfOperations")}
            </dt>
            <dd className="text-sm text-gray-900 font-medium">
              {company?.kycCity || tContact("missingKyc")}
            </dd>
          </div>

          {/* Nationality / Jurisdiction */}
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
              <FiFlag className="text-gray-400" />
              {tContact("nationalityJurisdiction")}
            </dt>
            <dd className="text-sm text-gray-900 font-medium">
              {company?.kycNationality || tContact("missingKyc")}
            </dd>
          </div>
        </dl>

        {/* ───────────────── Divider ───────────────── */}
        <hr className="border-gray-200" />

        {/* ───────────────── KYC Timeline ───────────────── */}
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-800">
              {tKyc("title")}
            </span>
          </div>

          {/* Requested */}
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {tKyc("requestSubmitted")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(company.kycRequestedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                {tKyc("at")}{" "}
                {new Date(company.kycRequestedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Reviewed */}
          {company.kycReviewedAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {tKyc("reviewCompleted")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(company.kycReviewedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  {tKyc("at")}{" "}
                  {new Date(company.kycReviewedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
