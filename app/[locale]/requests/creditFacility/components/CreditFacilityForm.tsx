/* --------------------------------------------------------------------------
 * app/[locale]/requests/creditFacility/components/CreditFacilityForm.tsx
 * i18n-ready (en ⇄ ar) version — copy-paste
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import FormHeader from "@/app/components/reusable/FormHeader";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { FaPaperPlane } from "react-icons/fa";

import type { TCreditFacility } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types";

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  initialData?: TCreditFacility | null;
  onSubmit: (vals: TCreditFacility) => void;
  onCancel: () => void;
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function CreditFacilityForm({
  initialData,
  onSubmit,
  readOnly = false,
}: Props) {
  /* ─── i18n hooks ──────────────────────────────────────────────── */
  const tFields = useTranslations("creditFacility.form.fields");
  const tVal = useTranslations("creditFacility.form.validation");
  const tUi = useTranslations("creditFacility.form.ui");

  /* ─── Currency dropdown ──────────────────────────────────────── */
  const [currencyOptions, setCurrencyOptions] = useState<
    { label: string; value: string }[]
  >([]);

  /* ─── Modal state ────────────────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* ─── Fetch currencies (once) ────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res: CurrenciesResponse = await getCurrencies(1, 50, "", "");
        setCurrencyOptions(
          res.data.map((c) => ({ label: c.description, value: c.code }))
        );
      } catch (err) {
        console.error("Currency fetch error:", err);
        setModalTitle(tUi("errorTitle"));
        setModalMessage(tUi("currencyFetchError"));
        setModalSuccess(false);
        setModalOpen(true);
      }
    })();
  }, [tUi]);

  /* ─── Form defaults & validation ─────────────────────────────── */
  const defaultValues: TCreditFacility = {
    id: undefined,
    accountNumber: "",
    date: "",
    amount: 0,
    purpose: "",
    additionalInfo: "",
    curr: "",
    refferenceNumber: "",
    type: "creditFacility",
  };

  const initialValues: TCreditFacility = initialData
    ? { ...defaultValues, ...initialData, type: "creditFacility" }
    : defaultValues;

  const validationSchema = Yup.object({
    accountNumber: Yup.string().required(tVal("required")),
    date: Yup.string().required(tVal("required")),
    amount: Yup.number()
      .typeError(tVal("amountMustBeNumber"))
      .required(tVal("required")),
    purpose: Yup.string().required(tVal("required")),
    additionalInfo: Yup.string().nullable(),
    curr: Yup.string().required(tVal("required")),
    refferenceNumber: Yup.string().required(tVal("required")),
  });

  /* ─── Submit handler ─────────────────────────────────────────── */
  async function handleSubmit(
    values: TCreditFacility,
    { setSubmitting, resetForm }: FormikHelpers<TCreditFacility>
  ) {
    try {
      await onSubmit({ ...values, type: "creditFacility" });

      setModalTitle(tUi("savedTitle"));
      setModalMessage(tUi("savedMessage"));
      setModalSuccess(true);
      setModalOpen(true);
      resetForm();
    } catch (err) {
      setModalTitle(tUi("errorTitle"));
      setModalMessage(
        err instanceof Error ? err.message : tUi("submitErrorGeneric")
      );
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── JSX ────────────────────────────────────────────────────── */
  return (
    <>
      <div className="w-full bg-gray-100 rounded-md p-4">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <FormHeader
                showBackButton
                fallbackPath="/requests/creditFacility"
                isEditing={readOnly}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Account Number */}
                <FormInputIcon
                  name="accountNumber"
                  label={tFields("accountNumber")}
                  type="text"
                  disabled={readOnly}
                  maskingFormat="0000-000000-000"
                />

                {/* Date */}
                <DatePickerValue
                  name="date"
                  label={tFields("date")}
                  disabled={readOnly}
                />

                {/* Amount */}
                <FormInputIcon
                  name="amount"
                  label={tFields("amount")}
                  type="number"
                  disabled={readOnly}
                />

                {/* Purpose */}
                <FormInputIcon
                  name="purpose"
                  label={tFields("purpose")}
                  type="text"
                  disabled={readOnly}
                />

                {/* Additional Info */}
                <FormInputIcon
                  name="additionalInfo"
                  label={tFields("additionalInfo")}
                  type="text"
                  disabled={readOnly}
                />

                {/* Currency */}
                <InputSelectCombo
                  name="curr"
                  label={tFields("currency")}
                  options={currencyOptions}
                  placeholder={tUi("currencyPlaceholder")}
                  width="w-full"
                  disabled={readOnly}
                />

                {/* Reference Number */}
                <FormInputIcon
                  name="refferenceNumber"
                  label={tFields("referenceNumber")}
                  type="text"
                  disabled={readOnly}
                />
              </div>

              {!readOnly && (
                <div className="mt-4 flex justify-center gap-3">
                  <SubmitButton
                    title={initialData ? tUi("saveChanges") : tUi("add")}
                    color="info-dark"
                    Icon={FaPaperPlane}
                    isSubmitting={isSubmitting}
                    disabled={!isValid || !dirty || isSubmitting}
                    fullWidth={false}
                  />
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      {/* Modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </>
  );
}
