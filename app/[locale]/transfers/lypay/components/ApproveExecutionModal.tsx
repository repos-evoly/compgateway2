"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiAlertTriangle, FiCheckCircle, FiLoader, FiX } from "react-icons/fi";
import type { LyPayTransfer } from "../types";
import { formatLyPayAmount } from "../formatters";

type ApproveExecutionModalProps = {
  isOpen: boolean;
  transfer: LyPayTransfer | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ApproveExecutionModal({
  isOpen,
  transfer,
  isSubmitting,
  onClose,
  onConfirm,
}: ApproveExecutionModalProps) {
  const t = useTranslations("lyPayTransfer.approvalModal");
  const locale = useLocale();

  useEffect(() => {
    if (!isOpen || isSubmitting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !transfer) return null;

  const amount = formatLyPayAmount(transfer.amount, locale);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lypay-approval-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <FiAlertTriangle size={21} />
            </span>
            <div>
              <h2 id="lypay-approval-title" className="text-lg font-bold text-slate-900">
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
            className="rounded-full p-2 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {t("warning")}
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">{t("reference")}</dt>
              <dd className="font-semibold text-slate-900">{transfer.referenceNo}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("amount")}</dt>
              <dd className="font-semibold text-slate-900">
                {amount} {transfer.currency}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("fromAccount")}</dt>
              <dd className="break-all font-mono text-slate-900">{transfer.fromAccount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t("toBank")}</dt>
              <dd className="font-semibold text-slate-900">{transfer.toInstitutionName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">{t("recipient")}</dt>
              <dd className="font-semibold text-slate-900">
                {transfer.toAccountName} ({transfer.toAccount})
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {t("back")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiCheckCircle />
            )}
            {isSubmitting ? t("executing") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
