"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { step1VisaInputs } from "./visaInputs";

// Reuse your custom inputs:
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";

type Step1VisaRequestProps = {
  /** If true, disable all inputs in this step */
  readOnly?: boolean;
};

export function Step1VisaRequest({ readOnly = false }: Step1VisaRequestProps) {
  const t = useTranslations("visaRequest");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {step1VisaInputs.map(({ name, label, icon, type }) => {
        // If it's a date, use DatePickerValue:
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

        // Otherwise use FormInputIcon
        return (
          <FormInputIcon
            key={name}
            name={name}
            label={t(label)}
            startIcon={icon}
            type={type}
            disabled={readOnly}
          />
        );
      })}
    </div>
  );
}
