/* --------------------------------------------------------------------------
   components/Step1TransferInfo.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import { step1Inputs } from "./formInputsArrays";
import { useFormikContext } from "formik";
import Cookies from "js-cookie";
import InputSelectCombo, { InputSelectComboOption } from "@/app/components/FormUI/InputSelectCombo";
import { getKycByCode } from "../services";
import { useField } from "formik";

type Step1TransferInfoProps = { readOnly?: boolean };

// Add AccountNumberDropdown component (copied from CheckRequestForm)
interface AccountNumberDropdownProps {
  name: string;
  label: string;
  options: InputSelectComboOption[];
  placeholder: string;
  width: string;
  maskingFormat: string;
  disabled: boolean;
  onAccountChange: (accountNumber: string, setFieldValue: (field: string, value: unknown) => void) => void;
  isLoadingKyc: boolean;
}

const AccountNumberDropdown: React.FC<AccountNumberDropdownProps> = ({
  onAccountChange,
  isLoadingKyc,
  name,
  ...props
}) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);
  const [hasAutoFilled, setHasAutoFilled] = React.useState(false);

  React.useEffect(() => {
    if (field.value && !hasAutoFilled) {
      onAccountChange(field.value, setFieldValue);
      setHasAutoFilled(true);
    }
  }, [field.value, onAccountChange, setFieldValue, hasAutoFilled]);

  return (
    <div className="relative">
      <InputSelectCombo
        name={name}
        {...props}
      />
      {isLoadingKyc && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Step 1 — three logical “rows” rendered responsively.
 */
export function Step1TransferInfo({
  readOnly = false,
}: Step1TransferInfoProps) {
  const t = useTranslations("foreignTransfers");

  // Account dropdown state
  const [accountOptions, setAccountOptions] = React.useState<InputSelectComboOption[]>([]);
  const [isLoadingKyc, setIsLoadingKyc] = React.useState(false);
  const { setFieldValue } = useFormikContext();

  React.useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let accounts: string[] = [];
    try {
      accounts = JSON.parse(raw);
    } catch {
      try {
        accounts = JSON.parse(decodeURIComponent(raw));
      } catch {
        accounts = [];
      }
    }
    setAccountOptions(accounts.map((acc) => ({ label: acc, value: acc })));
  }, []);

  // KYC autofill logic
  const extractCompanyCode = (accountNumber: string): string => {
    const cleanAccount = accountNumber.replace(/\D/g, '');
    if (cleanAccount.length >= 10) {
      return cleanAccount.substring(4, 10);
    }
    return '';
  };

  const handleAccountNumberChange = async (accountNumber: string, setFieldValue: (field: string, value: unknown) => void) => {
    if (!accountNumber) return;
    const companyCode = extractCompanyCode(accountNumber);
    if (!companyCode) return;
    setIsLoadingKyc(true);
    try {
      const kycData = await getKycByCode(companyCode);
      if (kycData.hasKyc && kycData.data) {
        setFieldValue('residentSupplierName', kycData.data.legalCompanyNameLT || kycData.data.legalCompanyName);
        setFieldValue('branch', kycData.data.branchName);
        // Build address from KYC data
        const addressParts = [];
        if (kycData.data.street) addressParts.push(kycData.data.street);
        if (kycData.data.district) addressParts.push(kycData.data.district);
        if (kycData.data.city) addressParts.push(kycData.data.city);
        const fullAddress = addressParts.join(', ');
        setFieldValue('nonResidentAddress', fullAddress);
      }
    } catch (error) {
      console.error('Failed to fetch KYC data:', error);
    } finally {
      setIsLoadingKyc(false);
    }
  };

  /* pick inputs by position */
  const row1 = [step1Inputs[0], step1Inputs[1], step1Inputs[2]];
  const row2 = [step1Inputs[3], step1Inputs[4], step1Inputs[5], step1Inputs[6]];
  const row3 = [step1Inputs[7], step1Inputs[8]];

  const renderField = (field: (typeof step1Inputs)[number]) =>
    field.type === "datePicker" ? (
      <DatePickerValue
        key={field.name}
        name={field.name}
        label={t(field.label)}
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
    <div className="space-y-4">
      {/* Account Number Dropdown as first field */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AccountNumberDropdown
          name="accountNum"
          label={t("accountNum")}
          options={accountOptions}
          placeholder={t("accountNumPlaceholder")}
          width="w-full"
          maskingFormat="0000-000000-000"
          disabled={readOnly}
          onAccountChange={handleAccountNumberChange}
          isLoadingKyc={isLoadingKyc}
        />
        {row1.map(renderField)}
      </div>

      {/* Row 2 ─ stack → 2 cols → 4 cols */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {row2.map(renderField)}
      </div>

      {/* Row 3 ─ full-width then 2-column asymmetric */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_2fr]">
        {row3.map(renderField)}
      </div>
    </div>
  );
}
