"use client";

import React from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
// Adjust path to your existing TabsWizard
import { Step1StatementForm } from "./Step1StatementForm";
import { Step2StatementForm } from "./Step2StatementForm";
import {
  CertifiedBankStatementRequest,
  step1StatementInputs,
  step2StatementInputs,
} from "./statementInputs";

/**
 * This is the main 2-step form for CertifiedBankStatementRequest.
 */
export default function CertifiedBankStatementForm() {
  const t = useTranslations("bankStatement");

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

  // We'll provide a translator function for the final review.
  function translateFieldName(fieldName: string): string {
    // Combine step1 + step2
    const allInputs = [...step1StatementInputs, ...step2StatementInputs];
    // Try to match name
    const found = allInputs.find((input) => input.name === fieldName);
    if (found) {
      return t(found.label);
    }
    // If none, fallback
    return fieldName;
  }

  // Initial values
  const initialValues: CertifiedBankStatementRequest = {
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

  // Step-based validations
  const stepValidations = [
    // Step 1
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

      // serviceRequests can be partially validated. For example, you can require at least one to be true, if business logic requires it.
      // We'll skip for brevity. Example:
      // serviceRequests: Yup.object().test("at-least-one", "Select at least one service", (value) => {
      //   return Object.values(value || {}).some(val => val === true);
      // }),
    }),

    // Step 2
    Yup.object({
      oldAccountNumber: Yup.number()
        .typeError(t("oldAccountNumber") + " " + t("mustBeNumber"))
        .required(t("oldAccountNumber") + " " + t("isRequired")),
      newAccountNumber: Yup.number()
        .typeError(t("newAccountNumber") + " " + t("mustBeNumber"))
        .required(t("newAccountNumber") + " " + t("isRequired")),
      // statementRequest can also have partial validations, if needed
    }),
  ];

  async function handleSubmit(
    values: CertifiedBankStatementRequest,
    { resetForm, setSubmitting }: FormikHelpers<CertifiedBankStatementRequest>
  ) {
    console.log("Certified Bank Statement Form Submitted =>", values);
    // simulate API
    setTimeout(() => {
      alert("Certified Bank Statement form submitted successfully!");
      resetForm();
      setSubmitting(false);
    }, 1000);
  }

  return (
    <div className="w-full p-4 bg-gray-50">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
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
              <TabsWizard
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
