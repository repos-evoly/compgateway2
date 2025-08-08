/* --------------------------------------------------------------------------
   app/components/reusable/ReasonBanner.tsx
   – Shows a yellow “reason” banner when a reason exists; renders nothing
     when the prop is empty/undefined.
   – Copy-paste ready, strict TypeScript, no missing lines.
   -------------------------------------------------------------------------- */
"use client";

import React from "react";

type ReasonBannerProps = {
  /** The reject / failure reason text */
  reason?: string | null;
  /** Heading shown above the text (defaults to “Reason”) */
  label?: string;
};

const ReasonBanner: React.FC<ReasonBannerProps> = ({
  reason,
  label = "Reason",
}) => {
  if (!reason) return null; // show nothing if there is no reason

  return (
    <div className="px-6 pt-4">
      <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">{label}</p>
        <p className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
          {reason}
        </p>
      </div>
    </div>
  );
};

export default ReasonBanner;
