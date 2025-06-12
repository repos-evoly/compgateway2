// app/components/reusable/ConfirmInfoModal.tsx
"use client";

import React, { useEffect } from "react";
import { AdditionalData } from "../types"; // adjust the path if needed
import {
  FiCheckCircle,
  FiX,
  FiUser,
  FiArrowRight,
  FiAlertTriangle,
} from "react-icons/fi";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ConfirmInfoModalProps = {
  isOpen: boolean;
  formData: {
    from: string;
    to: string;
    value: number;
    description: string;
    commissionOnRecipient: boolean;
  };
  commissionAmount: number;
  commissionCurrency: string;
  additionalData?: AdditionalData;
  onClose: () => void;
  onConfirm: () => void;
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function ConfirmInfoModal({
  isOpen,
  formData,
  commissionAmount,
  commissionCurrency,
  onClose,
  onConfirm,
}: ConfirmInfoModalProps) {
  /* -------------------------- Close on Escape key ------------------------- */
  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ------------------ Detect page direction (LTR / RTL) ------------------- */
  const dir =
    typeof document !== "undefined" &&
    document.documentElement.dir.toLowerCase() === "rtl"
      ? "rtl"
      : "ltr";

  const { from, to, value, description, commissionOnRecipient } = formData;

  const payerLtr = commissionOnRecipient ? "recipient" : "sender";
  const payerRtl = commissionOnRecipient ? "المستلم" : "المرسل";

  /* --------------------------- Modal UI body ------------------------------ */
  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-info-main/20 to-info-dark/10 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-info-dark rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {dir === "rtl"
                    ? "تأكيد تفاصيل التحويل"
                    : "Transfer Confirmation"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {dir === "rtl"
                    ? "يرجى مراجعة التفاصيل بعناية"
                    : "Please review the details carefully"}
                </p>
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

        {/* Content */}
        <div className="px-8 py-6">
          {/* Transaction Summary Card */}
          <div className="bg-gradient-to-br from-info-main/20 to-info-dark/10 rounded-xl p-6 mb-6 border border-info-main/30">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {value.toLocaleString()} {commissionCurrency}
              </div>
              <div className="text-sm text-slate-600">
                {dir === "rtl" ? "مبلغ التحويل" : "Transfer Amount"}
              </div>
            </div>

            {/* Transfer Flow */}
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-info-main/20">
                  <FiUser className="w-6 h-6 text-info-dark" />
                </div>
                <div className="text-xs text-slate-600 font-medium mb-1">
                  {dir === "rtl" ? "من" : "FROM"}
                </div>
                <div className="text-xs text-slate-900 font-mono truncate px-1">
                  {from}
                </div>
              </div>

              <div className="flex-shrink-0">
                <FiArrowRight
                  className={`w-8 h-8 text-info-dark ${
                    dir === "rtl" ? "rotate-180" : ""
                  }`}
                />
              </div>

              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-info-main/20">
                  <FiUser className="w-6 h-6 text-info-dark" />
                </div>
                <div className="text-xs text-slate-600 font-medium mb-1">
                  {dir === "rtl" ? "إلى" : "TO"}
                </div>
                <div className="text-xs text-slate-900 font-mono truncate px-1">
                  {to}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {dir === "rtl" ? "تفاصيل المعاملة" : "Transaction Details"}
            </h3>

            <div className="space-y-3">
              {/* Description */}
              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-600 mb-1">
                    {dir === "rtl" ? "الوصف" : "Description"}
                  </div>
                  <div className="text-slate-900 text-sm">
                    {description ||
                      (dir === "rtl"
                        ? "لا يوجد وصف"
                        : "No description provided")}
                  </div>
                </div>
              </div>

              {/* Commission Details */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiAlertTriangle className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-800 mb-1">
                      {dir === "rtl" ? "رسوم التحويل" : "Transfer Fee"}
                    </div>
                    <div className="text-sm text-amber-700">
                      {dir === "rtl"
                        ? `سيتم خصم رسوم قدرها ${commissionAmount} ${commissionCurrency} من ${payerRtl}`
                        : `A fee of ${commissionAmount} ${commissionCurrency} will be charged to the ${payerLtr}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {dir === "rtl" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-8 py-2.5 bg-gradient-to-r bg-info-dark text-white font-semibold rounded-lg hover:bg-warning-light hover:text-info-dark transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-info-main focus:ring-offset-2"
            >
              {dir === "rtl" ? "تأكيد التحويل" : "Confirm Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
