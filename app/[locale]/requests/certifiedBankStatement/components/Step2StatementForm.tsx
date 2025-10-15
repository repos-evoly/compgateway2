"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Field, useFormikContext } from "formik";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import {
  CertifiedBankStatementRequest,
  step2StatementInputs,
} from "./statementInputs";

type Props = {
  readOnly?: boolean;
};

export function Step2StatementForm({ readOnly = false }: Props) {
  const t = useTranslations("bankStatement");
  const { values, setFieldValue } =
    useFormikContext<CertifiedBankStatementRequest>();

  return (
    /* ───────────────────────────────────────────
     * Root: 1-col on mobiles → 2-col (≥ sm) → 3-col (≥ lg)
     * ─────────────────────────────────────────── */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {step2StatementInputs.map(({ name, label, icon, type }) => {
        if (type === "statementRequest") {
          const statementVal = values.statementRequest || {};
          return (
            /* Full-width on mobile, span all columns on larger screens */
            <div key={name} className="col-span-1 sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(label)}
              </label>

              {/* Inner grid: stacks on mobile, 2-col (≥ sm), 3-col (≥ lg) */}
              <div className="border border-gray-300 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Current-account statement – Arabic / English */}
                <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                  <span className="text-sm font-semibold text-gray-700 mb-1">
                    {t("currentAccountStatement")}
                  </span>

                  {/* Arabic checkbox */}
                  <label className="flex items-center space-x-1 ml-2">
                    <Field
                      type="checkbox"
                      name="statementRequest.currentAccountStatement.arabic"
                      checked={
                        statementVal.currentAccountStatement?.arabic || false
                      }
                      disabled={readOnly}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue(
                          "statementRequest.currentAccountStatement.arabic",
                          e.target.checked
                        )
                      }
                    />
                    <span className="text-sm text-gray-700">{t("arabic")}</span>
                  </label>

                  {/* English checkbox */}
                  <label className="flex items-center space-x-1 ml-2">
                    <Field
                      type="checkbox"
                      name="statementRequest.currentAccountStatement.english"
                      checked={
                        statementVal.currentAccountStatement?.english || false
                      }
                      disabled={readOnly}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue(
                          "statementRequest.currentAccountStatement.english",
                          e.target.checked
                        )
                      }
                    />
                    <span className="text-sm text-gray-700">
                      {t("english")}
                    </span>
                  </label>
                </div>

                {/* Visa account statement */}
                <label className="flex items-center space-x-2">
                  <Field
                    type="checkbox"
                    name="statementRequest.visaAccountStatement"
                    checked={statementVal.visaAccountStatement || false}
                    disabled={readOnly}
                    onChange={() =>
                      setFieldValue(
                        "statementRequest.visaAccountStatement",
                        !statementVal.visaAccountStatement
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">
                    {t("visaAccountStatement")}
                  </span>
                </label>

                {/* From / To dates */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">
                    {t("fromDate")}
                  </label>
                  <Field
                    type="date"
                    name="statementRequest.fromDate"
                    disabled={readOnly}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">
                    {t("toDate")}
                  </label>
                  <Field
                    type="date"
                    name="statementRequest.toDate"
                    disabled={readOnly}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* Account statement */}
                <label className="flex items-center space-x-2">
                  <Field
                    type="checkbox"
                    name="statementRequest.accountStatement"
                    checked={statementVal.accountStatement || false}
                    disabled={readOnly}
                    onChange={() =>
                      setFieldValue(
                        "statementRequest.accountStatement",
                        !statementVal.accountStatement
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">
                    {t("accountStatement")}
                  </span>
                </label>
              </div>
            </div>
          );
        }

        /* ───────────────────────────────────────────
         * Normal text / masked inputs
         * ─────────────────────────────────────────── */
        return (
          <FormInputIcon
            key={name}
            name={name}
            label={t(label)}
            startIcon={icon}
            type={type}
            disabled={readOnly}
            maskingFormat={
              name.toLocaleLowerCase().includes("accountnumber")
                ? "0000-000000-000"
                : ""
            }
          />
        );
      })}
    </div>
  );
}
