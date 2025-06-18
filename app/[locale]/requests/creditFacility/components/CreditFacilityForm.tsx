"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW
import { getCurrencies } from "@/app/[locale]/currencies/services";

import { FaPaperPlane } from "react-icons/fa";

import type { TCreditFacility } from "../types";
import type { CurrenciesResponse } from "@/app/[locale]/currencies/types";
import FormHeader from "@/app/components/reusable/FormHeader";

type Props = {
  initialData?: TCreditFacility | null;
  onSubmit: (vals: TCreditFacility) => void;
  onCancel: () => void;
  readOnly?: boolean;
};

export default function CreditFacilityForm({
  initialData,
  onSubmit,
  readOnly = false,
}: Props) {
  /* ─── Currency dropdown ─────────────────────────────────── */
  const [currencyOptions, setCurrencyOptions] = useState<
    { label: string; value: string }[]
  >([]);

  /* ─── Modal state (NEW) ─────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* ─── Fetch currencies ──────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res: CurrenciesResponse = await getCurrencies(1, 50, "", "");
        setCurrencyOptions(
          res.data.map((c) => ({ label: c.description, value: c.code }))
        );
      } catch (err) {
        console.log("Failed to fetch currencies:", err);
        setModalTitle("خطأ");
        setModalMessage("فشل في جلب العملات.");
        setModalSuccess(false);
        setModalOpen(true);
      }
    })();
  }, []);

  /* ─── Defaults & validation ─────────────────────────────── */
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

  /* ─── Submit ────────────────────────────────────────────── */
  async function handleSubmit(
    values: TCreditFacility,
    { setSubmitting }: FormikHelpers<TCreditFacility>
  ) {
    try {
      await onSubmit({ ...values, type: "creditFacility" });
      setModalTitle("تم");
      setModalMessage("تم حفظ البيانات بنجاح.");
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err) {
      setModalTitle("خطأ");
      setModalMessage(
        err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال."
      );
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── JSX ───────────────────────────────────────────────── */
  return (
    <>
      <div className="w-full bg-gray-100 rounded-md p-4" dir="rtl">
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
                <FormInputIcon
                  name="accountNumber"
                  label="رقم الحساب"
                  type="text"
                  disabled={readOnly}
                />

                <DatePickerValue
                  name="date"
                  label="التاريخ"
                  disabled={readOnly}
                />

                <FormInputIcon
                  name="amount"
                  label="المبلغ"
                  type="number"
                  disabled={readOnly}
                />

                <FormInputIcon
                  name="purpose"
                  label="الغرض"
                  type="text"
                  disabled={readOnly}
                />

                <FormInputIcon
                  name="additionalInfo"
                  label="معلومات إضافية"
                  type="text"
                  disabled={readOnly}
                />

                <InputSelectCombo
                  name="curr"
                  label="العملة"
                  options={currencyOptions}
                  placeholder="اختر العملة"
                  width="w-full"
                  disabled={readOnly}
                />

                <FormInputIcon
                  name="refferenceNumber"
                  label="رقم المرجع"
                  type="text"
                  disabled={readOnly}
                />
              </div>

              {!readOnly && (
                <div className="mt-4 flex justify-center gap-3">
                  <SubmitButton
                    title={initialData ? "حفظ التغييرات" : "إضافة"}
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

      {/* Error / Success modal (NEW) */}
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
