"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import { TabsWizard } from "@/app/components/reusable/TabsWizard";
import { Step1VisaRequest } from "./Step1VisaRequest";
import { Step2VisaRequest } from "./Step2VisaRequest";
import { step1VisaInputs, step2VisaInputs } from "./visaInputs";
import type { VisaRequestFormValues } from "../types";
import type { InputSelectComboOption } from "@/app/components/FormUI/InputSelectCombo";

import { getVisas } from "@/app/helpers/getVisas";
import type { VisaItem } from "@/types";
import { buildImageProxyUrl } from "@/app/utils/imageProxy";

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

  /* ---- Visas (fetch once at the form level) -------------------------- */
  const [visaTypeOptions, setVisaTypeOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [isLoadingVisas, setIsLoadingVisas] = useState(false);

  useEffect(() => {
    const run = async (): Promise<void> => {
      setIsLoadingVisas(true);
      try {
        const visas = await getVisas(); // VisaItem[]
        const opts: InputSelectComboOption[] = visas.map((v: VisaItem) => {
          const name = v.nameAr ?? v.nameEn ?? String(v.id);
          return { label: `${name} — ${v.price} دينار`, value: String(v.id) };
        });
        setVisaTypeOptions(opts);
      } catch (err) {
        console.error("Failed to fetch visa types:", err);
        setVisaTypeOptions([]);
      } finally {
        setIsLoadingVisas(false);
      }
    };
    void run();
  }, []);

  /* ---- Initial values ------------------------------------------------ */
  const mergedInitial: VisaRequestFormValues = {
    visaId: initialValues?.visaId,
    quantity: (initialValues as { quantity?: number })?.quantity ?? 1,

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
    attachmentUrls: initialValues?.attachmentUrls,
    ...initialValues,
  };

  /* ---- Wizard steps -------------------------------------------------- */
  const steps = useMemo(
    () => [
      {
        title: t("step1Title"),
        component: (
          <Step1VisaRequest
            readOnly={readOnly}
            accountOptions={accountOptions}
            visaTypeOptions={visaTypeOptions}
            isLoadingVisas={isLoadingVisas}
          />
        ),
      },
      {
        title: t("step2Title"),
        component: (
          <Step2VisaRequest
            readOnly={readOnly}
            attachmentUrls={initialValues?.attachmentUrls?.map((url) =>
              buildImageProxyUrl(url)
            )}
            isEditMode={Boolean(initialValues)}
          />
        ),
      },
    ],
    [
      t,
      readOnly,
      accountOptions,
      visaTypeOptions,
      isLoadingVisas,
      initialValues,
    ]
  );

  /* ---- Field-name translator (for review) ---------------------------- */
  function translateFieldName(fieldName: string): string {
    const allInputs = [...step1VisaInputs, ...step2VisaInputs];
    const found = allInputs.find((i) => i.name === fieldName);
    return found ? t(found.label) : fieldName;
  }

  /* ---- Per-step validation ------------------------------------------ */
  const stepValidations = [
    Yup.object({
      visaId: Yup.mixed().required(t("visaType") + " " + t("isRequired")),
      quantity: Yup.number()
        .required(t("quantity") + " " + t("isRequired"))
        .min(1, t("quantity") + " >= 1"),
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
      phoneNumberLinkedToNationalId: Yup.number()
        .required(t("phoneNumberLinkedToNationalId") + " " + t("isRequired"))
        .test(
          "len",
          t("phoneNumberLinkedToNationalId") + " must be exactly 10 digits",
          (val) => (val ? val.toString().length === 10 : false)
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

  /* ---- Direct submit (confirmation removed) -------------------------- */
  async function handleSubmit(
    values: VisaRequestFormValues & { files?: File[]; newFiles?: File[] }
  ) {
    const allFiles = [...(values.files || []), ...(values.newFiles || [])];
    const submitValues: VisaRequestFormValues & { files?: File[] } = {
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
              <TabsWizard
                steps={steps}
                formik={formik}
                onSubmit={() => formik.handleSubmit()}
                validateCurrentStep={validateCurrentStep}
                translateFieldName={translateFieldName}
                readOnly={readOnly}
                isEditing={Boolean(initialValues)}
                backFallbackPath="/requests/visaRequest"
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
