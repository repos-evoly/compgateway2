"use client";

import React from "react";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import FormFileUpload from "@/app/components/FormUI/FormFileUpload";
import { FiInfo } from "react-icons/fi";
import { step2Inputs } from "./formInputsArrays";
import { useTranslations } from "next-intl";

/**
 * Desired row distribution:
 *
 * 1) transferAmount, toCountry, beneficiaryName
 * 2) beneficiaryAddress, externalBankName, externalBankAddress
 * 3) transferToAccountNumber, transferToAddress, accountHolderName
 * 4) permanentAddress, purposeOfTransfer (with Purpose bigger)
 * 5) uploadDocuments (if used)
 */
export function Step2BankingDetails() {
  const t = useTranslations("foreignTransfers");

  // Make sure your step2Inputs array uses the NEW field names:
  // (transferAmount, toCountry, beneficiaryName, beneficiaryAddress, externalBankName, externalBankAddress, transferToAccountNumber, transferToAddress, accountHolderName, permanentAddress, purposeOfTransfer, uploadDocuments?)
  const row1 = [step2Inputs[0], step2Inputs[1], step2Inputs[2]];
  const row2 = [step2Inputs[3], step2Inputs[4], step2Inputs[5]];
  const row3 = [step2Inputs[6], step2Inputs[7], step2Inputs[8]];
  const row4 = [step2Inputs[9], step2Inputs[10]];
  // const rowUpload = [step2Inputs[11]]; // if you have file uploads

  // Helper to render normal input vs file upload
  function renderField(field: (typeof step2Inputs)[0]) {
    if (field.type === "file") {
      // We interpret 'multiple' from the field itself
      return (
        <FormFileUpload
          key={field.name}
          name={field.name}
          label={t(field.label)}
          multiple={field.multiple}
          accept=".pdf,.jpg,.png"
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
      <h2 className="text-xl font-bold text-gray-700">Step 2 Fields</h2>

      {/* Row 1: 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {row1.map((field) => renderField(field))}
      </div>

      {/* Row 2: 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {row2.map((field) => renderField(field))}
      </div>

      {/* Row 3: 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {row3.map((field) => renderField(field))}
      </div>

      {/* Row 4: 2 columns -> 1fr for the first field, 2fr for the second */}
      <div className="grid grid-cols-[1fr_2fr] gap-4">
        {row4.map((field) => renderField(field))}
      </div>

      <div className="p-4 bg-gray-50 border rounded-lg flex items-start gap-2 text-sm text-gray-600">
        <FiInfo className="text-blue-600 mt-1" />
        <p>{t("documents")}</p>
      </div>
    </div>
  );
}
