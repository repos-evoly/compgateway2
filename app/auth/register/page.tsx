// app/auth/register/page.tsx
"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import type { FormikHelpers } from "formik";
import type { TKycResponse, TRegisterFields } from "./types";
import KycCodeForm from "./components/KycCodeForm";
import RegisterForm from "./components/RegisterForm";
import AuthHeader from "../components/AuthHeader";
import { FiUserPlus } from "react-icons/fi";
import { registerCompany } from "./services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

type TModalInfo = {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
};

export default function RegisterPage() {
  const [kycData, setKycData] = useState<TKycResponse["data"] | null>(null);

  const [modalInfo, setModalInfo] = useState<TModalInfo>({
    isOpen: false,
    isSuccess: false,
    title: "",
    message: "",
  });

  function handleCloseModal() {
    setModalInfo({
      isOpen: false,
      isSuccess: false,
      title: "",
      message: "",
    });
  }

  function resolveFallbackArabicMessage(): string {
    return "لم يتم إنشاء الحساب. الرجاء المحاولة مرة أخرى.";
  }

  async function handleRegisterSubmit(
    values: Omit<TRegisterFields, "roleId">,
    { setSubmitting, resetForm }: FormikHelpers<Omit<TRegisterFields, "roleId">>
  ) {
    try {
      const fullData = { ...values, roleId: 3 };
      const response = await registerCompany(fullData);

      if (response?.success === true) {
        resetForm();
        window.location.href = `/auth/register/uploadDocuments?companyCode=${values.companyCode}&email=${values.email}`;
      } else {
        const apiMsg =
          typeof response?.message === "string" &&
          response.message.trim().length > 0
            ? response.message
            : resolveFallbackArabicMessage();

        setModalInfo({
          isOpen: true,
          isSuccess: false,
          title: "خطأ أثناء التسجيل",
          message: apiMsg,
        });
      }
    } catch (error) {
      const errMsg =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : resolveFallbackArabicMessage();

      setModalInfo({
        isOpen: true,
        isSuccess: false,
        title: "خطأ أثناء التسجيل",
        message: errMsg,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <AuthHeader
        icon={<FiUserPlus />}
        title="التسجيل"
        subtitle="أدخل الرمز للمتابعة وإكمال عملية التسجيل"
      />

      <div className="flex justify-center py-10">
        {kycData ? (
          <RegisterForm kycData={kycData} onSubmit={handleRegisterSubmit} />
        ) : (
          <KycCodeForm onSuccess={(data) => setKycData(data)} />
        )}
      </div>

      <ErrorOrSuccessModal
        isOpen={modalInfo.isOpen}
        isSuccess={modalInfo.isSuccess}
        title="خطأ أثناء التسجيل"
        message={modalInfo.message}
        onClose={handleCloseModal}
      />
    </div>
  );
}
