"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1VisaRequest } from "./Step1VisaRequest";
import { Step2VisaRequest } from "./Step2VisaRequest";
import { step1VisaInputs, step2VisaInputs } from "./visaInputs";
import { VisaRequestFormValues } from "../types";

type VisaWizardFormProps = {
  initialValues?: Partial<VisaRequestFormValues>;
  onSubmit: (values: VisaRequestFormValues) => void;
  /** If true, disable all inputs and remove the last-step button */
  readOnly?: boolean;
};

export default function VisaWizardForm({
  initialValues,
  onSubmit,
  readOnly = false,
}: VisaWizardFormProps) {
  const t = useTranslations("visaRequest");

  // Default/merged
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
    ...initialValues,
  };

  const steps = [
    {
      title: t("step1Title"),
      component: <Step1VisaRequest readOnly={readOnly} />,
    },
    {
      title: t("step2Title"),
      component: <Step2VisaRequest readOnly={readOnly} />,
    },
  ];

  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1VisaInputs, ...step2VisaInputs];
    const found = allInputs.find((i) => i.name === fieldName);
    if (found) return t(found.label);
    return fieldName;
  }

  // Each step's schema
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
      nationalId: Yup.number().required(
        t("nationalId") + " " + t("isRequired")
      ),
      phoneNumberLinkedToNationalId: Yup.string().required(
        t("phoneNumberLinkedToNationalId") + " " + t("isRequired")
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

  async function handleSubmit(values: VisaRequestFormValues) {
    onSubmit(values);
  }

  return (
    <div className="w-full p-4 bg-gray-50 rounded-md">
      <Formik
        initialValues={mergedInitial}
        onSubmit={(vals) => handleSubmit(vals)}
        validationSchema={Yup.object({})}
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
              if (err instanceof Yup.ValidationError) {
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
                readOnly={readOnly} // Pass down to handle last-step button removal
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
