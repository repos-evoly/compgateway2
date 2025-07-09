/* --------------------------------------------------------------------------
   components/ForeignTransfersForm.tsx
   -------------------------------------------------------------------------- */
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
import FormHeader from "@/app/components/reusable/FormHeader";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────── */
export type ForeignTransfersFormValues = {
  status?: string ;
  id: number;

  /* Step 1 */
  toBank: string;
  branch: string;
  residentSupplierName: string;
  residentSupplierNationality: string;
  nonResidentPassportNumber: number;
  placeOfIssue: string;
  dateOfIssue: string;
  nonResidentNationality: string;
  nonResidentAddress: string;

  /* Step 2 */
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

type ForeignTransfersFormProps = {
  initialValues?: Partial<ForeignTransfersFormValues>;
  onSubmit: (values: ForeignTransfersFormValues) => void;
  readOnly?: boolean;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Defaults
 * ──────────────────────────────────────────────────────────────────────── */
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
  status: undefined,
};

/* ──────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────── */
export default function ForeignTransfersForm({
  initialValues,
  onSubmit,
  readOnly = false,
}: ForeignTransfersFormProps) {
  const t = useTranslations("foreignTransfers");

  const merged: ForeignTransfersFormValues = {
    ...defaultValues,
    ...initialValues,
  };
  const status =
    (initialValues as { status?: string } | undefined)?.status ?? undefined;
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

  const allInputs = [...step1Inputs, ...step2Inputs];
  const translateFieldName = (name: string) =>
    t(allInputs.find((i) => i.name === name)?.label ?? name);

  /* Step-scoped validation */
  const stepValidations = [
    Yup.object({
      toBank: Yup.string().required(`${t("toBank")} ${t("isRequired")}`),
      branch: Yup.string().required(`${t("branch")} ${t("isRequired")}`),
    }),
    Yup.object({
      transferAmount: Yup.number()
        .typeError(`${t("transferAmount")} ${t("mustBeNumber")}`)
        .required(`${t("transferAmount")} ${t("isRequired")}`),
    }),
  ];

  const handleFinalSubmit = (values: ForeignTransfersFormValues) =>
    onSubmit(values);

  return (
    <div className="w-full rounded-md bg-gray-50 p-4">
      <Formik
        initialValues={merged}
        onSubmit={handleFinalSubmit}
        validationSchema={Yup.object({})} /* TabsWizard runs per-step schema */
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
              <FormHeader status={status} />
              <TabsWizard<ForeignTransfersFormValues>
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={translateFieldName}
                readOnly={readOnly}
                fallbackPath="/requests/foreignTransfers"
                isEditing={!!initialValues}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
