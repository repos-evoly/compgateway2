"use client";

import React from "react";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
type StatusBannerProps = {
  /** Text shown inside the badge (case-insensitive). */
  status: string;
  /** Optional Tailwind utility overrides. */
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Colour map – extend freely                                          */
/* ------------------------------------------------------------------ */
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  printed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const FALLBACK_STYLE = "bg-gray-100 text-gray-800";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  className = "",
}) => {
  const key = status.toLowerCase();
  const colorClasses = STATUS_STYLES[key] ?? FALLBACK_STYLE;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-0.5 text-sm font-medium ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBanner;
