"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import CheckboxWrapper from "@/app/components/FormUI/CheckboxWrapper";
import { step1StatementInputs, ServicesOptions } from "./statementInputs";

type Props = {
  readOnly?: boolean;
};

export function Step1StatementForm({ readOnly = false }: Props) {
  const t = useTranslations("bankStatement");

  // This array maps each ServicesOptions key to a translation label
  const allServiceOptions: { value: ServicesOptions; labelKey: string }[] = [
    { value: "reactivateIdfaali", labelKey: "reactivateIdfaali" },
    { value: "deactivateIdfaali", labelKey: "deactivateIdfaali" },
    { value: "resetDigitalBankPassword", labelKey: "resetDigitalBankPassword" },
    { value: "resendMobileBankingPin", labelKey: "resendMobileBankingPin" },
    { value: "changePhoneNumber", labelKey: "changePhoneNumber" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {step1StatementInputs.map(({ name, label, icon, type }) => {
        // If it's the serviceRequests object => multiple checkboxes
        if (type === "serviceRequests") {
          return (
            <div key={name} className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(label)}
              </label>
              <div className="border border-gray-300 rounded-md p-4">
                {allServiceOptions.map((option) => {
                  const checkboxName = `serviceRequests.${option.value}`;
                  return (
                    <CheckboxWrapper
                      key={option.value}
                      name={checkboxName}
                      label={t(option.labelKey)}
                      disabled={readOnly}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        // Normal field => FormInputIcon
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
