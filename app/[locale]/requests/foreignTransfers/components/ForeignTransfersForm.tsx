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

/**
 * 1) The shape of all fields.
 */
export type ForeignTransfersFormValues = {
  id: number;

  // Step 1 fields
  toBank: string;
  branch: string;
  residentSupplierName: string;
  residentSupplierNationality: string;
  nonResidentPassportNumber: number;
  placeOfIssue: string;
  dateOfIssue: string;
  nonResidentNationality: string;
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
  accountHolderName: string;
  permanentAddress: string;
  purposeOfTransfer: string;
};

/**
 * 2) Props for the wizard.
 */
type ForeignTransfersFormProps = {
  initialValues?: Partial<ForeignTransfersFormValues>;
  onSubmit: (values: ForeignTransfersFormValues) => void;
  /** If true, disable fields & remove final 'Submit' button. */
  readOnly?: boolean;
};

/** 3) Default/empty fields for "Add" scenario */
const defaultValues: ForeignTransfersFormValues = {
  id: 0,

  toBank: "",
  branch: "",
  residentSupplierName: "",
  residentSupplierNationality: "",
  nonResidentPassportNumber: 0,
  placeOfIssue: "",
  dateOfIssue: "",
  nonResidentNationality: "",
  nonResidentAddress: "",

  transferAmount: 0,
  toCountry: "",
  beneficiaryName: "",
  beneficiaryAddress: "",
  externalBankName: "",
  externalBankAddress: "",
  transferToAccountNumber: 0,
  transferToAddress: "",
  accountHolderName: "",
  permanentAddress: "",
  purposeOfTransfer: "",
};

export default function ForeignTransfersForm({
  initialValues,
  onSubmit,
  readOnly = false,
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
      component: <Step1TransferInfo readOnly={readOnly} />,
    },
    {
      title: t("step2Title"),
      component: <Step2BankingDetails readOnly={readOnly} />,
    },
  ];

  // Translate field name => label for the final "Review"
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1Inputs, ...step2Inputs];
    const found = allInputs.find((inp) => inp.name === fieldName);
    if (found) {
      return t(found.label);
    }
    return fieldName; // fallback
  }

  // Step-based validations
  const stepValidations = [
    // Step 1 partial schema
    Yup.object({
      toBank: Yup.string().required(t("toBank") + " " + t("isRequired")),
      branch: Yup.string().required(t("branch") + " " + t("isRequired")),
      // ... etc
    }),
    // Step 2 partial schema
    Yup.object({
      transferAmount: Yup.number()
        .typeError(t("transferAmount") + " " + t("mustBeNumber"))
        .required(t("transferAmount") + " " + t("isRequired")),
      // ... etc
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
        validationSchema={Yup.object({})} // We'll do partial step schemas
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
              <TabsWizard<ForeignTransfersFormValues>
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={translateFieldName}
                readOnly={readOnly}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
