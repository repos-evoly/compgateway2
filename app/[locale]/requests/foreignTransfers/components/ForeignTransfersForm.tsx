"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1TransferInfo } from "./Step1TransferInfo";
import { Step2BankingDetails } from "./Step2BankingDetails";
import { step1Inputs, step2Inputs } from "./formInputsArrays";

// 1) The shape of all fields. Add "id" for row identification
export type ForeignTransfersFormValues = {
  id: number;

  // Step 1 fields
  toBank: string;
  branch: string;
  residentSupplierName: string;
  residentSupplierNationality: string;
  nonResidentSupplierPassportNumber: number;
  placeOfIssue: string;
  dateOfIssue: string;
  nonResidentSupplierNationality: string;
  nonResidentAddress: string;

  // Step 2 fields
  transferAmount: number;
  toCountry: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  externalBankName: string;
  externalBankAddress: string;
  transferToAccountNumber: number;
  transferToAddress: string;
  accountholderName: string;
  permenantAddress: string;
  purposeOfTransfer: string;
  //  uploadDocuments?: File[]; // example if needed
};

// 2) Props for the wizard.
//    `initialValues` is partial => merges with defaults.
type ForeignTransfersFormProps = {
  initialValues?: Partial<ForeignTransfersFormValues>;
  onSubmit: (values: ForeignTransfersFormValues) => void;
};

// 3) Default/empty fields for "Add" scenario
const defaultValues: ForeignTransfersFormValues = {
  id: 0,

  toBank: "",
  branch: "",
  residentSupplierName: "",
  residentSupplierNationality: "",
  nonResidentSupplierPassportNumber: 0,
  placeOfIssue: "",
  dateOfIssue: "",
  nonResidentSupplierNationality: "",
  nonResidentAddress: "",

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
  // uploadDocuments: [],
};

export default function ForeignTransfersForm({
  initialValues,
  onSubmit,
}: ForeignTransfersFormProps) {
  const t = useTranslations("foreignTransfers");

  // Merge partial with defaults
  const merged: ForeignTransfersFormValues = {
    ...defaultValues,
    ...initialValues,
  };

  // Steps for the wizard
  const steps = [
    {
      title: t("step1Title"),
      component: <Step1TransferInfo />,
    },
    {
      title: t("step2Title"),
      component: <Step2BankingDetails />,
    },
  ];

  // Translate field name => label for the final review step
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1Inputs, ...step2Inputs];
    const found = allInputs.find((inp) => inp.name === fieldName);
    if (found) {
      return t(found.label);
    }
    return fieldName; // fallback
  }

  // We'll define step-based validations
  const stepValidations = [
    // Step 1 partial schema
    Yup.object({
      toBank: Yup.string().required(t("toBank") + " " + t("isRequired")),
      // ... fill out other fields you want for Step1
    }),
    // Step 2 partial
    Yup.object({
      transferAmount: Yup.number().required(
        t("transferAmount") + " " + t("isRequired")
      ),
      // ... fill out other step2 validations
    }),
  ];

  async function handleFinalSubmit(values: ForeignTransfersFormValues) {
    onSubmit(values);
  }

  return (
    <div className="w-full p-4 bg-gray-50 rounded-md">
      <Formik
        initialValues={merged}
        onSubmit={(vals) => handleFinalSubmit(vals)}
        validationSchema={Yup.object({})}
        validateOnBlur
        validateOnChange={false}
      >
        {(formik) => {
          // Step-based validation logic
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
