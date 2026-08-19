"use client";

import { useTranslations } from "next-intl";
import type { OnePayStatus } from "../types";

const STATUS_STYLES: Record<OnePayStatus, string> = {
  pendingApproval: "bg-amber-100 text-amber-800 border-amber-200",
  pendingProviderResponse: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  unknown: "bg-gray-200 text-gray-800 border-gray-300",
};

type OnePayStatusBadgeProps = {
  status: OnePayStatus;
  className?: string;
};

export default function OnePayStatusBadge({
  status,
  className = "",
}: OnePayStatusBadgeProps) {
  const t = useTranslations("onePayTransfer.statuses");

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]} ${className}`}
    >
      {t(status)}
    </span>
  );
}
