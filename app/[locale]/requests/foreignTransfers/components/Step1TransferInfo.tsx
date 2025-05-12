"use client";

import React from "react";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import { step1Inputs } from "./formInputsArrays";
import { useTranslations } from "next-intl";

/**
 * Step 1 component => 3 lines layout
 */
export function Step1TransferInfo() {
  const t = useTranslations("foreignTransfers");
  // For convenience, reference each field by index
  const row1 = [step1Inputs[0], step1Inputs[1], step1Inputs[2]]; // toBank, branch, residentSupplierName
  const row2 = [step1Inputs[3], step1Inputs[4], step1Inputs[5], step1Inputs[6]];
  // residentSupplierNationality, nonResidentSupplierPassportNumber, placeOfIssue, dateOfIssue
  const row3 = [step1Inputs[7], step1Inputs[8]];
  // nonResidentSupplierNationality, nonResidentAddress

  // Helper function to render either FormInputIcon or DatePickerValue
  function renderField(field: (typeof step1Inputs)[0]) {
    if (field.type === "datePicker") {
      return (
        <DatePickerValue
          key={field.name}
          name={field.name}
          label={t(field.label)}
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
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Row 1: 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {row1.map((field) => renderField(field))}
      </div>

      {/* Row 2: 4 columns */}
      <div className="grid grid-cols-4 gap-4">
        {row2.map((field) => renderField(field))}
      </div>

      {/* Row 3: 2 columns */}
      <div className="grid grid-cols-[1fr_2fr] gap-4">
        {row3.map((field) => renderField(field))}
      </div>
    </div>
  );
}
