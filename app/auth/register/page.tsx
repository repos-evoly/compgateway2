"use client";

import React, { useState } from "react";
import { FormikHelpers } from "formik";
import type { TKycResponse, TRegisterFields } from "./types";
import KycCodeForm from "./components/KycCodeForm";
import RegisterForm from "./components/RegisterForm";
import AuthHeader from "../components/AuthHeader";
import { FiUserPlus } from "react-icons/fi";
import { registerCompany } from "./services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

/** A single modal configuration for error only in this scenario. */
type TModalInfo = {
  isOpen: boolean;
  isSuccess: boolean;
  title: string;
  message: string;
};

export default function RegisterPage() {
  const [kycData, setKycData] = useState<TKycResponse["data"] | null>(null);

  // Modal state for errors (and/or success if needed)
  const [modalInfo, setModalInfo] = useState<TModalInfo>({
    isOpen: false,
    isSuccess: false,
    title: "",
    message: "",
  });

  // Close modal => hide
  function handleCloseModal() {
    setModalInfo({
      isOpen: false,
      isSuccess: false,
      title: "",
      message: "",
    });
  }

  // The parent's handleSubmit => moves all logic here
  async function handleRegisterSubmit(
    values: Omit<TRegisterFields, "roleId">,
    { setSubmitting, resetForm }: FormikHelpers<Omit<TRegisterFields, "roleId">>
  ) {
    try {
      // Append roleId=3
      const fullData = { ...values, roleId: 3 };

      // The service call
      const response = await registerCompany(fullData);

      if (response?.success === true) {
        // On success => reset form & redirect
        resetForm();
        // For example => /auth/register/uploadDocuments
        window.location.href = `/auth/register/uploadDocuments?companyCode=${values.companyCode}&email=${values.email}`;
      } else {
        // Otherwise => show error modal
        setModalInfo({
          isOpen: true,
          isSuccess: false,
          title: "خطأ أثناء التسجيل",
          message: "لم يتم إنشاء الحساب. الرجاء المحاولة مرة أخرى.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      // If an exception => error modal
      setModalInfo({
        isOpen: true,
        isSuccess: false,
        title: "خطأ أثناء التسجيل",
        message: "لم يتم إنشاء الحساب. الرجاء المحاولة مرة أخرى.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header on top */}
      <AuthHeader
        icon={<FiUserPlus />}
        title="التسجيل"
        subtitle="أدخل الرمز للمتابعة وإكمال عملية التسجيل"
      />

      {/* Container for the forms */}
      <div className="flex justify-center py-10">
        {kycData ? (
          // Pass the parent's handleRegisterSubmit to the form
          <RegisterForm kycData={kycData} onSubmit={handleRegisterSubmit} />
        ) : (
          <KycCodeForm onSuccess={(data) => setKycData(data)} />
        )}
      </div>

      {/* Error or success modal */}
      <ErrorOrSuccessModal
        isOpen={modalInfo.isOpen}
        isSuccess={modalInfo.isSuccess}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={handleCloseModal}
      />
    </div>
  );
}
