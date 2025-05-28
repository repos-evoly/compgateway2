"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { step2VisaInputs } from "./visaInputs";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";

type Step2VisaRequestProps = {
  /** If true, disable all inputs in this step */
  readOnly?: boolean;
};

export function Step2VisaRequest({ readOnly = false }: Step2VisaRequestProps) {
  const t = useTranslations("visaRequest");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {step2VisaInputs.map(({ name, label, icon, type }) => {
        // If it's a date, use DatePickerValue (rare in step2, but possible).
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
