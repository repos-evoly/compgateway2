/* --------------------------------------------------------------------------
   components/Step2BankingDetails.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import FormFileUpload from "@/app/components/FormUI/FormFileUpload";
import { FiInfo } from "react-icons/fi";
import { step2Inputs } from "./formInputsArrays";

type Step2BankingDetailsProps = { readOnly?: boolean };

/**
 * Step 2 — five responsive rows (plus info box).
 */
export function Step2BankingDetails({
  readOnly = false,
}: Step2BankingDetailsProps) {
  const t = useTranslations("foreignTransfers");

  const row1 = [step2Inputs[0], step2Inputs[1], step2Inputs[2]];
  const row2 = [step2Inputs[3], step2Inputs[4], step2Inputs[5]];
  const row3 = [step2Inputs[6], step2Inputs[7], step2Inputs[8]];
  const row4 = [step2Inputs[9], step2Inputs[10]];
  const rowUpload = step2Inputs.slice(11, 12);

  const renderField = (field: (typeof step2Inputs)[number]) =>
    field.type === "file" ? (
      <FormFileUpload
        key={field.name}
        name={field.name}
        label={t(field.label)}
        buttonLabel={t("uploadDocuments")}
        multiple={field.multiple}
        accept=".pdf,.jpg,.png"
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
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {row1.map(renderField)}
      </div>

      {/* Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {row2.map(renderField)}
      </div>

      {/* Row 3 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {row3.map(renderField)}
      </div>

      {/* Row 4 – asymmetric 1 fr / 2 fr on XL */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_2fr]">
        {row4.map(renderField)}
      </div>

      {rowUpload.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rowUpload.map(renderField)}
        </div>
      ) : null}

      {/* Helpful note */}
      <div className="flex items-start gap-2 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
        <FiInfo className="mt-1 text-blue-600" />
        <p>{t("documents")}</p>
      </div>
    </div>
  );
}
