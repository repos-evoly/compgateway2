"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import CancelButton from "@/app/components/FormUI/CancelButton";

import { FaPaperPlane, FaTimes } from "react-icons/fa";

// For fetching currencies
import { getCurrencies } from "@/app/[locale]/currencies/services";
// For checking account
import { CheckAccount } from "@/app/helpers/checkAccount";

import type { TLetterOfGuarantee } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types";
import type { AccountInfo } from "@/app/helpers/checkAccount";

/** Props for the top-level form component */
type Props = {
  initialData?: TLetterOfGuarantee | null; // if editing existing
  onSubmit: (vals: TLetterOfGuarantee) => void;
  onCancel: () => void;
  /** If true, form fields are disabled and submit is hidden */
  readOnly?: boolean;
};

/** Additional props for the inner Form component */
type InnerFormProps = FormikProps<TLetterOfGuarantee> & {
  onCancel: () => void;
  initialData?: TLetterOfGuarantee | null;
  availableBalance: number | null;
  setAvailableBalance: React.Dispatch<React.SetStateAction<number | null>>;
  currencyOptions: Array<{ label: string; value: string }>;
  readOnly?: boolean;
};

/**
 * Reusable child component recognized as a valid function component
 * so we can use Hooks without ESLint complaining.
 */
function InnerForm({
  isSubmitting,
  isValid,
  dirty,
  values,
  setFieldError,
  initialData,
  onCancel,
  availableBalance,
  setAvailableBalance,
  currencyOptions,
  readOnly = false,
}: InnerFormProps) {
  // Watch for changes in "accountNumber" => fetch balance
  useEffect(() => {
    if (!values.accountNumber) {
      setAvailableBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const data: AccountInfo[] = await CheckAccount(values.accountNumber);
        if (data.length > 0) {
          setAvailableBalance(data[0].availableBalance);
        } else {
          setAvailableBalance(null);
        }
      } catch (err) {
        console.error("Failed to check account =>", err);
        setFieldError("accountNumber", "فشل في جلب بيانات الحساب");
        setAvailableBalance(null);
      }
    };

    fetchBalance();
  }, [values.accountNumber, setFieldError, setAvailableBalance]);

  return (
    <Form>
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "تعديل خطاب الضمان" : "إضافة خطاب ضمان"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Account Number */}
        <FormInputIcon
          name="accountNumber"
          label="رقم الحساب"
          type="text"
          helpertext={
            availableBalance != null
              ? `الرصيد المتاح: ${availableBalance.toLocaleString()}`
              : undefined
          }
          disabled={readOnly} // <--- Disable if readOnly
        />

        {/* Date */}
        <DatePickerValue name="date" label="التاريخ" disabled={readOnly} />

        {/* Amount */}
        <FormInputIcon
          name="amount"
          label="المبلغ"
          type="number"
          disabled={readOnly} // <--- Disable if readOnly
        />

        {/* Purpose */}
        <FormInputIcon
          name="purpose"
          label="الغرض"
          type="text"
          disabled={readOnly}
        />

        {/* Additional Info */}
        <FormInputIcon
          name="additionalInfo"
          label="معلومات إضافية"
          type="text"
          disabled={readOnly}
        />

        {/* Currency */}
        <InputSelectCombo
          name="curr"
          label="العملة"
          options={currencyOptions}
          placeholder="اختر العملة"
          width="w-full"
          disabled={readOnly} // <--- Disable if readOnly
        />

        {/* Reference Number */}
        <FormInputIcon
          name="refferenceNumber"
          label="رقم المرجع"
          type="text"
          disabled={readOnly}
        />
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-center items-center gap-3">
        {/* Hide Submit if readOnly */}
        {!readOnly && (
          <SubmitButton
            title={initialData ? "حفظ التغييرات" : "إضافة"}
            color="info-dark"
            Icon={FaPaperPlane}
            isSubmitting={isSubmitting}
            disabled={!isValid || !dirty || isSubmitting}
            fullWidth={false}
          />
        )}

        <CancelButton
          onClick={onCancel}
          disabled={isSubmitting}
          fullWidth={false}
          Icon={FaTimes}
        />
      </div>
    </Form>
  );
}

/**
 * LetterOfGuaranteeForm is the main export that uses Formik
 */
export default function LetterOfGuaranteeForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
}: Props) {
  // We'll fetch real currencies from the API
  const [currencyOptions, setCurrencyOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  // We'll store the availableBalance in local state for the "accountNumber"
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  // On mount => get currencies
  useEffect(() => {
    (async () => {
      try {
        const res: CurrenciesResponse = await getCurrencies(1, 50, "", "");
        const opts = res.data.map((c) => ({
          label: c.description,
          value: c.code,
        }));
        setCurrencyOptions(opts);
      } catch (err) {
        console.error("Failed to fetch currencies:", err);
      }
    })();
  }, []);

  // Default blank form => always type="letterOfGuarantee"
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

  // Merge incoming data => ensure type is "letterOfGuarantee"
  const initialValues: TLetterOfGuarantee = initialData
    ? { ...defaultValues, ...initialData, type: "letterOfGuarantee" }
    : defaultValues;

  // Validation schema => no "type" field in user-facing form
  const validationSchema = Yup.object({
    accountNumber: Yup.string().required("حقل رقم الحساب مطلوب"),
    date: Yup.string().required("حقل التاريخ مطلوب"),
    amount: Yup.number()
      .typeError("المبلغ يجب أن يكون رقماً")
      .required("حقل المبلغ مطلوب")
      .positive("المبلغ يجب أن يكون موجبا")
      .test("check-balance", "المبلغ أكبر من الرصيد المتاح", function (value) {
        if (!value || availableBalance == null) return true;
        return value <= availableBalance;
      }),
    purpose: Yup.string().required("حقل الغرض مطلوب"),
    additionalInfo: Yup.string().nullable(),
    curr: Yup.string().required("حقل العملة مطلوب"),
    refferenceNumber: Yup.string().required("حقل رقم المرجع مطلوب"),
  });

  // onSubmit => call parent's handler
  async function handleSubmit(
    values: TLetterOfGuarantee,
    { setSubmitting, resetForm }: FormikHelpers<TLetterOfGuarantee>
  ) {
    try {
      // Final => type remains letterOfGuarantee
      const finalVals = { ...values, type: "letterOfGuarantee" };
      onSubmit(finalVals);
      resetForm();
    } catch (err) {
      console.error("Error in form submission:", err);
      alert("خطأ أثناء إرسال البيانات");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-gray-100 rounded-md p-4" dir="rtl">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <InnerForm
            {...formikProps}
            initialData={initialData}
            onCancel={onCancel}
            availableBalance={availableBalance}
            setAvailableBalance={setAvailableBalance}
            currencyOptions={currencyOptions}
            readOnly={readOnly}
          />
        )}
      </Formik>
    </div>
  );
}
