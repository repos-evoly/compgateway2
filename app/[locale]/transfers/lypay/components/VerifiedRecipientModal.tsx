"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCheckCircle, FiLoader, FiShield, FiX } from "react-icons/fi";
import type { LyPayValidationResponse } from "../types";
import { formatLyPayAmount, formatLyPayDateTime } from "../formatters";

type VerifiedRecipientModalProps = {
  isOpen: boolean;
  validation: LyPayValidationResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function VerifiedRecipientModal({
  isOpen,
  validation,
  isSubmitting,
  onClose,
  onConfirm,
}: VerifiedRecipientModalProps) {
  const t = useTranslations("lyPayTransfer.validationModal");
  const locale = useLocale();

  useEffect(() => {
    if (!isOpen || isSubmitting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !validation) return null;

  const amount = formatLyPayAmount(validation.amount, locale);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lypay-validation-title"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
              <FiShield size={22} />
            </span>
            <div>
              <h2 id="lypay-validation-title" className="text-xl font-bold text-slate-900">
                {t("title")}
              </h2>
              <p className="text-sm text-slate-600">{t("subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={t("close")}
            className="rounded-full p-2 text-slate-500 hover:bg-white/80 disabled:opacity-50"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <FiCheckCircle className="mx-auto mb-2 text-emerald-600" size={30} />
            <p className="text-sm text-emerald-800">{t("verifiedRecipient")}</p>
            <p className="mt-1 text-xl font-bold text-emerald-950">
              {validation.toAccountName}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">{t("fromAccount")}</dt>
              <dd className="break-all font-mono font-medium text-slate-900">
                {validation.fromAccount}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("toBank")}</dt>
              <dd className="font-semibold text-slate-900">
                {validation.institutionName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("toAccount")}</dt>
              <dd className="break-all font-mono font-medium text-slate-900">
                {validation.toAccount}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("amount")}</dt>
              <dd className="font-bold text-slate-900">
                {amount} {validation.currency}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">{t("narrative")}</dt>
              <dd className="whitespace-pre-wrap text-slate-900">
                {validation.description}
              </dd>
            </div>
            {validation.expiresAt && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">{t("validUntil")}</dt>
                <dd className="text-slate-900">
                  {formatLyPayDateTime(validation.expiresAt, locale)}
                </dd>
              </div>
            )}
          </dl>

          <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            {t("makerCheckerNote")}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {t("backToForm")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-info-dark px-5 py-2.5 font-semibold text-white hover:bg-warning-light hover:text-info-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiCheckCircle />
            )}
            {isSubmitting ? t("submitting") : t("confirmAndSubmit")}
          </button>
        </div>
      </div>
    </div>
  );
}
