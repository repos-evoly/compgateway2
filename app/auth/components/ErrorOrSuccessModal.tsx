"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

type ErrorOrSuccessModalProps = {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void; // Added for success scenario
};

export default function ErrorOrSuccessModal({
  isOpen,
  isSuccess,
  title,
  message,
  onClose,
  onConfirm,
}: ErrorOrSuccessModalProps) {
  const t = useTranslations("global");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className="relative transform transition-all duration-300 ease-in-out scale-100 opacity-100"
        style={{ animation: "fadeInScale 0.3s ease-out forwards" }}
      >
        <div
          className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
              aria-label={t("close")}
            >
              <FiX size={22} />
            </button>
          </div>

          <div className="text-center py-8">
            <div className="mb-6 flex justify-center">
              {isSuccess ? (
                <div className="rounded-full bg-green-50 p-3">
                  <FiCheckCircle className="text-green-500" size={54} />
                </div>
              ) : (
                <div className="rounded-full bg-red-50 p-3">
                  <FiAlertCircle className="text-red-500" size={54} />
                </div>
              )}
            </div>
            <p className="mb-6 text-gray-700 text-lg">{message}</p>

            {/* If success => show 2 buttons (Ok, Confirm), else => show 1 */}
            {isSuccess ? (
              <div className="flex items-center justify-center gap-4">
                {/* Ok => just close modal */}
                {/* <button
                  onClick={onClose}
                  className="rounded-full px-8 py-2.5 font-medium text-lg transition-all duration-200 shadow-sm hover:shadow-md bg-gradient-to-r bg-info-dark text-white hover:bg-warning-light hover:text-info-dark"
                >
                  حسناً
                </button> */}

                {/* Confirm => call onConfirm if provided */}
                <button
                  onClick={onConfirm || onClose}
                  className="rounded-full px-8 py-2.5 font-medium text-lg transition-all duration-200 shadow-sm hover:shadow-md bg-gradient-to-r bg-info-dark text-white hover:bg-warning-light hover:text-info-dark"
                >
                  {t("confirm")}
                </button>
              </div>
            ) : (
              // Error => single button
              <button
                onClick={onClose}
                className="rounded-full px-8 py-2.5 font-medium text-lg transition-all duration-200 shadow-sm hover:shadow-md bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              >
                {t("ok")}
              </button>
            )}
          </div>
        </div>
      </div>

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
