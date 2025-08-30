/* --------------------------------------------------------------------------
   app/components/reusable/ReasonBanner.tsx
   – Status banner.
   – Variants:
       • approved → green (title only, no description/body)
       • rejected → yellow (shows the provided reason)
   – i18n (namespace: common):
       • approveReason
       • rejectReason
   – Strict TypeScript (no any), no missing lines.
-------------------------------------------------------------------------- */
"use client";

import React from "react";
import { useTranslations } from "next-intl";

type ReasonBannerProps = {
  /** Reason text; used only for "rejected". May be null/empty for "approved". */
  reason?: string | null;
  /** Visual/status variant; controls colors and content. */
  status: "rejected" | "approved";
};

const ReasonBanner: React.FC<ReasonBannerProps> = ({ reason, status }) => {
  const t = useTranslations("common");

  const isApproved = status === "approved";
  const hasReason = (reason?.trim() ?? "").length > 0;

  // If rejected and no reason provided, hide the banner entirely.
  if (!isApproved && !hasReason) return null;

  const containerClasses = isApproved
    ? "rounded-md border-l-4 border-green-500 bg-green-50 p-4"
    : "rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4";

  const titleClasses = isApproved
    ? "text-sm font-semibold text-green-800"
    : "text-sm font-semibold text-yellow-800";

  const rejectTextClasses = "mt-1 text-sm text-yellow-700 whitespace-pre-wrap";

  const title = isApproved ? t("approveReason") : t("rejectReason");

  return (
    <div className="px-6 mb-2" role="status" aria-live="polite">
      <div className={containerClasses}>
        <p className={titleClasses}>{title}</p>
        {!isApproved && hasReason && (
          <p className={rejectTextClasses}>{reason!.trim()}</p>
        )}
      </div>
    </div>
  );
};

export default ReasonBanner;
