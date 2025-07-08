/* --------------------------------------------------------------------------
 * app/[locale]/requests/visaRequest/components/Step1VisaRequest.tsx
 * Renders accountNumber with <InputSelectCombo>
 * ----------------------------------------------------------------------- */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { step1VisaInputs } from "./visaInputs";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";

type Step1VisaRequestProps = {
  readOnly?: boolean;
  /** Options for the accountNumber dropdown (passed from the wizard) */
  accountOptions: InputSelectComboOption[];
};

export function Step1VisaRequest({
  readOnly = false,
  accountOptions,
}: Step1VisaRequestProps) {
  const t = useTranslations("visaRequest");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {step1VisaInputs.map(({ name, label, icon, type }) => {
        if (name === "accountNumber") {
          return (
            <InputSelectCombo
              key={name}
              name="accountNumber"
              label={t(label)}
              options={accountOptions}
              width="w-full"
              maskingFormat="0000-000000-000"
              disabled={readOnly}
            />
          );
        }

        if (type === "date") {
          return (
            <DatePickerValue
              key={name}
              name={name}
              label={t(label)}
              disabled={readOnly}
            />
          );
        }

        return (
          <FormInputIcon
            key={name}
            name={name}
            label={t(label)}
            startIcon={icon}
            type={type}
            disabled={readOnly}
            maskingFormat={name === "accountNumber" ? "0000-000000-000" : ""}
          />
        );
      })}
    </div>
  );
}
