import type { TSalaryTransaction } from "./types";

export const normalizeSalaryStatus = (value?: string | null): string =>
  (value ?? "").replace(/[\s_-]/g, "").toLowerCase();

export const isSalaryProcessingStatus = (value?: string | null): boolean =>
  ["pending", "pendingprovider", "processing", "posting", "prepared", "funding", "funded", "dispatching"].includes(normalizeSalaryStatus(value));

export const getSalaryResultTone = (
  value?: string | null,
  requiresManualReview = false
): "success" | "warning" | "error" => {
  const status = normalizeSalaryStatus(value);
  if (["failed", "failedbeforedispatch", "partiallycompleted", "bankfeefailed"].includes(status)) return "error";
  if (requiresManualReview) return "warning";
  if (["completed", "success", "approved"].includes(status)) return "success";
  return "warning";
};

export const isSalaryCycleCompleted = (
  cycle: Pick<
    TSalaryTransaction,
    "postingStatus" | "postedAt" | "bankFeeStatus"
  >
): boolean => {
  const bankFeeStatus = normalizeSalaryStatus(cycle.bankFeeStatus);
  if (bankFeeStatus === "failed" || bankFeeStatus === "unknown") {
    return false;
  }

  const postingStatus = cycle.postingStatus?.trim();
  if (postingStatus) {
    return normalizeSalaryStatus(postingStatus) === "completed";
  }

  // Compatibility for records created before postingStatus was persisted.
  return Boolean(cycle.postedAt);
};

export const getSalaryCycleDisplayStatus = (
  cycle: Pick<
    TSalaryTransaction,
    "postingStatus" | "status" | "postedAt" | "bankFeeStatus"
  >
): string => {
  const bankFeeStatus = normalizeSalaryStatus(cycle.bankFeeStatus);
  if (bankFeeStatus === "failed") return "bankFeeFailed";
  if (bankFeeStatus === "unknown") return "bankFeeUnknown";

  return (
    cycle.postingStatus?.trim() ||
    (isSalaryCycleCompleted(cycle)
      ? "completed"
      : cycle.status?.trim() || "notPosted")
  );
};

export const isManualReviewStatus = (value?: string | null): boolean => {
  const status = normalizeSalaryStatus(value);
  return status === "unknown" || status === "manualreview";
};

export const isKnownProviderFailureStatus = (
  value?: string | null
): boolean => {
  const status = normalizeSalaryStatus(value);
  return status === "failed" || status === "partiallycompleted";
};

export const isFinalSalaryStatus = (value?: string | null): boolean => {
  const status = normalizeSalaryStatus(value);
  return [
    "completed",
    "success",
    "approved",
    "partiallycompleted",
    "failed",
    "unknown",
    "manualreview",
    "reversed",
  ].includes(status);
};

// Prefer persisted provider reasons over a generic cycle status in result dialogs.
export const getSalaryFailureMessage = (
  cycle: TSalaryTransaction,
  batchId?: number
): string | undefined => {
  const batches = (cycle.walletBatches ?? []).filter(batch =>
    (batchId === undefined || batch.id === batchId) &&
    getSalaryResultTone(batch.status ?? batch.overallStatus) !== "success"
  );
  const reasons = batches.map(batch => batch.lastError || batch.errorMessage);
  if (batchId === undefined && cycle.bankFeeError) reasons.push(cycle.bankFeeError);
  const messages = [...new Set(reasons.map(reason => reason?.trim()).filter(Boolean))];
  return messages.length ? messages.join("; ") : undefined;
};
