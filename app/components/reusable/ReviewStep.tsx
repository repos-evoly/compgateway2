"use client";

import React from "react";
import { FormikProps } from "formik";
import { FiCheck } from "react-icons/fi";

// 1) Convert unknown values to a user-friendly string.
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    // For file arrays, you'd show file names or something similar
    return value
      .map((v) => (v instanceof File ? v.name : String(v)))
      .join(", ");
  }
  return String(value) || "—";
}

// 2) Split an array into chunks of a given size.
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

// 3) A function type for translating or labeling a field name.
type TranslateFieldNameFn = (fieldName: string) => string;

// 4) The typed props for this reusable ReviewStep.
type ReviewStepProps<FormValues extends Record<string, unknown>> = {
  formik: FormikProps<FormValues>;
  translateFieldName: TranslateFieldNameFn;
  fieldsPerRow?: number; // e.g., 3 => 3 columns per row
};

export function ReviewStep<FormValues extends Record<string, unknown>>({
  formik,
  translateFieldName,
  fieldsPerRow = 3,
}: ReviewStepProps<FormValues>) {
  // Convert form values into [key, value] pairs, filtering out empty or undefined
  const rawEntries = Object.entries(formik.values).filter(
    ([, val]) => val !== undefined && val !== ""
  );

  // Break these into rows
  const chunkedEntries = chunkArray(rawEntries, fieldsPerRow);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-info-dark to-info-dark px-6 py-4 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <FiCheck className="h-5 w-5 text-white" />
          {/* You could also localize this title if desired */}
          <h3 className="text-xl font-bold text-white">Review Information</h3>
        </div>
        <p className="mt-1 text-sm text-white">
          Please confirm all details are correct before submitting
        </p>
      </div>

      {/* Body: chunked rows */}
      <div className="divide-y divide-gray-100 px-6 py-4">
        {chunkedEntries.map((group, groupIndex) => (
          <div key={groupIndex} className="py-3">
            {/*
              For a dynamic columns approach in Tailwind, you might need 
              a custom utility. If you're sure you only want 3 columns,
              you can replace `grid-cols-${fieldsPerRow}` with a fixed 
              class like `grid-cols-3`. 
            */}
            <div className={`grid grid-cols-${fieldsPerRow} gap-4`}>
              {group.map(([key, value]) => {
                // Use the translation function to get the label
                const label = translateFieldName(key);
                return (
                  <div key={key} className="border rounded p-2">
                    <div className="text-sm font-medium text-gray-500">
                      {label}
                    </div>
                    <div className="mt-1 font-medium text-gray-800">
                      {formatValue(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
