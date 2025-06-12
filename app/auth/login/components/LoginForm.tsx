"use client";

import React, { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import Link from "next/link";
import { FiMail, FiEye, FiEyeOff, FiLock, FiLogIn } from "react-icons/fi";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import Image from "next/image";
import VerificationForm from "@/app/auth/login/components/VerificationForm";
import ForgotPasswordForm from "@/app/auth/login/components/ForgotPasswordForm";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import {
  loginHandler,
  LoginFormValues,
} from "@/app/helpers/authentication/authHandler";

export default function LoginForm(): JSX.Element {
  const router = useRouter();

  // Show/Hide password
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // General login error
  const [error, setError] = useState<string | null>(null);

  // Loading state for submit button
  const [loading, setLoading] = useState<boolean>(false);

  // 2FA Verification overlay
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);

  // Forgot Password overlay
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Company not approved modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  // Initial values and validation schema for login form
  const initialValues: LoginFormValues = {
    login: "",
    password: "",
  };

  const validationSchema = Yup.object({
    login: Yup.string().required("البريد الإلكتروني غير صالح"),
    password: Yup.string().required("هذا الحقل مطلوب"),
  });

  // Handle login form submission
  async function onLoginSubmit(values: LoginFormValues) {
    setLoading(true);

    await loginHandler(values, {
      router,
      onTwoFactorRequired: () => setShow2FAModal(true),
      onError: (msg) => {
        setError(msg);
      },
      onCompanyNotApproved: (status, msg) => {
        setModalTitle(`حالة الشركة: ${status}`);
        setModalMessage(msg);
        setModalOpen(true);
      },
    });

    setLoading(false);
  }

  // Close "company not approved" modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex justify-center items-center p-4 mt-6" dir="rtl">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-right">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-info-dark">
            منظومة بوابة الشركات
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

        {/* Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-700">الدخول</h2>
        </div>

        {/* General login error */}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Login Form */}
        <Form
          initialValues={initialValues}
          onSubmit={onLoginSubmit}
          validationSchema={validationSchema}
        >
          <FormInputIcon
            name="login"
            label="البريد الإلكتروني"
            type="text"
            startIcon={<FiMail />}
            textColor="text-dark"
          />

          <FormInputIcon
            name="password"
            label="كلمة المرور"
            type={showPassword ? "text" : "password"}
            startIcon={<FiLock />}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </FormInputIcon>

          {/* Forgot Password Link */}
          <div className="text-center mb-2">
            <button
              type="button"
              className="text-sm text-info-dark hover:underline focus:outline-none"
              onClick={() => setShowForgotModal(true)}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mb-6">
            <Link
              href="/auth/register"
              className="text-sm text-info-dark hover:underline"
            >
              ليس لديك حساب؟ سجل الآن
            </Link>
          </div>

          {/* Submit Button */}
          <SubmitButton
            title={loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            Icon={FiLogIn}
            color="info-dark"
          />
        </Form>
      </div>

      {/* 2FA Verification Overlay (no separate Modal component) */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className=" rounded-3xl w-full max-w-sm p-4">
            <VerificationForm
              onClose={() => setShow2FAModal(false)}
              sourcePage="login"
            />
          </div>
        </div>
      )}

      {/* Forgot Password Overlay */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-4">
            <ForgotPasswordForm onClose={() => setShowForgotModal(false)} />
          </div>
        </div>
      )}

      {/* Company not approved modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false} // not approved => use error style
        title={modalTitle || "حالة الشركة"}
        message={modalMessage || "الحساب غير معتمد بعد."}
        onClose={handleCloseModal}
      />
    </div>
  );
}
