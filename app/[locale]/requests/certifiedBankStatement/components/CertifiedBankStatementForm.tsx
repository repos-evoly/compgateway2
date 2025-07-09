/* --------------------------------------------------------------------------
   components/CertifiedBankStatementForm.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1StatementForm } from "./Step1StatementForm";
import { Step2StatementForm } from "./Step2StatementForm";
import {
  CertifiedBankStatementRequest,
  step1StatementInputs,
  step2StatementInputs,
} from "./statementInputs";
import FormHeader from "@/app/components/reusable/FormHeader";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────── */
export interface CertifiedBankStatementRequestWithID
  extends CertifiedBankStatementRequest {
  id: number;
  [k: string]: unknown;
}

type CertifiedBankStatementFormProps = {
  initialValues?: Partial<CertifiedBankStatementRequestWithID>;
  onSubmit: (v: CertifiedBankStatementRequestWithID) => void;
  readOnly?: boolean;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Defaults
 * ──────────────────────────────────────────────────────────────────────── */
const defaultValues: CertifiedBankStatementRequestWithID = {
  id: 0,
  accountHolderName: "",
  authorizedOnTheAccountName: "",
  accountNumber: undefined,
  serviceRequests: {
    reactivateIdfaali: false,
    deactivateIdfaali: false,
    resetDigitalBankPassword: false,
    resendMobileBankingPin: false,
    changePhoneNumber: false,
  },
  oldAccountNumber: undefined,
  newAccountNumber: undefined,
  statementRequest: {
    currentAccountStatement: { arabic: false, english: false },
    visaAccountStatement: false,
    fromDate: "",
    toDate: "",
    accountStatement: false,
    journalMovement: false,
    nonFinancialCommitment: false,
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────── */
export default function CertifiedBankStatementForm({
  initialValues,
  onSubmit,
  readOnly = false,
}: CertifiedBankStatementFormProps) {
  const t = useTranslations("bankStatement");

  const merged: CertifiedBankStatementRequestWithID = {
    ...defaultValues,
    ...initialValues,
  };

  const steps = [
    {
      title: t("step1Title"),
      component: <Step1StatementForm readOnly={readOnly} />,
    },
    {
      title: t("step2Title"),
      component: <Step2StatementForm readOnly={readOnly} />,
    },
  ];

  const allInputs = [...step1StatementInputs, ...step2StatementInputs];
  const xlate = (name: string) =>
    t(allInputs.find((f) => f.name === name)?.label ?? name);

  const stepValidations = [
    Yup.object({
      accountHolderName: Yup.string().required(
        `${t("accountHolderName")} ${t("isRequired")}`
      ),
      authorizedOnTheAccountName: Yup.string().required(
        `${t("authorizedOnTheAccountName")} ${t("isRequired")}`
      ),
      accountNumber: Yup.number()
        .typeError(`${t("accountNumber")} ${t("mustBeNumber")}`)
        .required(`${t("accountNumber")} ${t("isRequired")}`),
    }),
    Yup.object({
      oldAccountNumber: Yup.number()
        .typeError(`${t("oldAccountNumber")} ${t("mustBeNumber")}`)
        .required(`${t("oldAccountNumber")} ${t("isRequired")}`),
      newAccountNumber: Yup.number()
        .typeError(`${t("newAccountNumber")} ${t("mustBeNumber")}`)
        .required(`${t("newAccountNumber")} ${t("isRequired")}`),
    }),
  ];

  const handleFinalSubmit = (
    vals: CertifiedBankStatementRequestWithID,
    helpers: FormikHelpers<CertifiedBankStatementRequestWithID>
  ) => {
    onSubmit(vals);
    helpers.setSubmitting(false);
  };
  const status =
    (initialValues as { status?: string } | undefined)?.status ?? undefined;

  return (
    <div className="w-full rounded-md bg-gray-50 p-4">
      <Formik
        initialValues={merged}
        onSubmit={handleFinalSubmit}
        validationSchema={Yup.object({})} /* TabsWizard validates per step */
        validateOnBlur
        validateOnChange={false}
      >
        {(formik) => {
          const validateCurrentStep = async (idx: number) => {
            try {
              await stepValidations[idx].validate(formik.values, {
                abortEarly: false,
              });
              formik.setErrors({});
              return true;
            } catch (err) {
              if (err instanceof ValidationError) {
                const errs: Record<string, string> = {};
                const touched: Record<string, boolean> = {};
                err.inner.forEach((e) => {
                  if (e.path) {
                    errs[e.path] = e.message;
                    touched[e.path] = true;
                  }
                });
                formik.setErrors(errs);
                formik.setTouched(touched, false);
              }
              return false;
            }
          };

          return (
            <Form>
              <FormHeader status={status}/>
              <TabsWizard<CertifiedBankStatementRequestWithID>
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={xlate}
                readOnly={readOnly}
                fallbackPath="/requests/certifiedBankStatement"
                isEditing={!!initialValues}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
