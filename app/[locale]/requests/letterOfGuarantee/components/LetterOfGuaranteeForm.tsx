/* --------------------------------------------------------------------------
 * app/[locale]/requests/letterOfGuarantee/components/LetterOfGuaranteeForm.tsx
 * Account Number now uses <InputSelectCombo> fed from cookie list
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
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

import { FaPaperPlane } from "react-icons/fa";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { CheckAccount } from "@/app/helpers/checkAccount";

import type { TLetterOfGuarantee } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types";
import type { AccountInfo } from "@/app/helpers/checkAccount";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
type Props = {
  initialData?: TLetterOfGuarantee | null;
  onSubmit: (vals: TLetterOfGuarantee) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isSubmitting?: boolean;
};

/* ------------------------------------------------------------------ */
/* Inner form props                                                    */
/* ------------------------------------------------------------------ */
type InnerFormProps = FormikProps<TLetterOfGuarantee> & {
  initialData?: TLetterOfGuarantee | null;
  availableBalance: number | null;
  setAvailableBalance: React.Dispatch<React.SetStateAction<number | null>>;
  currencyOptions: InputSelectComboOption[];
  accountOptions: InputSelectComboOption[];
  readOnly?: boolean;
  isSubmitting?: boolean;
};

/* ------------------------------------------------------------------ */
/* Inner form                                                          */
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
  accountOptions,
  initialData,
  readOnly = false,
}: InnerFormProps) {
  const t = useTranslations("letterOfGuarantee.form.fields");
  const tu = useTranslations("letterOfGuarantee.form.ui");

  /* --- check account balance whenever accountNumber changes --- */
  useEffect(() => {
    if (!values.accountNumber) {
      setAvailableBalance(null);
      return;
    }

    (async () => {
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
    })();
  }, [
    values.accountNumber,
    setFieldError,
    setFieldTouched,
    setAvailableBalance,
    tu,
  ]);
  const status =
    (initialData as { status?: string } | undefined)?.status ?? undefined;

  const accountHasError = Boolean(
    errors.accountNumber && touched.accountNumber
  );

  return (
    <Form>
      <FormHeader
        showBackButton
        status={status}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Account Number -> InputSelectCombo */}
        <div className="flex flex-col">
          <InputSelectCombo
            name="accountNumber"
            label={t("accountNumber")}
            options={accountOptions}
            width="w-full"
            maskingFormat="0000-000000-000"
            disabled={readOnly || isSubmitting}
          />
          {availableBalance != null && (
            <p className="text-sm text-gray-500 mt-1">
              {tu("availableBalance", {
                amount: availableBalance.toLocaleString(),
              })}
            </p>
          )}
        </div>

        {/* Date */}
        <DatePickerValue name="date" label={t("date")} disabled={readOnly || isSubmitting} />

        {/* Amount */}
        <FormInputIcon
          name="amount"
          label={t("amount")}
          type="number"
          disabled={readOnly || isSubmitting}
        />

        {/* Purpose */}
        <FormInputIcon
          name="purpose"
          label={t("purpose")}
          type="text"
          disabled={readOnly || isSubmitting}
        />

        {/* Additional Info */}
        <FormInputIcon
          name="additionalInfo"
          label={t("additionalInfo")}
          type="text"
          disabled={readOnly || isSubmitting}
        />

        {/* Currency */}
        <InputSelectCombo
          name="curr"
          label={t("currency")}
          options={currencyOptions}
          placeholder={tu("currencyPlaceholder")}
          width="w-full"
          disabled={readOnly || isSubmitting}
        />

        {/* Reference Number */}
        <FormInputIcon
          name="refferenceNumber"
          label={t("referenceNumber")}
          type="text"
          disabled={readOnly || isSubmitting}
        />
      </div>

      {!readOnly && (
        <div className="mt-4 flex justify-center items-center gap-3">
          <SubmitButton
            title={initialData ? tu("saveChanges") : tu("add")}
            color="info-dark"
            Icon={FaPaperPlane}
            fullWidth={false}
            isSubmitting={isSubmitting}
            disabled={!isValid || !dirty || isSubmitting || accountHasError}
          />
        </div>
      )}
    </Form>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function LetterOfGuaranteeForm({
  initialData,
  onSubmit,
  
  readOnly = false,
  isSubmitting = false,
}: Props) {
  const tv = useTranslations("letterOfGuarantee.form.validation");
  const tu = useTranslations("letterOfGuarantee.form.ui");

  /* --- dropdown data ----------------------------------------------------- */
  const [currencyOptions, setCurrencyOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  /* available balance state */
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* load currencies */
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

  /* load account numbers from cookie */
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

  /* ---- form values & schema -------------------------------------------- */
  const defaults: TLetterOfGuarantee = {
    id: undefined,
    accountNumber: "",
    date: "",
    amount: 0,
    purpose: "",
    additionalInfo: "",
    curr: "",
    refferenceNumber: "",
    type: "letterOfGuarantee",
    status: ""
  };
  const initialValues: TLetterOfGuarantee = initialData
    ? { ...defaults, ...initialData, type: "letterOfGuarantee" }
    : defaults;

  const schema = Yup.object({
    accountNumber: Yup.string().required(tv("required")),
    date: Yup.string().required(tv("required")),
    amount: Yup.number()
      .typeError(tv("amountMustBeNumber"))
      .required(tv("required"))
      .positive(tv("amountPositive"))
      .test(
        "balance-check",
        tv("amountExceedsBalance"),
        (val) => !val || availableBalance == null || val <= availableBalance
      ),
    purpose: Yup.string().required(tv("required")),
    additionalInfo: Yup.string().nullable(),
    curr: Yup.string().required(tv("required")),
    refferenceNumber: Yup.string().required(tv("required")),
  });

  /* ---- submit ----------------------------------------------------------- */
  async function handleSubmit(
    vals: TLetterOfGuarantee,
    { setSubmitting, resetForm }: FormikHelpers<TLetterOfGuarantee>
  ) {
    try {
      onSubmit({ ...vals, type: "letterOfGuarantee" });
      resetForm();

      setModalTitle(tu("savedTitle"));
      setModalMessage(tu("savedMessage"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tu("unexpectedError");
      setModalTitle(tu("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- JSX -------------------------------------------------------------- */
  return (
    <div className="w-full bg-gray-100 rounded-md p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
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
            accountOptions={accountOptions}
            readOnly={readOnly || isSubmitting}
            isSubmitting={isSubmitting || formik.isSubmitting}
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
