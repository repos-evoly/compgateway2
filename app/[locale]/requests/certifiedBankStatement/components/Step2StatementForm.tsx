"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Field, useFormikContext } from "formik";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";

import {
  CertifiedBankStatementRequest,
  step2StatementInputs,
} from "./statementInputs";

// Example: For statementRequest, we might have these checkboxes
// (like "currentAccountStatement.arabic", "currentAccountStatement.english", etc.)
export function Step2StatementForm() {
  const t = useTranslations("bankStatement");
  const { values, setFieldValue } =
    useFormikContext<CertifiedBankStatementRequest>();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {step2StatementInputs.map(({ name, label, icon, type }) => {
        if (type === "statementRequest") {
          // We'll show a group of checkboxes + date fields for fromDate/toDate
          const statementVal = values.statementRequest || {};

          return (
            <div key={name} className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(label)} {/* e.g. "طلبات كشف الحساب" */}
              </label>
              <div className="border border-gray-300 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Account statement (arabic/english) */}
                <div className="flex flex-col mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {t("currentAccountStatement")}
                  </span>
                  <label className="flex items-center space-x-1 ml-2">
                    <Field
                      type="checkbox"
                      name="statementRequest.currentAccountStatement.arabic"
                      checked={
                        statementVal.currentAccountStatement?.arabic || false
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue(
                          "statementRequest.currentAccountStatement.arabic",
                          e.target.checked
                        )
                      }
                    />
                    <span className="text-sm text-gray-700">{t("arabic")}</span>
                  </label>
                  <label className="flex items-center space-x-1 ml-2">
                    <Field
                      type="checkbox"
                      name="statementRequest.currentAccountStatement.english"
                      checked={
                        statementVal.currentAccountStatement?.english || false
                      }
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

                {/* fromDate, toDate */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">
                    {t("fromDate")}
                  </label>
                  <Field
                    type="date"
                    name="statementRequest.fromDate"
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
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                {/* More checkboxes: accountStatement, journalMovement, nonFinancialCommitment */}
                <label className="flex items-center space-x-2">
                  <Field
                    type="checkbox"
                    name="statementRequest.accountStatement"
                    checked={statementVal.accountStatement || false}
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

                <label className="flex items-center space-x-2">
                  <Field
                    type="checkbox"
                    name="statementRequest.journalMovement"
                    checked={statementVal.journalMovement || false}
                    onChange={() =>
                      setFieldValue(
                        "statementRequest.journalMovement",
                        !statementVal.journalMovement
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">
                    {t("journalMovement")}
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <Field
                    type="checkbox"
                    name="statementRequest.nonFinancialCommitment"
                    checked={statementVal.nonFinancialCommitment || false}
                    onChange={() =>
                      setFieldValue(
                        "statementRequest.nonFinancialCommitment",
                        !statementVal.nonFinancialCommitment
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">
                    {t("nonFinancialCommitment")}
                  </span>
                </label>
              </div>
            </div>
          );
        }

        // If normal fields (like oldAccountNumber or newAccountNumber)
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
