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
import ReasonBanner from "@/app/components/reusable/ReasonBanner";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────── */
export type ForeignTransfersFormValues = {
  status?: string;
  reason?: string;
  id?: number;

  /* Step 1 */
  toBank: string;
  branch: string;
  residentSupplierName: string;
  residentSupplierNationality: string;
  nonResidentPassportNumber: string;
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
  transferToAccountNumber: string;
  transferToAddress: string;
  accountHolderName: string;
  permanentAddress: string;
  purposeOfTransfer: string;
  uploadDocuments?: File[];
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
  nonResidentPassportNumber: "",
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
  transferToAccountNumber: "",
  transferToAddress: "",
  accountHolderName: "",
  permanentAddress: "",
  purposeOfTransfer: "",
  uploadDocuments: undefined,
  status: undefined,
  reason: "",
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
      residentSupplierName: Yup.string().required(
        `${t("residentSuppName")} ${t("isRequired")}`
      ),
      residentSupplierNationality: Yup.string().required(
        `${t("residentSuppNationality")} ${t("isRequired")}`
      ),
      nonResidentPassportNumber: Yup.string().required(
        `${t("nonResidentPassport")} ${t("isRequired")}`
      ),
      placeOfIssue: Yup.string().required(
        `${t("placeOfIssue")} ${t("isRequired")}`
      ),
      dateOfIssue: Yup.string().required(
        `${t("dateOfIssue")} ${t("isRequired")}`
      ),
      nonResidentNationality: Yup.string().required(
        `${t("nonResidentSuppNationality")} ${t("isRequired")}`
      ),
      nonResidentAddress: Yup.string().required(
        `${t("nonResidentSuppaddress")} ${t("isRequired")}`
      ),
    }),
    Yup.object({
      transferAmount: Yup.number()
        .typeError(`${t("transferAmount")} ${t("mustBeNumber")}`)
        .required(`${t("transferAmount")} ${t("isRequired")}`),
      toCountry: Yup.string().required(
        `${t("destinationCountry")} ${t("isRequired")}`
      ),
      beneficiaryName: Yup.string().required(
        `${t("beneficiaryName")} ${t("isRequired")}`
      ),
      beneficiaryAddress: Yup.string().required(
        `${t("beneficiaryAddress")} ${t("isRequired")}`
      ),
      externalBankName: Yup.string().required(
        `${t("externalBankName")} ${t("isRequired")}`
      ),
      externalBankAddress: Yup.string().required(
        `${t("externalBankAddress")} ${t("isRequired")}`
      ),
      transferToAccountNumber: Yup.string().required(
        `${t("transferToAccount")} ${t("isRequired")}`
      ),
      transferToAddress: Yup.string().required(
        `${t("transferToAddress")} ${t("isRequired")}`
      ),
      accountHolderName: Yup.string().required(
        `${t("accountHolderName")} ${t("isRequired")}`
      ),
      permanentAddress: Yup.string().required(
        `${t("payementAddress")} ${t("isRequired")}`
      ),
      purposeOfTransfer: Yup.string().required(
        `${t("purpose")} ${t("isRequired")}`
      ),
      uploadDocuments: Yup.mixed().optional(),
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
            console.log(`Validating step ${idx} with values:`, formik.values);
            try {
              await stepValidations[idx].validate(formik.values, {
                abortEarly: false,
              });
              formik.setErrors({});
              console.log(`Step ${idx} validation passed`);
              return true;
            } catch (err) {
              console.log(`Step ${idx} validation failed:`, err);
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
              <ReasonBanner
                reason={merged.reason} // merged = your combined initial values
                label={t("rejectReason")} // or simply "Reason"
              />
              <TabsWizard
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={translateFieldName}
                readOnly={readOnly}
                isEditing={true}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
