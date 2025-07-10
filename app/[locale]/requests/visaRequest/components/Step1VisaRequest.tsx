/* --------------------------------------------------------------------------
 * app/[locale]/requests/visaRequest/components/Step1VisaRequest.tsx
 * Renders accountNumber with <InputSelectCombo> and KYC auto-population
 * ----------------------------------------------------------------------- */

"use client";

import React, { useState, useEffect } from "react";
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
  const [field] = useField("accountNumber");
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);

  /* Function to extract company code from account number */
  const extractCompanyCode = (accountNumber: string): string => {
    // Remove any non-digit characters
    const cleanAccount = accountNumber.replace(/\D/g, '');
    
    // Check if we have at least 10 digits (4 + 6)
    if (cleanAccount.length >= 10) {
      // Extract 6 digits after the first 4 digits
      return cleanAccount.substring(4, 10);
    }
    
    return '';
  };

  /* Function to fetch and populate KYC data */
  const handleAccountNumberChange = async (accountNumber: string) => {
    if (!accountNumber) return;

    const companyCode = extractCompanyCode(accountNumber);
    if (!companyCode) return;

    setIsLoadingKyc(true);
    
    try {
      const kycData = await getKycByCode(companyCode);
      
      if (kycData.hasKyc && kycData.data) {
        // Update form fields with KYC data
        setFieldValue('accountHolderName', kycData.data.legalCompanyNameLT || kycData.data.legalCompanyName);
        setFieldValue('branch', kycData.data.branchName);
        
        // Build address from KYC data
        const addressParts = [];
        if (kycData.data.street) addressParts.push(kycData.data.street);
        if (kycData.data.district) addressParts.push(kycData.data.district);
        if (kycData.data.city) addressParts.push(kycData.data.city);
        
        const fullAddress = addressParts.join(', ');
        setFieldValue('address', fullAddress);
      }
    } catch (error) {
      console.error('Failed to fetch KYC data:', error);
    } finally {
      setIsLoadingKyc(false);
    }
  };

  // Watch for changes in the account number field
  useEffect(() => {
    if (field.value) {
      handleAccountNumberChange(field.value);
    }
  }, [field.value]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
