/* --------------------------------------------------------------------------
 * app/[locale]/requests/visaRequest/components/Step1VisaRequest.tsx
 * Renders accountNumber with <InputSelectCombo> + KYC auto-population
 * ----------------------------------------------------------------------- */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useFormikContext, useField } from "formik";

import { step1VisaInputs } from "./visaInputs";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import { getKycByCode } from "../services";

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
  const { setFieldValue } = useFormikContext();
  const [field] = useField<string>("accountNumber");
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);

  /* -- helpers ------------------------------------------------------ */
  const extractCompanyCode = (acc: string): string => {
    const digits = acc.replace(/\D/g, "");
    return digits.length >= 10 ? digits.substring(4, 10) : "";
  };

  const handleAccountNumberChange = useCallback(
    async (accountNumber: string) => {
      if (!accountNumber) return;

      const code = extractCompanyCode(accountNumber);
      if (!code) return;

      setIsLoadingKyc(true);
      try {
        const kyc = await getKycByCode(code);
        if (kyc.hasKyc && kyc.data) {
          setFieldValue(
            "accountHolderName",
            kyc.data.legalCompanyNameLT || kyc.data.legalCompanyName
          );
          setFieldValue("branch", kyc.data.branchName);

          const address = [kyc.data.street, kyc.data.district, kyc.data.city]
            .filter(Boolean)
            .join(", ");
          setFieldValue("address", address);
        }
      } catch (err) {
        console.error("Failed to fetch KYC data:", err);
      } finally {
        setIsLoadingKyc(false);
      }
    },
    [setFieldValue]
  );

  /* -- effect: run when accountNumber changes ----------------------- */
  useEffect(() => {
    if (field.value) {
      handleAccountNumberChange(field.value);
    }
  }, [field.value, handleAccountNumberChange]);

  /* -- render ------------------------------------------------------- */
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {step1VisaInputs.map(({ name, label, icon, type }) => {
        if (name === "accountNumber") {
          return (
            <div key={name} className="relative">
              <InputSelectCombo
                name="accountNumber"
                label={t(label)}
                options={accountOptions}
                width="w-full"
                maskingFormat="0000-000000-000"
                disabled={readOnly}
              />
              {isLoadingKyc && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 transform">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
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
