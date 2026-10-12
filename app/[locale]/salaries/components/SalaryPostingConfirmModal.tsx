"use client";

import { useTranslations } from "next-intl";
import type { SalaryPaymentChannel } from "../../employees/salaryWalletHelpers";

export type SalaryPostingTotals = Record<
  SalaryPaymentChannel,
  { amount: number; count: number }
>;

type Props = {
  isOpen: boolean;
  debitAccount: string;
  currency: string;
  totalAmount: number;
  totals: SalaryPostingTotals;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SalaryPostingConfirmModal({
  isOpen,
  debitAccount,
  currency,
  totalAmount,
  totals,
  submitting,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations("salaries");
  if (!isOpen) return null;

  const rows: Array<[SalaryPaymentChannel, string]> = [
    ["bankAccount", t("channelBank")],
    ["evoWallet", t("channelEvo")],
    ["bcdWallet", t("channelBcd")],
  ];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="salary-post-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="bg-info-dark px-5 py-4 text-white">
          <h2 id="salary-post-title" className="text-lg font-semibold">
            {t("postingConfirmationTitle")}
          </h2>
          <p className="mt-1 text-sm text-white/80">{t("postingConfirmationSubtitle")}</p>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">{t("debitAccount")}</div>
              <div className="mt-1 font-mono font-semibold" dir="ltr">{debitAccount}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">{t("totalAmount")}</div>
              <div className="mt-1 font-semibold">{totalAmount.toLocaleString()} {currency}</div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {rows.map(([channel, label]) => (
              <div key={channel} className="grid grid-cols-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
                <span className="font-medium text-slate-800">{label}</span>
                <span>{totals[channel].count.toLocaleString()} {t("recipients")}</span>
                <span className="text-end font-semibold">{totals[channel].amount.toLocaleString()} {currency}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
            {t("cancel")}
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="rounded-md bg-info-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? t("posting") : t("confirmAndPost")}
          </button>
        </div>
      </div>
    </div>
  );
}
