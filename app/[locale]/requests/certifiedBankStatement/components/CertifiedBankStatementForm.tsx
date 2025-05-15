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

/**
 * Add an index signature so it matches Record<string, unknown>:
 *   interface CertifiedBankStatementRequestWithID
 *     extends CertifiedBankStatementRequest, Record<string, unknown> { ... }
 */
export interface CertifiedBankStatementRequestWithID
  extends CertifiedBankStatementRequest,
    Record<string, unknown> {
  id: number;
}

/** Props for the multi-step wizard form */
type CertifiedBankStatementFormProps = {
  /** If provided => editing; otherwise => new form with default data. */
  initialValues?: Partial<CertifiedBankStatementRequestWithID>;
  /** Called on final submit of the wizard */
  onSubmit: (values: CertifiedBankStatementRequestWithID) => void;
};

/** Default object for "Add" scenario (no initialValues) */
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
    currentAccountStatement: {
      arabic: false,
      english: false,
    },
    visaAccountStatement: false,
    fromDate: "",
    toDate: "",
    accountStatement: false,
    journalMovement: false,
    nonFinancialCommitment: false,
  },
};

/**
 * Main 2-step form for CertifiedBankStatementRequest
 */
export default function CertifiedBankStatementForm({
  initialValues,
  onSubmit,
}: CertifiedBankStatementFormProps) {
  const t = useTranslations("bankStatement");

  // Merge partial => "Add" vs "Edit"
  const mergedValues: CertifiedBankStatementRequestWithID = {
    ...defaultValues,
    ...initialValues,
  };

  // Steps array
  const steps = [
    {
      title: t("step1Title"), // e.g. "الخطوة الأولى"
      component: <Step1StatementForm />,
    },
    {
      title: t("step2Title"), // e.g. "الخطوة الثانية"
      component: <Step2StatementForm />,
    },
  ];

  // For the final review step's translations
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1StatementInputs, ...step2StatementInputs];
    const found = allInputs.find((input) => input.name === fieldName);
    if (found) {
      return t(found.label);
    }
    return fieldName;
  }

  // Step-based validation schemas
  const stepValidations = [
    // Step 1 partial
    Yup.object({
      accountHolderName: Yup.string().required(
        t("accountHolderName") + " " + t("isRequired")
      ),
      authorizedOnTheAccountName: Yup.string().required(
        t("authorizedOnTheAccountName") + " " + t("isRequired")
      ),
      accountNumber: Yup.number()
        .typeError(t("accountNumber") + " " + t("mustBeNumber"))
        .required(t("accountNumber") + " " + t("isRequired")),
    }),
    // Step 2 partial
    Yup.object({
      oldAccountNumber: Yup.number()
        .typeError(t("oldAccountNumber") + " " + t("mustBeNumber"))
        .required(t("oldAccountNumber") + " " + t("isRequired")),
      newAccountNumber: Yup.number()
        .typeError(t("newAccountNumber") + " " + t("mustBeNumber"))
        .required(t("newAccountNumber") + " " + t("isRequired")),
    }),
  ];

  // Final submit => pass up
  async function handleFinalSubmit(
    values: CertifiedBankStatementRequestWithID,
    { setSubmitting }: FormikHelpers<CertifiedBankStatementRequestWithID>
  ) {
    onSubmit(values);
    setSubmitting(false);
  }

  return (
    <div className="w-full p-4 bg-gray-50">
      <Formik
        initialValues={mergedValues}
        onSubmit={handleFinalSubmit}
        validationSchema={Yup.object({})}
        validateOnBlur
        validateOnChange={false}
      >
        {(formik) => {
          // Step-based validation
          async function validateCurrentStep(stepIndex: number) {
            const currentSchema = stepValidations[stepIndex];
            try {
              await currentSchema.validate(formik.values, {
                abortEarly: false,
              });
              formik.setErrors({});
              return true;
            } catch (err) {
              if (err instanceof ValidationError) {
                const errors: Record<string, string> = {};
                const touched: Record<string, boolean> = {};
                for (const e of err.inner) {
                  if (e.path) {
                    errors[e.path] = e.message;
                    touched[e.path] = true;
                  }
                }
                formik.setErrors(errors);
                formik.setTouched(touched, false);
              }
              return false;
            }
          }

          return (
            <Form>
              <TabsWizard<CertifiedBankStatementRequestWithID>
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={translateFieldName}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
