// components/SingleCompanyPage/CompanyNotFound.tsx

"use client";

import React from "react";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface CompanyNotFoundProps {
  onBack: () => void;
}

export default function CompanyNotFound({ onBack }: CompanyNotFoundProps) {
  const t = useTranslations("profile");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-md w-full mx-4">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <FiAlertCircle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {t("companyNotFound.title")}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t("companyNotFound.subtitle")}
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            <FiArrowLeft className="text-sm" />
            {t("companyNotFound.returnButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
