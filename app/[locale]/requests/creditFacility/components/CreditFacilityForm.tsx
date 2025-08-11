/* --------------------------------------------------------------------------
 * app/[locale]/requests/creditFacility/components/CreditFacilityForm.tsx
 * i18n‑ready — account number uses <InputSelectCombo> with cookie options
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

import FormHeader from "@/app/components/reusable/FormHeader";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { FaPaperPlane } from "react-icons/fa";

import type { TCreditFacility } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types";
import ReasonBanner from "@/app/components/reusable/ReasonBanner";
import BackButton from "@/app/components/reusable/BackButton";

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  initialData?: TCreditFacility | null;
  onSubmit: (vals: TCreditFacility) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isSubmitting?: boolean;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function CreditFacilityForm({
  initialData,
  onSubmit,

  readOnly = false,
}: Props) {
  /* ─── i18n ──────────────────────────────────────────────── */
  const tFields = useTranslations("creditFacility.form.fields");
  const tVal = useTranslations("creditFacility.form.validation");
  const tUi = useTranslations("creditFacility.form.ui");

  /* ─── currency dropdown ─────────────────────────────────── */
  const [currencyOptions, setCurrencyOptions] = useState<
    InputSelectComboOption[]
  >([]);
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

  /* ─── account number dropdown from cookie ───────────────── */
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

  /* ─── modal state ───────────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");


  /* ─── form defaults & validation ────────────────────────── */
  const defaults: TCreditFacility = {
    id: undefined,
    accountNumber: "",
    date: "",
    amount: 0,
    purpose: "",
    additionalInfo: "",
    curr: "",
    refferenceNumber: "",
    type: "creditFacility",
    status: "",
  };
  const initialValues: TCreditFacility = initialData
    ? { ...defaults, ...initialData, type: "creditFacility" }
    : defaults;

  const schema = Yup.object({
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

  /* ─── submit handler ────────────────────────────────────── */
  async function handleSubmit(
    vals: TCreditFacility,
    { setSubmitting, resetForm }: FormikHelpers<TCreditFacility>
  ) {
    try {
      await onSubmit({ ...vals, type: "creditFacility" });
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

  /* ─── JSX ──────────────────────────────────────────────── */
  return (
    <>
      <div className="w-full bg-gray-100 rounded-md p-4">
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <ReasonBanner
                reason={initialData?.reason} // assumes the API includes `reason`
              />
              <FormHeader>
                <BackButton
                  isEditing={initialData ? true : false}
                  fallbackPath="/requests/creditFacility"
                />
              </FormHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Account Number (dropdown) */}
                <InputSelectCombo
                  name="accountNumber"
                  label={tFields("accountNumber")}
                  options={accountOptions}
                  placeholder={tFields("accountNumber")}
                  width="w-full"
                  maskingFormat="0000-000000-000"
                  disabled={readOnly || isSubmitting}
                />

                {/* Date */}
                <DatePickerValue
                  name="date"
                  label={tFields("date")}
                  disabled={readOnly || isSubmitting}
                />

                {/* Amount */}
                <FormInputIcon
                  name="amount"
                  label={tFields("amount")}
                  type="number"
                  disabled={readOnly || isSubmitting}
                />

                {/* Purpose */}
                <FormInputIcon
                  name="purpose"
                  label={tFields("purpose")}
                  type="text"
                  disabled={readOnly || isSubmitting}
                />

                {/* Additional Info */}
                <FormInputIcon
                  name="additionalInfo"
                  label={tFields("additionalInfo")}
                  type="text"
                  disabled={readOnly || isSubmitting}
                />

                {/* Currency */}
                <InputSelectCombo
                  name="curr"
                  label={tFields("currency")}
                  options={currencyOptions}
                  placeholder={tUi("currencyPlaceholder")}
                  width="w-full"
                  disabled={readOnly || isSubmitting}
                />

                {/* Reference Number */}
                <FormInputIcon
                  name="refferenceNumber"
                  label={tFields("referenceNumber")}
                  type="text"
                  disabled={readOnly || isSubmitting}
                />
              </div>

              {!readOnly && (
                <div className="mt-4 flex justify-center gap-3">
                  <SubmitButton
                    title={initialData ? tUi("saveChanges") : tUi("add")}
                    color="info-dark"
                    Icon={FaPaperPlane}
                    fullWidth={false}
                    isSubmitting={isSubmitting}
                    disabled={!isValid || !dirty || isSubmitting}
                  />
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

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
