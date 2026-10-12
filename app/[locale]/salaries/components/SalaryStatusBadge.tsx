"use client";

import { useTranslations } from "next-intl";
import { normalizeSalaryStatus } from "../salaryStatus";

export default function SalaryStatusBadge({ status }: { status?: string | null }) {
  const t = useTranslations("salaries");
  const normalized = normalizeSalaryStatus(status || "pending");
  const label = (() => {
    switch (normalized) {
      case "pending":
        return t("statusPending");
      case "notposted":
        return t("statusNotPosted");
      case "prepared":
        return t("statusPrepared");
      case "posting":
        return t("statusPosting");
      case "completed":
      case "success":
      case "approved":
        return t("statusCompleted");
      case "failed":
        return t("statusFailed");
      case "failedbeforesend":
      case "failedbeforedispatch":
        return t("statusFailedBeforeSend");
      case "fundingfailed":
        return t("statusFundingFailed");
      case "bankfeefailed":
        return t("statusBankFeeFailed");
      case "bankfeeunknown":
        return t("statusBankFeeUnknown");
      case "providerrejectednotprocessed":
        return t("statusProviderRejected");
      case "funding":
        return t("statusFunding");
      case "funded":
        return t("statusFunded");
      case "dispatching":
        return t("statusDispatching");
      case "pendingprovider":
      case "pendingproviderresponse":
        return t("statusPendingProvider");
      case "partiallycompleted":
        return t("statusPartiallyCompleted");
      case "unknown":
      case "manualreview":
        return t("statusManualReview");
      case "reversed":
        return t("statusReversed");
      default:
        return status || t("statusPending");
    }
  })();
  const colors = (() => {
    if (["completed", "success", "approved"].includes(normalized)) {
      return "bg-emerald-100 text-emerald-800";
    }
    if (["failed", "failedbeforesend", "failedbeforedispatch", "fundingfailed", "bankfeefailed", "providerrejectednotprocessed"].includes(normalized)) {
      return "bg-red-100 text-red-800";
    }
    if (["unknown", "manualreview", "partiallycompleted", "bankfeeunknown"].includes(normalized)) {
      return "bg-amber-100 text-amber-900";
    }
    if (normalized === "reversed") return "bg-purple-100 text-purple-800";
    return "bg-blue-100 text-blue-800";
  })();

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}>
      {label}
    </span>
  );
}
