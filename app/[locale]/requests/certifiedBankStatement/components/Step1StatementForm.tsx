/* --------------------------------------------------------------------------
   components/Step1StatementForm.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import CheckboxWrapper from "@/app/components/FormUI/CheckboxWrapper";
import { step1StatementInputs, ServicesOptions } from "./statementInputs";

type Props = { readOnly?: boolean };

export function Step1StatementForm({ readOnly = false }: Props) {
  const t = useTranslations("bankStatement");

  const serviceOptions: Array<{ value: ServicesOptions; labelKey: string }> = [
    { value: "reactivateIdfaali", labelKey: "reactivateIdfaali" },
    { value: "deactivateIdfaali", labelKey: "deactivateIdfaali" },
    { value: "resetDigitalBankPassword", labelKey: "resetDigitalBankPassword" },
    { value: "resendMobileBankingPin", labelKey: "resendMobileBankingPin" },
    { value: "changePhoneNumber", labelKey: "changePhoneNumber" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {step1StatementInputs.map(({ name, label, icon, type }) =>
        type === "serviceRequests" ? (
          <div key={name} className="col-span-1 sm:col-span-2 xl:col-span-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t(label)}
            </label>
            <div className="rounded-md border border-gray-300 p-4">
              {serviceOptions.map((opt) => (
                <CheckboxWrapper
                  key={opt.value}
                  name={`serviceRequests.${opt.value}`}
                  label={t(opt.labelKey)}
                  disabled={readOnly}
                />
              ))}
            </div>
          </div>
        ) : (
          <FormInputIcon
            key={name}
            name={name}
            label={t(label)}
            startIcon={icon}
            type={type}
            disabled={readOnly}
            maskingFormat={
              name.toLowerCase().includes("accountnumber")
                ? "0000-000000-000"
                : ""
            }
          />
        )
      )}
    </div>
  );
}
