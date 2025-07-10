/* --------------------------------------------------------------------------
   components/Step1StatementForm.tsx            ★ UPDATED FILE (full content)
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useLocale, useTranslations } from "next-intl";
import { useFormikContext } from "formik";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import CheckboxWrapper from "@/app/components/FormUI/CheckboxWrapper";

import {
  step1StatementInputs,
  ServicesOptions,
  CertifiedBankStatementRequest,
} from "./statementInputs";
import { getKycByCode } from "@/app/auth/register/services";


/* ──────────────────────────────────────────────────────────────────────── */
type Props = { readOnly?: boolean };

/* ======================================================================== */
export function Step1StatementForm({ readOnly = false }: Props) {
  const t = useTranslations("bankStatement");
  const locale = useLocale();

  /* ------------------------------------------------------------------ */
  /* Cookie-based account options                                       */
  /* ------------------------------------------------------------------ */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  useEffect(() => {
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

  /* ------------------------------------------------------------------ */
  /* KYC auto-fill side-effect                                          */
  /* ------------------------------------------------------------------ */
  const { values, setFieldValue } =
    useFormikContext<CertifiedBankStatementRequest>();

  const lastCodeRef = useRef<string | null>(null);

  useEffect(() => {
    const acc = values.accountNumber ? String(values.accountNumber).trim() : "";
    if (!acc) return;

    /* Extract middle 6 digits from 0000-123456-000 (mask optional) */
    const match = acc.match(/^\d{4}-?(\d{6})-?\d{3}$/);
    if (!match) return;

    const code = match[1];
    if (code.length !== 6 || code === lastCodeRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const kyc = await getKycByCode(code);
        if (cancelled || !kyc.hasKyc || !kyc.data) return;

        lastCodeRef.current = code;

        const { legalCompanyName, legalCompanyNameLT } = kyc.data;
        const holderName =
          locale === "ar" ? legalCompanyName : legalCompanyNameLT;

        setFieldValue("accountHolderName", holderName);
      } catch (error) {
        console.error("Failed to fetch KYC:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [values.accountNumber, locale, setFieldValue]);

  /* ------------------------------------------------------------------ */
  /* Service-request checkbox list                                      */
  /* ------------------------------------------------------------------ */
  const serviceOptions: Array<{ value: ServicesOptions; labelKey: string }> = [
    { value: "reactivateIdfaali", labelKey: "reactivateIdfaali" },
    { value: "deactivateIdfaali", labelKey: "deactivateIdfaali" },
    { value: "resetDigitalBankPassword", labelKey: "resetDigitalBankPassword" },
    { value: "resendMobileBankingPin", labelKey: "resendMobileBankingPin" },
    { value: "changePhoneNumber", labelKey: "changePhoneNumber" },
  ];

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {step1StatementInputs.map(({ name, label, icon, type }) => {
        /* Service-requests block */
        if (type === "serviceRequests") {
          return (
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
          );
        }

        /* Account number field → InputSelectCombo with mask & cookie opts */
        if (name === "accountNumber") {
          return (
            <InputSelectCombo
              key={name}
              name={name}
              label={t(label)}
              options={accountOptions}
              placeholder={t(label)}
              width="w-full"
              maskingFormat="0000-000000-000"
              disabled={readOnly}
            />
          );
        }

        /* Default text / masked input */
        return (
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
        );
      })}
    </div>
  );
}
