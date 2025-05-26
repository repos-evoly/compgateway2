"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

// Import the function that fetches currencies
import { getCurrencies } from "@/app/[locale]/currencies/services";

// Types
import type { TCreditFacility } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types"; // Adjust path if needed
import CancelButton from "@/app/components/FormUI/CancelButton";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

type Props = {
  initialData?: TCreditFacility | null; // if editing existing
  onSubmit: (vals: TCreditFacility) => void;
  onCancel: () => void;
};

export default function CreditFacilityForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
  

  // State for the currency dropdown => each item { label, value }
  const [currencyOptions, setCurrencyOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  // Fetch currencies on mount
  useEffect(() => {
    (async () => {
      try {
        // For example, get the first 50 currencies
        const res: CurrenciesResponse = await getCurrencies(1, 50, "", "");
        // Map them => { label: description, value: code }
        const opts = res.data.map((c) => ({
          label: c.description,
          value: c.code,
        }));
        setCurrencyOptions(opts);
      } catch (err) {
        console.error("Failed to fetch currencies:", err);
        // Could show a local error or fallback
      }
    })();
  }, []);

  // Default blank form
  // Notice: we always set `type: "creditFacility"` instead of letting the user edit it
  const defaultValues: TCreditFacility = {
    id: undefined,
    accountNumber: "",
    date: "",
    amount: 0,
    purpose: "",
    additionalInfo: "",
    curr: "",
    refferenceNumber: "",
    type: "creditFacility", // Hard-coded
  };

  // Merge default + incoming data
  const initialValues: TCreditFacility = initialData
    ? { ...defaultValues, ...initialData, type: "creditFacility" }
    : defaultValues;

  // Validation schema (no "type" field, because user doesn't edit it)
  const validationSchema = Yup.object({
    accountNumber: Yup.string().required("حقل رقم الحساب مطلوب"),
    date: Yup.string().required("حقل التاريخ مطلوب"),
    amount: Yup.number()
      .typeError("المبلغ يجب أن يكون رقماً")
      .required("حقل المبلغ مطلوب"),
    purpose: Yup.string().required("حقل الغرض مطلوب"),
    additionalInfo: Yup.string().nullable(),
    curr: Yup.string().required("حقل العملة مطلوب"),
    refferenceNumber: Yup.string().required("حقل رقم المرجع مطلوب"),
  });

  async function handleSubmit(
    values: TCreditFacility,
    { setSubmitting }: FormikHelpers<TCreditFacility>
  ) {
    // setIsSubmitting(true);
    try {
      // We ensure type is "creditFacility" in the final submitted values
      const finalVals = { ...values, type: "creditFacility" };
      onSubmit(finalVals);
    } catch (err) {
      console.error("Error in form submission:", err);
      alert("خطأ أثناء إرسال البيانات");
    } finally {
      setSubmitting(false);
    //   setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-gray-100 rounded-md p-4" dir="rtl">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <h2 className="text-xl font-bold mb-4">
              {initialData ? "تعديل التسهيل الائتماني" : "إضافة تسهيل ائتماني"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Account Number */}
              <FormInputIcon
                name="accountNumber"
                label="رقم الحساب"
                type="text"
              />

              {/* Date (using DatePickerValue) */}
              <DatePickerValue name="date" label="التاريخ" />

              {/* Amount */}
              <FormInputIcon name="amount" label="المبلغ" type="number" />

              {/* Purpose */}
              <FormInputIcon name="purpose" label="الغرض" type="text" />

              {/* Additional Info */}
              <FormInputIcon
                name="additionalInfo"
                label="معلومات إضافية"
                type="text"
              />

              {/* Currency => dynamic from API */}
              <InputSelectCombo
                name="curr"
                label="العملة"
                options={currencyOptions}
                placeholder="اختر العملة"
                width="w-full"
              />

              {/* Reference Number */}
              <FormInputIcon
                name="refferenceNumber"
                label="رقم المرجع"
                type="text"
              />
            </div>

            {/* Buttons */}
            <div className="mt-4 flex justify-center items-center gap-3">
              <SubmitButton
                title={initialData ? "حفظ التغييرات" : "إضافة"}
                color="info-dark"
                Icon={FaPaperPlane}
                isSubmitting={isSubmitting}
                fullWidth={false}
              />
              <CancelButton
                onClick={onCancel}
                disabled={isSubmitting}
                Icon={FaTimes}
                fullWidth={false}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
