"use client";

import { useTranslations } from "next-intl";
import { FaExclamationTriangle, FaRedo, FaSyncAlt } from "react-icons/fa";

import type { SalaryWalletBatch } from "../types";
import {
  isFinalSalaryStatus,
  isKnownProviderFailureStatus,
  isManualReviewStatus,
} from "../salaryStatus";
import SalaryStatusBadge from "./SalaryStatusBadge";

type Props = {
  batch: SalaryWalletBatch;
  currency: string;
  canPost: boolean;
  busy: boolean;
  onRefresh: () => void;
  onRetry: () => void;
};

const amount = (value?: number | null): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export default function SalaryWalletBatchCard({
  batch,
  currency,
  canPost,
  busy,
  onRefresh,
  onRetry,
}: Props) {
  const t = useTranslations("salaries");
  const status = batch.status ?? batch.overallStatus ?? "pending";
  const providerBatchId = batch.providerBatchId ?? batch.batchId;
  const retryAllowed = batch.retryAllowed === true || batch.canRetry === true;
  const rail = batch.rail ?? batch.walletChannel;
  const isEvo = rail === "evoWallet" || rail === "evo";
  const inferredCanRefresh =
    Boolean(providerBatchId) &&
    batch.reconciliationAvailable !== false &&
    !isFinalSalaryStatus(status);
  const canRefresh = batch.canRefreshStatus ?? inferredCanRefresh;
  const knownProviderFailure = isKnownProviderFailureStatus(status);
  const unknownOutcome =
    !knownProviderFailure &&
    (batch.outcomeKnown === false || isManualReviewStatus(status));
  const manualReview = batch.requiresManualReview === true || unknownOutcome;
  const reviewMessage = unknownOutcome
    ? t("unknownOutcomeNoRetry")
    : knownProviderFailure
      ? t("knownProviderFailureManualReview")
      : t("manualReviewFollowUp");
  const lastCheckedAt = batch.lastCheckedAt ?? batch.lastStatusCheckedAt;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-900">
            {isEvo ? t("channelEvo") : t("channelBcd")}
          </h3>
          <SalaryStatusBadge status={status} />
        </div>
        <div className="flex gap-2">
          {canRefresh && (
            <button type="button" onClick={onRefresh} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
              <FaSyncAlt className={busy ? "animate-spin" : ""} />
              {t("refreshStatus")}
            </button>
          )}
          {retryAllowed && !manualReview && canPost && (
            <button type="button" onClick={onRetry} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-info-dark px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <FaRedo />
              {t("retrySafeDispatch")}
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <BatchValue label={t("providerBatchId")} value={providerBatchId || "-"} mono />
        <BatchValue label={t("coreFundingStatus")} value={batch.coreFundingStatus || "-"} />
        <BatchValue label={t("coreFundingReference")} value={batch.coreFundingReference ?? batch.coreReferenceId ?? "-"} mono />
        <BatchValue label={t("requestedAmount")} value={`${amount(batch.requestedTotalAmount ?? batch.totalAmount).toLocaleString()} ${currency}`} />
        <BatchValue label={t("successfulAmount")} value={`${amount(batch.successfulTotalAmount).toLocaleString()} ${currency}`} />
        <BatchValue label={t("failedAmount")} value={`${amount(batch.failedTotalAmount).toLocaleString()} ${currency}`} />
        <BatchValue label={t("totalCommission")} value={`${amount(batch.totalCommission ?? batch.commission).toLocaleString()} ${currency}`} />
        <BatchValue label={t("senderCommission")} value={`${amount(batch.senderCommission).toLocaleString()} ${currency}`} />
        <BatchValue label={t("receiverCommission")} value={`${amount(batch.receiverCommission).toLocaleString()} ${currency}`} />
        <BatchValue label={t("providerDebitAmount")} value={`${amount(batch.debitAmount).toLocaleString()} ${currency}`} />
        {(batch.reversalStatus && batch.reversalStatus !== "notRequired" || amount(batch.reversalAmount) > 0) && (
          <>
            <BatchValue label={t("reversalStatus")} value={batch.reversalStatus || "-"} />
            <BatchValue label={t("reversalAmount")} value={`${amount(batch.reversalAmount).toLocaleString()} ${currency}`} />
            <BatchValue label={t("reversalReference")} value={batch.reversalReference || "-"} mono />
          </>
        )}
        <BatchValue label={t("lastStatusCheck")} value={lastCheckedAt ? new Date(lastCheckedAt).toLocaleString() : "-"} />
      </div>
      {(manualReview || batch.lastError || batch.errorMessage || batch.reversalError) && (
        <div className={`mx-4 mb-4 flex gap-2 rounded-lg border p-3 text-sm ${manualReview ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-800"}`}>
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <div>
            {manualReview && <div className="font-semibold">{t("manualReviewRequired")}</div>}
            <div>{batch.lastError ?? batch.errorMessage ?? batch.reversalError ?? reviewMessage}</div>
          </div>
        </div>
      )}
    </section>
  );
}

function BatchValue({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 break-all text-sm font-medium text-slate-900 ${mono ? "font-mono" : ""}`} dir={mono ? "ltr" : undefined}>
        {value}
      </div>
    </div>
  );
}
