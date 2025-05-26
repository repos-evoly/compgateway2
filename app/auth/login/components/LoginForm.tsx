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
import Modal from "@/app/components/reusable/Modal";
import ForgotPasswordForm from "@/app/auth/login/components/ForgotPasswordForm";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import {
  loginHandler,
  LoginFormValues,
} from "@/app/helpers/authentication/authHandler";

export default function LoginForm(): JSX.Element {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 2FA Modal
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Company not approved modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  const router = useRouter();

  // Login form initial values and validation schema
  const initialValues: LoginFormValues = {
    login: "",
    password: "",
  };

  const validationSchema = Yup.object({
    login: Yup.string().required("البريد الإلكتروني غير صالح"),
    password: Yup.string().required("هذا الحقل مطلوب"),
  });

  // onSubmit for login form
  async function onLoginSubmit(values: LoginFormValues) {
    setLoading(true);

    await loginHandler(values, {
      router,
      onTwoFactorRequired: () => setShow2FAModal(true),
      onError: (msg) => {
        setError(msg);
      },
      onCompanyNotApproved: (status, msg) => {
        // Display a modal showing user must wait
        setModalTitle(`حالة الشركة: ${status}`);
        setModalMessage(msg);
        setModalOpen(true);
      },
    });

    setLoading(false);
  }

  // Closes the "company not approved" modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex justify-center items-center p-4 mt-6" dir="rtl">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-right">
        {/* Text above the image */}
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

        {/* Text below the image */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-700">الدخول</h2>
        </div>

        {/* Display Error Message (general login error) */}
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

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <Modal onClose={() => setShow2FAModal(false)}>
          <VerificationForm
            onClose={() => setShow2FAModal(false)}
            sourcePage="login"
          />
        </Modal>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <Modal onClose={() => setShowForgotModal(false)}>
          <ForgotPasswordForm onClose={() => setShowForgotModal(false)} />
        </Modal>
      )}

      {/* Modal for "company not approved" */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false} // since it's not approved => error style
        title={modalTitle || "حالة الشركة"}
        message={modalMessage || "الحساب غير معتمد بعد."}
        onClose={handleCloseModal}
      />
    </div>
  );
}
