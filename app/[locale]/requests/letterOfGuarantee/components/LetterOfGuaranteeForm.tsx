/* --------------------------------------------------------------------------
 * app/[locale]/requests/letterOfGuarantee/components/LetterOfGuaranteeForm.tsx
 * Fully-translated (en ⇄ ar) + account-check guard — FINAL VERSION
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

import FormHeader from "@/app/components/reusable/FormHeader";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { FaPaperPlane } from "react-icons/fa";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { CheckAccount } from "@/app/helpers/checkAccount";

import type { TLetterOfGuarantee } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types";
import type { AccountInfo } from "@/app/helpers/checkAccount";

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  initialData?: TLetterOfGuarantee | null;
  onSubmit: (vals: TLetterOfGuarantee) => void;
  onCancel: () => void;
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Inner form props                                                   */
/* ------------------------------------------------------------------ */
type InnerFormProps = FormikProps<TLetterOfGuarantee> & {
  initialData?: TLetterOfGuarantee | null;
  availableBalance: number | null;
  setAvailableBalance: React.Dispatch<React.SetStateAction<number | null>>;
  currencyOptions: Array<{ label: string; value: string }>;
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Inner form                                                         */
/* ------------------------------------------------------------------ */
function InnerForm({
  isSubmitting,
  isValid,
  dirty,
  values,
  errors,
  touched,
  setFieldError,
  setFieldTouched,
  availableBalance,
  setAvailableBalance,
  currencyOptions,
  initialData,
  readOnly = false,
}: InnerFormProps) {
  const t = useTranslations("letterOfGuarantee.form.fields");
  const tu = useTranslations("letterOfGuarantee.form.ui");

  /* --------------------------------------------------------------
   * Check account balance whenever accountNumber changes
   * -------------------------------------------------------------- */
  useEffect(() => {
    if (!values.accountNumber) {
      setAvailableBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const info: AccountInfo[] = await CheckAccount(values.accountNumber);
        if (info.length) {
          setAvailableBalance(info[0].availableBalance);
          setFieldError("accountNumber", "");
        } else {
          setAvailableBalance(null);
          setFieldError("accountNumber", tu("accountNotFound"));
        }
      } catch {
        setAvailableBalance(null);
        setFieldError("accountNumber", tu("accountFetchError"));
      } finally {
        setFieldTouched("accountNumber", true, false);
      }
    };

    fetchBalance();
  }, [
    values.accountNumber,
    setFieldError,
    setFieldTouched,
    setAvailableBalance,
    tu,
  ]);

  const accountHasError = Boolean(
    errors.accountNumber && touched.accountNumber
  );

  return (
    <Form>
      <FormHeader
        showBackButton
        fallbackPath="/requests/letterOfGuarantee"
        isEditing={readOnly}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Account Number */}
        <FormInputIcon
          name="accountNumber"
          label={t("accountNumber")}
          type="text"
          helpertext={
            availableBalance != null
              ? tu("availableBalance", {
                  amount: availableBalance.toLocaleString(),
                })
              : undefined
          }
          disabled={readOnly}
          maskingFormat="0000-000000-000"
        />

        {/* Date */}
        <DatePickerValue name="date" label={t("date")} disabled={readOnly} />

        {/* Amount */}
        <FormInputIcon
          name="amount"
          label={t("amount")}
          type="number"
          disabled={readOnly}
        />

        {/* Purpose */}
        <FormInputIcon
          name="purpose"
          label={t("purpose")}
          type="text"
          disabled={readOnly}
        />

        {/* Additional Info */}
        <FormInputIcon
          name="additionalInfo"
          label={t("additionalInfo")}
          type="text"
          disabled={readOnly}
        />

        {/* Currency */}
        <InputSelectCombo
          name="curr"
          label={t("currency")}
          options={currencyOptions}
          placeholder={tu("currencyPlaceholder")}
          width="w-full"
          disabled={readOnly}
        />

        {/* Reference Number */}
        <FormInputIcon
          name="refferenceNumber"
          label={t("referenceNumber")}
          type="text"
          disabled={readOnly}
        />
      </div>

      {!readOnly && (
        <div className="mt-4 flex justify-center items-center gap-3">
          <SubmitButton
            title={initialData ? tu("saveChanges") : tu("add")}
            color="info-dark"
            Icon={FaPaperPlane}
            isSubmitting={isSubmitting}
            disabled={!isValid || !dirty || isSubmitting || accountHasError}
            fullWidth={false}
          />
        </div>
      )}
    </Form>
  );
}

/* ------------------------------------------------------------------ */
/* Main exported component                                            */
/* ------------------------------------------------------------------ */
export default function LetterOfGuaranteeForm({
  initialData,
  onSubmit,
  readOnly = false,
}: Props) {
  const tv = useTranslations("letterOfGuarantee.form.validation");
  const tu = useTranslations("letterOfGuarantee.form.ui");

  const [currencyOptions, setCurrencyOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* fetch currencies once */
  useEffect(() => {
    (async () => {
      try {
        const res: CurrenciesResponse = await getCurrencies(1, 50, "", "");
        setCurrencyOptions(
          res.data.map((c) => ({ label: c.description, value: c.code }))
        );
      } catch (err) {
        console.error("Currency fetch error:", err);
      }
    })();
  }, []);

  const defaultValues: TLetterOfGuarantee = {
    id: undefined,
    accountNumber: "",
    date: "",
    amount: 0,
    purpose: "",
    additionalInfo: "",
    curr: "",
    refferenceNumber: "",
    type: "letterOfGuarantee",
  };

  const initialValues: TLetterOfGuarantee = initialData
    ? { ...defaultValues, ...initialData, type: "letterOfGuarantee" }
    : defaultValues;

  const validationSchema = Yup.object({
    accountNumber: Yup.string().required(tv("required")),
    date: Yup.string().required(tv("required")),
    amount: Yup.number()
      .typeError(tv("amountMustBeNumber"))
      .required(tv("required"))
      .positive(tv("amountPositive"))
      .test(
        "check-balance",
        tv("amountExceedsBalance"),
        (val) => !val || availableBalance == null || val <= availableBalance
      ),
    purpose: Yup.string().required(tv("required")),
    additionalInfo: Yup.string().nullable(),
    curr: Yup.string().required(tv("required")),
    refferenceNumber: Yup.string().required(tv("required")),
  });

  async function handleSubmit(
    values: TLetterOfGuarantee,
    { setSubmitting, resetForm }: FormikHelpers<TLetterOfGuarantee>
  ) {
    try {
      onSubmit({ ...values, type: "letterOfGuarantee" });
      resetForm();

      setModalTitle(tu("savedTitle"));
      setModalMessage(tu("savedMessage"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err instanceof Error ? err.message : tu("unexpectedError");
      setModalTitle(tu("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-gray-100 rounded-md p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formik) => (
          <InnerForm
            {...formik}
            initialData={initialData}
            availableBalance={availableBalance}
            setAvailableBalance={setAvailableBalance}
            currencyOptions={currencyOptions}
            readOnly={readOnly}
          />
        )}
      </Formik>

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
}
