/* --------------------------------------------------------------------------
 * app/[locale]/requests/visaRequest/components/VisaWizardForm.tsx
 * Uses <InputSelectCombo> for accountNumber (options read from cookie)
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1VisaRequest } from "./Step1VisaRequest";
import { Step2VisaRequest } from "./Step2VisaRequest";
import { step1VisaInputs, step2VisaInputs } from "./visaInputs";
import { VisaRequestFormValues } from "../types";
import type { InputSelectComboOption } from "@/app/components/FormUI/InputSelectCombo";

type VisaWizardFormProps = {
  initialValues?: Partial<VisaRequestFormValues>;
  onSubmit: (values: VisaRequestFormValues & { files?: File[] }) => void;
  readOnly?: boolean;
  onBack?: () => void;
};

export default function VisaWizardForm({
  initialValues,
  onSubmit,
  readOnly = false,
}: VisaWizardFormProps) {
  const t = useTranslations("visaRequest");
  const baseImgUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  console.log("initial values in VisaWizardForm:", initialValues);

  /* ---- Account dropdown (cookie) ------------------------------------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let list: string[] = [];
    try {
      list = JSON.parse(raw);
    } catch {
      try {
        list = JSON.parse(decodeURIComponent(raw));
      } catch {
        list = [];
      }
    }
    setAccountOptions(list.map((acc) => ({ label: acc, value: acc })));
  }, []);

  /* ---- Initial values ------------------------------------------------ */
  const mergedInitial: VisaRequestFormValues = {
    branch: "",
    date: "",
    accountHolderName: "",
    accountNumber: "",
    nationalId: undefined,
    phoneNumberLinkedToNationalId: "",
    cbl: "",
    cardMovementApproval: "",
    cardUsingAcknowledgment: "",
    foreignAmount: undefined,
    localAmount: undefined,
    pldedge: "",
    files: (initialValues as { files?: File[] })?.files ?? [],
    newFiles: (initialValues as { newFiles?: File[] })?.newFiles ?? [],
    ...initialValues,
  };

  /* ---- Wizard steps -------------------------------------------------- */
  const steps = [
    {
      title: t("step1Title"),
      component: (
        <Step1VisaRequest readOnly={readOnly} accountOptions={accountOptions} />
      ),
    },
    {
      title: t("step2Title"),
      component: (
        <Step2VisaRequest
          readOnly={readOnly}
          /* --------------------------------------------------------------
             Prefix each stored file path with the public image-base URL.
             If baseImgUrl is undefined (env not set), fall back to the
             original path so nothing breaks.
           -------------------------------------------------------------- */
          attachmentUrls={initialValues?.attachmentUrls?.map((url) =>
            baseImgUrl ? `${baseImgUrl}/${url}` : url
          )}
          isEditMode={Boolean(initialValues)}
        />
      ),
    },
  ];

  /* ---- Field-name translator (for review) ---------------------------- */
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1VisaInputs, ...step2VisaInputs];
    const found = allInputs.find((i) => i.name === fieldName);
    return found ? t(found.label) : fieldName;
  }

  /* ---- Per-step validation ------------------------------------------ */
  const stepValidations = [
    Yup.object({
      branch: Yup.string().required(t("branch") + " " + t("isRequired")),
      date: Yup.string().required(t("date") + " " + t("isRequired")),
      accountHolderName: Yup.string().required(
        t("accountHolderName") + " " + t("isRequired")
      ),
      accountNumber: Yup.string().required(
        t("accountNumber") + " " + t("isRequired")
      ),
      nationalId: Yup.number()
        .required(t("nationalId") + " " + t("isRequired"))
        .test("len", t("nationalId") + " must be exactly 12 digits", (val) =>
          val ? val.toString().length === 12 : false
        ),
      phoneNumberLinkedToNationalId: Yup.string()
        .required(t("phoneNumberLinkedToNationalId") + " " + t("isRequired"))
        .matches(
          /^\d{10}$/,
          t("phoneNumberLinkedToNationalId") + " must be exactly 10 digits"
        ),
    }),
    Yup.object({
      cbl: Yup.string().required(t("cbl") + " " + t("isRequired")),
      cardMovementApproval: Yup.string().required(
        t("cardMovementApproval") + " " + t("isRequired")
      ),
      cardUsingAcknowledgment: Yup.string().required(
        t("cardUsingAcknowledgment") + " " + t("isRequired")
      ),
      foreignAmount: Yup.number().required(
        t("foreignAmount") + " " + t("isRequired")
      ),
      localAmount: Yup.number().required(
        t("localAmount") + " " + t("isRequired")
      ),
      pldedge: Yup.string().required(t("pldedge") + " " + t("isRequired")),
    }),
  ];

  /* ---- Submit -------------------------------------------------------- */
  async function handleSubmit(
    values: VisaRequestFormValues & { files?: File[]; newFiles?: File[] }
  ) {
    // Merge existing files with new files
    const allFiles = [...(values.files || []), ...(values.newFiles || [])];

    const submitValues = {
      ...values,
      files: allFiles,
    };

    onSubmit(submitValues);
  }

  /* ---- JSX ----------------------------------------------------------- */
  return (
    <div className="w-full p-4 bg-gray-50 rounded-md">
      <Formik
        initialValues={mergedInitial}
        onSubmit={handleSubmit}
        validationSchema={Yup.object({})}
        validateOnBlur
        validateOnChange={false}
      >
        {(formik) => {
          async function validateCurrentStep(stepIdx: number) {
            const schema = stepValidations[stepIdx];
            try {
              await schema.validate(formik.values, { abortEarly: false });
              formik.setErrors({});
              return true;
            } catch (err) {
              if (err instanceof Yup.ValidationError) {
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
          }

          return (
            <Form>
              {/* <FormHeader
                showBackButton
                fallbackPath="/requests/visaRequest"
                status={status}
                onBack={onBack}
              /> */}
              <TabsWizard
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={translateFieldName}
                readOnly={readOnly}
                isEditing={initialValues !== undefined}
                backFallbackPath="/requests/visaRequest"
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
