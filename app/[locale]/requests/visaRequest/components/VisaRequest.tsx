"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1VisaRequest } from "./Step1VisaRequest";
import { Step2VisaRequest } from "./Step2VisaRequest";
import { step1VisaInputs, step2VisaInputs } from "./visaInputs";

/**
 * The shape of all fields needed across steps, plus "id" to identify the row
 */
export type VisaRequestFormValues = {
  id: number; // For double-click/edit
  branch: string;
  date: string;
  accountHolderName: string;
  accountNumber: string;
  nationalId: number | undefined;
  phoneNumberLinkedToNationalId: string;

  cbl: string;
  cardMovementApproval: string;
  cardUsingAcknowledgment: string;
  foreignAmount?: number;
  localAmount?: number;
  pldedge: string;
};

/** Multi-step wizard logic.
 *  We pass `initialValues` if we want to prefill.
 *  If none, it's an Add scenario with empty fields.
 */
type VisaWizardFormProps = {
  initialValues?: Partial<VisaRequestFormValues>;
  onSubmit: (values: VisaRequestFormValues) => void;
};

export default function VisaWizardForm({
  initialValues,
  onSubmit,
}: VisaWizardFormProps) {
  const t = useTranslations("visaRequest");

  // Merge default with partial
  // Provide a default "id=0" if none is given
  const mergedInitial: VisaRequestFormValues = {
    id: 0,
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

  /** Steps config for `TabsWizard`.
   *  We'll have 2 steps, plus a final "Review" step appended automatically.
   */
  const steps = [
    {
      title: t("step1Title"),
      component: <Step1VisaRequest />,
    },
    {
      title: t("step2Title"),
      component: <Step2VisaRequest />,
    },
  ];

  /**
   * We unify the label translations from `step1VisaInputs` + `step2VisaInputs`.
   * The ReviewStep calls `translateFieldName(fieldName)`.
   */
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1VisaInputs, ...step2VisaInputs];
    const found = allInputs.find((input) => input.name === fieldName);
    if (found) {
      return t(found.label);
    }
    // fallback
    return fieldName;
  }

  /**
   * We do step-based validations.
   * - Step 1 => partial schema
   * - Step 2 => partial schema
   */
  const stepValidations = [
    // Step1
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

    // Step2
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

  /** The final handleSubmit after the wizard's "Review & Submit" step. */
  async function handleSubmit(values: VisaRequestFormValues) {
    // Pass up to the parent
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
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
