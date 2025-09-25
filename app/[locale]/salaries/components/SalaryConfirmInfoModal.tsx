/* --------------------------------------------------------------------------
   app/[locale]/salaries/components/SalaryConfirmInfoModal.tsx
   – Same design as ConfirmInfoModal
   – Wider (max-w-5xl)
   – "To" table columns: # | Account Number | Employee Name | Employee Amount
   – Shows per-employee salary amount (matches grid). Accepts number OR string.
   – Strict TypeScript (no `any`), no string splitting for `to` (array only)
   – All hooks declared before early return
-------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { FiCheckCircle, FiX, FiArrowRight } from "react-icons/fi";

export type RecipientRow = {
  accountNumber: string;
  name?: string;
  /** Salary can arrive as number (from grid) or string (API/stringified). */
  salary?: number | string;
};

export type SalaryConfirmInfoModalProps = {
  isOpen: boolean;
  formData: {
    from: string;
    to: string[]; // array of account numbers
    value: number;
    description: string;
    commissionOnRecipient: boolean;
  };
  commissionAmount: number;
  commissionCurrency: string;
  displayAmount: number;

  /** Detailed rows so we can show names and amounts with accounts */
  recipients?: RecipientRow[];

  onClose: () => void;
  onConfirm: () => void;
};

/* -------------------------------- Helpers -------------------------------- */
const normalizeNumber = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const s = v.replace(/,/g, "").trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export default function SalaryConfirmInfoModal({
  isOpen,
  formData,
  commissionCurrency,
  displayAmount,
  recipients = [],
  onClose,
  onConfirm,
}: SalaryConfirmInfoModalProps) {
  const t = useTranslations("groupTransferForm.modal");

  /* ----------------- HOOKS (must come before any early return) ---------------- */

  // ESC to close
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, onClose]);

  // Build rows (prefer detailed `recipients`; fallback to `formData.to`)
  const rows: RecipientRow[] = useMemo<RecipientRow[]>(() => {
    if (recipients.length > 0) return recipients;
    // Deduplicate accounts from `to`
    const seen = new Set<string>();
    const out: RecipientRow[] = [];
    for (const acc of formData.to) {
      const trimmed = acc.trim();
      if (trimmed.length === 0) continue;
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        out.push({ accountNumber: trimmed });
      }
    }
    return out;
  }, [recipients, formData.to]);

  /* ------------------------ SAFE EARLY RETURN AFTER HOOKS -------------------- */
  if (!isOpen) return null;

  /* ------------------------ Direction-aware alignment ------------------------ */
  const dir: "rtl" | "ltr" =
    typeof document !== "undefined" &&
    document.documentElement.dir.toLowerCase() === "rtl"
      ? "rtl"
      : "ltr";
  const alignStart = dir === "rtl" ? "text-right" : "text-left";

  const { from, description, commissionOnRecipient } = formData;

  /* ----------------------------------- UI ----------------------------------- */
  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
    >
      {/* Wider container */}
      <div className="w-full max-w-5xl mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-info-main/20 to-info-dark/10 px-8 py-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-info-dark rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("title")}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{t("subtitle")}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
            >
              <FiX className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {/* Summary */}
          <div className="bg-gradient-to-br from-info-main/20 to-info-dark/10 rounded-xl p-6 mb-6 border border-info-main/30 text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {displayAmount.toLocaleString()} {commissionCurrency}
            </div>
            <div className="text-sm text-slate-600">
              {commissionOnRecipient ? t("amount") : t("amountPlusFee")}
            </div>

            {/* Flow */}
            <div className="mt-6">
              {/* From Account Table */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  {t("from")}
                </h4>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th
                          className={`px-4 py-2 ${alignStart} text-xs font-medium text-slate-600 border-b border-slate-200`}
                        >
                          {t("accountNumber", {
                            defaultValue: "Account Number",
                          })}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          className={`px-4 py-3 text-sm font-mono text-slate-900 ${alignStart}`}
                        >
                          {from}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-4">
                <FiArrowRight
                  className={`w-8 h-8 text-info-dark ${
                    dir === "rtl" ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* To Accounts Table – shows Employee Amount (same as grid) */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  {t("to")}
                </h4>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th
                            className={`px-4 py-2 ${alignStart} text-xs font-medium text-slate-600 border-b border-slate-200`}
                          >
                            #
                          </th>
                          <th
                            className={`px-4 py-2 ${alignStart} text-xs font-medium text-slate-600 border-b border-slate-200`}
                          >
                            {t("accountNumber", {
                              defaultValue: "Account Number",
                            })}
                          </th>
                          <th
                            className={`px-4 py-2 ${alignStart} text-xs font-medium text-slate-600 border-b border-slate-200`}
                          >
                            {t("employeeName", {
                              defaultValue: "Employee Name",
                            })}
                          </th>
                          <th
                            className={`px-4 py-2 ${alignStart} text-xs font-medium text-slate-600 border-b border-slate-200`}
                          >
                            {t("employeeAmount", {
                              defaultValue: "Employee Amount",
                            })}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => {
                          const amount = normalizeNumber(row.salary);
                          return (
                            <tr
                              key={`${row.accountNumber}-${index}`}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-slate-50"
                              }
                            >
                              <td
                                className={`px-4 py-2 text-sm font-medium text-slate-600 border-b border-slate-100 ${alignStart}`}
                              >
                                {index + 1}
                              </td>
                              <td
                                className={`px-4 py-2 text-sm font-mono text-slate-900 border-b border-slate-100 ${alignStart}`}
                              >
                                {row.accountNumber}
                              </td>
                              <td
                                className={`px-4 py-2 text-sm text-slate-900 border-b border-slate-100 ${alignStart}`}
                              >
                                {row.name ?? "—"}
                              </td>
                              <td
                                className={`px-4 py-2 text-sm text-slate-900 border-b border-slate-100 ${alignStart}`}
                              >
                                {amount !== null
                                  ? `${amount.toLocaleString()} ${commissionCurrency}`
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                        {rows.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className={`px-4 py-3 text-sm text-slate-500 text-center border-b border-slate-100 ${alignStart}`}
                            >
                              {t("noRecipients", {
                                defaultValue: "No recipients found.",
                              })}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t("transactionDetails")}
          </h3>

          {/* Description */}
          <div className="flex justify-between items-start py-3 border-b border-slate-100">
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-600 mb-1">
                {t("description")}
              </div>
              <div className="text-slate-900 text-sm">
                {description || t("noDescription")}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex-shrink-0">
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all duration-200"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-8 py-2.5 bg-info-dark text-white font-semibold rounded-lg hover:bg-warning-light hover:text-info-dark transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t("confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
