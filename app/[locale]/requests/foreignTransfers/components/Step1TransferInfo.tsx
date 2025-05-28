"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import { step1Inputs } from "./formInputsArrays";

type Step1TransferInfoProps = {
  readOnly?: boolean;
};

/**
 * Step 1 => 3 "rows" layout
 */
export function Step1TransferInfo({
  readOnly = false,
}: Step1TransferInfoProps) {
  const t = useTranslations("foreignTransfers");

  // Make sure your step1Inputs array has these fields:
  //   toBank, branch, residentSupplierName
  //   residentSupplierNationality, nonResidentPassportNumber, placeOfIssue, dateOfIssue
  //   nonResidentNationality, nonResidentAddress
  const row1 = [step1Inputs[0], step1Inputs[1], step1Inputs[2]];
  const row2 = [step1Inputs[3], step1Inputs[4], step1Inputs[5], step1Inputs[6]];
  const row3 = [step1Inputs[7], step1Inputs[8]];

  function renderField(field: (typeof step1Inputs)[0]) {
    if (field.type === "datePicker") {
      return (
        <DatePickerValue
          key={field.name}
          name={field.name}
          label={t(field.label)}
          disabled={readOnly}
        />
      );
    }
    return (
      <FormInputIcon
        key={field.name}
        name={field.name}
        label={t(field.label)}
        type={field.type}
        startIcon={field.icon}
        disabled={readOnly}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Row 1 => 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {row1.map((f) => renderField(f))}
      </div>

      {/* Row 2 => 4 columns */}
      <div className="grid grid-cols-4 gap-4">
        {row2.map((f) => renderField(f))}
      </div>

      {/* Row 3 => 2 columns (1fr / 2fr or custom) */}
      <div className="grid grid-cols-[1fr_2fr] gap-4">
        {row3.map((f) => renderField(f))}
      </div>
    </div>
  );
}
