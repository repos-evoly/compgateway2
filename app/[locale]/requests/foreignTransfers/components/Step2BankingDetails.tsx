"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import FormFileUpload from "@/app/components/FormUI/FormFileUpload";
import { FiInfo } from "react-icons/fi";
import { step2Inputs } from "./formInputsArrays";

type Step2BankingDetailsProps = {
  readOnly?: boolean;
};

/**
 * Step 2 => 5 "rows" layout example
 */
export function Step2BankingDetails({
  readOnly = false,
}: Step2BankingDetailsProps) {
  const t = useTranslations("foreignTransfers");

  // step2Inputs fields:
  //   transferAmount, toCountry, beneficiaryName
  //   beneficiaryAddress, externalBankName, externalBankAddress
  //   transferToAccountNumber, transferToAddress, accountHolderName
  //   permanentAddress, purposeOfTransfer
  //   (maybe a file upload?)

  const row1 = [step2Inputs[0], step2Inputs[1], step2Inputs[2]];
  const row2 = [step2Inputs[3], step2Inputs[4], step2Inputs[5]];
  const row3 = [step2Inputs[6], step2Inputs[7], step2Inputs[8]];
  const row4 = [step2Inputs[9], step2Inputs[10]];
  // If you have an upload:
  // const rowUpload = [step2Inputs[11]];

  function renderField(field: (typeof step2Inputs)[0]) {
    if (field.type === "file") {
      return (
        <FormFileUpload
          key={field.name}
          name={field.name}
          label={t(field.label)}
          multiple={field.multiple}
          accept=".pdf,.jpg,.png"
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
      <h2 className="text-xl font-bold text-gray-700">Step 2 Fields</h2>

      {/* Row 1 => 3 columns */}
      <div className="grid grid-cols-3 gap-4">{row1.map(renderField)}</div>

      {/* Row 2 => 3 columns */}
      <div className="grid grid-cols-3 gap-4">{row2.map(renderField)}</div>

      {/* Row 3 => 3 columns */}
      <div className="grid grid-cols-3 gap-4">{row3.map(renderField)}</div>

      {/* Row 4 => 2 columns -> (1fr, 2fr) */}
      <div className="grid grid-cols-[1fr_2fr] gap-4">
        {row4.map(renderField)}
      </div>

      {/* If you have an upload row
      <div>{rowUpload.map(renderField)}</div> */}

      <div className="p-4 bg-gray-50 border rounded-lg flex items-start gap-2 text-sm text-gray-600">
        <FiInfo className="text-blue-600 mt-1" />
        <p>{t("documents")}</p>
      </div>
    </div>
  );
}
