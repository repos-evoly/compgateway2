// app/auth/components/ErrorOrSuccessModal.tsx
"use client";

import React from "react";
import { FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export type ErrorOrSuccessModalProps = {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;

  /** Optional overrides so you can still localise without next-intl */
  okLabel?: string; // default: "حسناً"
  confirmLabel?: string; // default: "تأكيد"
  closeAriaLabel?: string; // default: "إغلاق"
};

export default function ErrorOrSuccessModal({
  isOpen,
  isSuccess,
  title,
  message,
  onClose,
  onConfirm,
  okLabel = "حسناً",
  confirmLabel = "تأكيد",
  closeAriaLabel = "إغلاق",
}: ErrorOrSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="relative transform transition-all duration-300 ease-in-out"
        style={{ animation: "fadeInScale 0.3s ease-out forwards" }}
      >
        <div className="w-full max-w-md transform rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>

            <button
              onClick={onClose}
              aria-label={closeAriaLabel}
              className="rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Icon & message */}
          <div className="py-8 text-center">
            <div className="mb-6 flex justify-center">
              {isSuccess ? (
                <div className="rounded-full bg-green-50 p-3">
                  <FiCheckCircle size={54} className="text-green-500" />
                </div>
              ) : (
                <div className="rounded-full bg-red-50 p-3">
                  <FiAlertCircle size={54} className="text-red-500" />
                </div>
              )}
            </div>

            <p className="mb-6 text-lg text-gray-700">{message}</p>

            {/* Buttons */}
            {isSuccess ? (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={onConfirm || onClose}
                  className="rounded-full px-8 py-2.5 text-lg font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md bg-info-dark hover:bg-warning-light hover:text-info-dark"
                >
                  {confirmLabel}
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="rounded-full px-8 py-2.5 text-lg font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md bg-red-500 hover:bg-red-600"
              >
                {okLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* local CSS animation */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
