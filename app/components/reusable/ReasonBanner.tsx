/* --------------------------------------------------------------------------
   app/components/reusable/ReasonBanner.tsx
   – Shows a yellow “reason” banner when a reason exists; renders nothing
     when the prop is empty/undefined.
   – Uses a single translation key: Common.rejectReason
   – Copy-paste ready, strict TypeScript, no missing lines.
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
import { useTranslations } from "next-intl";

type ReasonBannerProps = {
  /** The reject / failure reason text */
  reason?: string | null;
};

const ReasonBanner: React.FC<ReasonBannerProps> = ({ reason }) => {
  const t = useTranslations("common");

  if (!reason) return null;

  return (
    <div className="px-6 mb-2">
      <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">
          {t("rejectReason")}
        </p>
        <p className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
          {reason}
        </p>
      </div>
    </div>
  );
};

export default ReasonBanner;
