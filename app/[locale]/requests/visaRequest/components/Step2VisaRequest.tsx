"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { step2VisaInputs } from "./visaInputs";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
// ^ Adjust file paths as needed

export function Step2VisaRequest() {
  const t = useTranslations("visaRequest");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {step2VisaInputs.map(({ name, label, icon, type }) => {
        // If it's a date, use DatePickerValue (but here you likely have none).
        if (type === "date") {
          return <DatePickerValue key={name} name={name} label={t(label)} />;
        }

        // Otherwise use FormInputIcon
        return (
          <FormInputIcon
            key={name}
            name={name}
            label={t(label)}
            startIcon={icon}
            type={type}
          />
        );
      })}
    </div>
  );
}
