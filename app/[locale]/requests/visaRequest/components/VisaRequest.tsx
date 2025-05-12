"use client";

import React from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
// Adjust to your actual path
import { Step1VisaRequest } from "./Step1VisaRequest";
import { Step2VisaRequest } from "./Step2VisaRequest";
import { step1VisaInputs, step2VisaInputs } from "./visaInputs";
import { VisaRequestFormValues } from "../types";

/**
 * The main 2-step Visa Request form,
 * plus a final "Review & Submit" step appended by TabsWizard.
 */
export default function VisaRequest() {
  const t = useTranslations("visaRequest");
  // e.g. if your namespace is "visaRequest" in ar.json

  // Step titles (translated)
  const steps = [
    {
      title: t("step1Title"), // e.g. "الخطوة الأولى"
      component: <Step1VisaRequest />,
    },
    {
      title: t("step2Title"), // e.g. "الخطوة الثانية"
      component: <Step2VisaRequest />,
    },
  ];

  /**
   * We'll pass this to the final appended review step in TabsWizard.
   * In the review, each field label is looked up in step1VisaInputs + step2VisaInputs.
   * Then we call t() on the found label key.
   * If not found, fallback to the raw fieldName.
   */
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1VisaInputs, ...step2VisaInputs];
    const found = allInputs.find((input) => input.name === fieldName);
    if (found) {
      // Translate the label key from ar.json
      return t(found.label);
    }
    // fallback
    return fieldName;
  }

  // initial form data
  const initialValues: VisaRequestFormValues = {
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
  };

  // Step-by-step validations
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

  // Final form submission
  async function handleSubmit(
    values: VisaRequestFormValues,
    { resetForm, setSubmitting }: FormikHelpers<VisaRequestFormValues>
  ) {
    console.log("Visa Request Form Submitted:", values);
    // simulate API
    setTimeout(() => {
      alert("Visa request submitted successfully!");
      resetForm();
      setSubmitting(false);
    }, 1000);
  }

  return (
    <div className="w-full p-4 bg-gray-50">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        // We'll do step-based validations, so main schema can be empty
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
