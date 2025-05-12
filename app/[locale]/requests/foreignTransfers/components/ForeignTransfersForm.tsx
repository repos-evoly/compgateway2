"use client";

import React from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1TransferInfo } from "./Step1TransferInfo";
import { Step2BankingDetails } from "./Step2BankingDetails";
import { step1Inputs, step2Inputs } from "./formInputsArrays"; // <--- updated import
import { ForeignTransfersFormValues } from "../types";

export default function ForeignTransfersForm() {
  const t = useTranslations("foreignTransfers"); // i18n from next-intl

  // Steps
  const steps = [
    {
      title: t("step1Title"), // e.g. "Step 1"
      component: <Step1TransferInfo />,
    },
    {
      title: t("step2Title"), // e.g. "Step 2"
      component: <Step2BankingDetails />,
    },
  ];

  // Provide a translator function for the review step
  // This uses the arrays from step1Inputs, step2Inputs
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1Inputs, ...step2Inputs];
    const found = allInputs.find((input) => input.name === fieldName);
    if (found) {
      // Translate via t(found.label)
      return t(found.label);
    }
    // Fallback if no match in your input arrays
    return fieldName;
  }

  const initialValues: ForeignTransfersFormValues = {
    // Step 1
    toBank: "",
    branch: "",
    residentSupplierName: "",
    residentSupplierNationality: "",
    nonResidentSupplierPassportNumber: 0,
    placeOfIssue: "",
    dateOfIssue: "",
    nonResidentSupplierNationality: "",
    nonResidentAddress: "",

    // Step 2
    transferAmount: 0,
    toCountry: "",
    beneficiaryName: "",
    beneficiaryAddress: "",
    externalBankName: "",
    externalBankAddress: "",
    transferToAccountNumber: 0,
    transferToAddress: "",
    accountholderName: "",
    permenantAddress: "",
    purposeOfTransfer: "",
    // uploadDocuments: undefined,
  };

  // Partial validations for each step
  const stepValidations = [
    // Step 1
    Yup.object({
      toBank: Yup.string().required("To Bank is required"),
      // ... other fields ...
    }),
    // Step 2
    Yup.object({
      transferAmount: Yup.number().required("Transfer Amount is required"),
      // ... other fields ...
    }),
  ];

  async function handleSubmit(
    values: ForeignTransfersFormValues,
    { resetForm, setSubmitting }: FormikHelpers<ForeignTransfersFormValues>
  ) {
    console.log("Form Submitted:", values);
    // simulate API
    setTimeout(() => {
      alert("Transfer request submitted successfully!");
      resetForm();
      setSubmitting(false);
    }, 1000);
  }

  return (
    <div className="w-full p-4 bg-gray-50">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={Yup.object({})} // We'll do step-by-step validation
        validateOnBlur
        validateOnChange={false}
      >
        {(formik) => {
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
