/* --------------------------------------------------------------------------
   components/ConfirmationModal.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { JSX } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClipboard,
} from "react-icons/fi";
import { useTranslations } from "next-intl";

import { Company } from "../types";

type RegistrationStatus =
  | "MissingsDocuments"
  | "MissingKyc"
  | "MissingInformation"
  | "UnderReview"
  | "Approved"
  | "Active"
  | "Rejected";

type Props = {
  company: Company;
  action: RegistrationStatus;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmationModal({
  company,
  action,
  message,
  onClose,
  onConfirm,
}: Props): JSX.Element {
  const t = useTranslations("profile.confirmationModal");

  const requiresMsg = [
    "MissingsDocuments",
    "MissingKyc",
    "MissingInformation",
    "UnderReview",
    "Rejected",
  ].includes(action);

  const displayName = (status: RegistrationStatus): string =>
    status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();

  const icon =
    action === "Approved" || action === "Active" ? (
      <FiCheckCircle className="text-emerald-600 text-xl" />
    ) : action === "Rejected" ? (
      <FiXCircle className="text-red-600 text-xl" />
    ) : (
      <FiAlertCircle className="text-amber-600 text-xl" />
    );

  const bg =
    action === "Approved" || action === "Active"
      ? "bg-emerald-100"
      : action === "Rejected"
      ? "bg-red-100"
      : "bg-amber-100";

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FiClipboard />
          <h3 className="text-lg font-semibold text-gray-900">{t("title")}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
            >
              {icon}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-4">
                {t("youAreAboutToSet", {
                  company: company.name,
                  status: displayName(action),
                })}
              </p>

              {requiresMsg && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-gray-900 font-medium">
                    {t("messageLabel")}
                  </p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                    {message || "—"}
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-600">{t("areYouSure")}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
                    ${
                      action === "Rejected"
                        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        : action === "Approved" || action === "Active"
                        ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                        : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                    }
                  `}
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
