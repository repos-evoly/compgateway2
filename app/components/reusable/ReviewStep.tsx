"use client";

import React, { useMemo } from "react";
import { FormikProps } from "formik";
import { FiCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";

/* ──────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────── */

/** Convert unknown values to a display-friendly string. */
function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    return value
      .map((v) => (v instanceof File ? v.name : String(v)))
      .join(", ");
  }

  if (typeof value === "object") {
    // For objects (e.g. checkbox groups) build a concise summary.
    const entries = Object.entries(value as Record<string, unknown>);
    const parts: string[] = entries
      .map(([k, v]) => {
        if (typeof v === "boolean") {
          return v ? k : ""; // keep only selected options
        }
        return `${k}: ${formatValue(v)}`;
      })
      .filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  }

  return String(value);
}

/** Split an array into chunks of a given size. */
function chunkArray<T>(array: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

/** fn(fieldName) -> translated label */
type TranslateFieldNameFn = (fieldName: string) => string;

/** Props for the ReviewStep component. */
type ReviewStepProps<FormValues extends Record<string, unknown>> = {
  formik: FormikProps<FormValues>;
  translateFieldName: TranslateFieldNameFn;
  /** Desired number of columns on ≥ lg screens (default 3). */
  fieldsPerRow?: number;
};

/* ──────────────────────────────────────────
 * Component
 * ────────────────────────────────────────── */

export function ReviewStep<FormValues extends Record<string, unknown>>({
  formik,
  translateFieldName,
  fieldsPerRow = 3,
}: ReviewStepProps<FormValues>) {
  const t = useTranslations("reviewStep");

  /* Top-level key/value pairs, excluding empty values. */
  const entries = useMemo(
    () =>
      Object.entries(formik.values).filter(
        ([, v]) => v !== undefined && v !== ""
      ),
    [formik.values]
  );

  /* Break the entries into rows. */
  const rows = useMemo(
    () => chunkArray(entries, fieldsPerRow),
    [entries, fieldsPerRow]
  );

  /* Tailwind grid columns responsive map (mobile-first). */
  const colsClass = useMemo((): string => {
    const map: Record<number, string> = {
      1: "",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-2 md:grid-cols-3",
      4: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      5: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
    };
    return map[fieldsPerRow] ?? "sm:grid-cols-2 md:grid-cols-3";
  }, [fieldsPerRow]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="rounded-t-lg bg-gradient-to-r from-info-dark to-info-dark px-6 py-4">
        <div className="flex items-center space-x-2">
          <FiCheck className="h-5 w-5 text-white" />
          <h3 className="text-xl font-bold text-white">{t("title")}</h3>
        </div>
        <p className="mt-1 text-sm text-white">{t("description")}</p>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100 px-6 py-4">
        {rows.map((group, idx) => (
          <div key={idx} className="py-3">
            <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
              {group.map(([key, value]) => (
                <div key={key} className="rounded border p-2">
                  <div className="text-sm font-medium text-gray-500">
                    {translateFieldName(key)}
                  </div>
                  <div className="mt-1 font-medium text-gray-800 break-words">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
