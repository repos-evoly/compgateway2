/* --------------------------------------------------------------------------
   components/Step1TransferInfo.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import { step1Inputs } from "./formInputsArrays";

type Step1TransferInfoProps = { readOnly?: boolean };

/**
 * Step 1 — three logical “rows” rendered responsively.
 */
export function Step1TransferInfo({
  readOnly = false,
}: Step1TransferInfoProps) {
  const t = useTranslations("foreignTransfers");

  /* pick inputs by position */
  const row1 = [step1Inputs[0], step1Inputs[1], step1Inputs[2]];
  const row2 = [step1Inputs[3], step1Inputs[4], step1Inputs[5], step1Inputs[6]];
  const row3 = [step1Inputs[7], step1Inputs[8]];

  const renderField = (field: (typeof step1Inputs)[number]) =>
    field.type === "datePicker" ? (
      <DatePickerValue
        key={field.name}
        name={field.name}
        label={t(field.label)}
        disabled={readOnly}
      />
    ) : (
      <FormInputIcon
        key={field.name}
        name={field.name}
        label={t(field.label)}
        type={field.type}
        startIcon={field.icon}
        disabled={readOnly}
      />
    );

  return (
    <div className="space-y-4">
      {/* Row 1 ─ 1 / 2 / 3 columns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {row1.map(renderField)}
      </div>

      {/* Row 2 ─ stack → 2 cols → 4 cols */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {row2.map(renderField)}
      </div>

      {/* Row 3 ─ full-width then 2-column asymmetric */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_2fr]">
        {row3.map(renderField)}
      </div>
    </div>
  );
}
