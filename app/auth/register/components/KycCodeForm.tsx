"use client";

import React, { useState } from "react";
import * as Yup from "yup";
import { FiKey, FiCheck } from "react-icons/fi";
import Image from "next/image";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

import { getKycByCode } from "../services";
import type { TKycResponse } from "../types";

type TRegisterFormValues = {
  code: string;
};

type KycCodeFormProps = {
  onSuccess: (kycData: TKycResponse["data"]) => void;
};

export default function KycCodeForm({ onSuccess }: KycCodeFormProps) {
  const [error, setError] = useState<string | null>(null);

  const initialValues: TRegisterFormValues = { code: "" };

  const validationSchema = Yup.object({
    code: Yup.string().required("الرمز مطلوب"),
  });

  async function handleSubmit(values: TRegisterFormValues) {
    try {
      setError(null);
      const response = await getKycByCode(values.code);

      if (!response.hasKyc) {
        setError("لا يوجد بيانات KYC لهذا الرمز.");
        return;
      }
      onSuccess(response.data);
    } catch (err) {
      console.error("Error verifying KYC code:", err);
      setError("حدث خطأ أثناء التحقق من الرمز.");
    }
  }

  return (
    <div
      className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 text-right"
      dir="rtl"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-info-dark">
          الوحدة الفرعية للمعلومات المالية
        </h1>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="/images/logo-trans.png"
          alt="الشعار"
          width={80}
          height={80}
          className="w-auto h-20"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-700">التسجيل</h2>
      </div>

      {/* Error Display */}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* KYC Code Form */}
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <FormInputIcon
          name="code"
          label="معرف الشركة ( 6 أرقام )"
          type="text"
          startIcon={<FiKey />}
          textColor="text-dark"
        />

        <SubmitButton title="إرسال الرمز" Icon={FiCheck} color="info-dark" />
      </Form>
    </div>
  );
}
