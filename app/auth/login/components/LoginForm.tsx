"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import Link from "next/link";
import {
  FiMail,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiLock as FiLockIcon,
} from "react-icons/fi";
import Image from "next/image";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import VerificationForm from "@/app/auth/login/components/VerificationForm";
import ForgotPasswordForm from "@/app/auth/login/components/ForgotPasswordForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import {
  loginHandler,
  LoginFormValues,
} from "@/app/helpers/authentication/authHandler";

/* =========================================================
   Banner checks the **full URL** (origin + path)
   env variable: NEXT_PUBLIC_ALLOWED_URL
   ========================================================= */
/* =========================================================
   Two-line banner — text on top, URL underneath
   ========================================================= */
function URLBanner() {
  const EXPECTED_URL = process.env.NEXT_PUBLIC_ALLOWED_URL ?? "<URL_NOT_SET>";

  const [actual, setActual] = useState("…");
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const here = window.location.href; // full URL inc. path
    setActual(here);
    setOk(here === EXPECTED_URL);
  }, [EXPECTED_URL]);

  const baseClass = "mb-4 rounded-lg border px-3 py-2 text-xs font-semibold";

  const okClass = "bg-green-50 text-green-700 border-green-300";
  const badClass = "bg-red-50 text-red-700 border-red-300";

  return (
    <div dir="rtl" className={`${baseClass} ${ok ? okClass : badClass}`}>
      {/* 1️⃣ Arabic message line */}
      <div className="flex items-center gap-1">
        <FiLockIcon />
        {ok
          ? "✅ تأكد أنك على الرابط الصحيح:"
          : "⚠️ هذا الرابط غير صحيح، يجب أن يكون:"}
      </div>

      {/* 2️⃣ URL line */}
      <div dir="ltr" className="mt-1 font-bold break-all">
        {ok ? actual : EXPECTED_URL}
      </div>
    </div>
  );
}

/* ==========================
   Main LoginForm component
   ========================== */
export default function LoginForm(): JSX.Element {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const initialValues: LoginFormValues = { login: "", password: "" };

  const validationSchema = Yup.object({
    login: Yup.string().required("البريد الإلكتروني غير صالح"),
    password: Yup.string().required("هذا الحقل مطلوب"),
  });

  async function onLoginSubmit(values: LoginFormValues) {
    setLoading(true);
    await loginHandler(values, {
      router,
      onTwoFactorRequired: () => setShow2FAModal(true),
      onError: (msg) => setError(msg),
      onCompanyNotApproved: (status, msg) => {
        setModalTitle(`حالة الشركة: ${status}`);
        setModalMessage(msg);
        setModalOpen(true);
      },
    });
    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center p-4 mt-6" dir="rtl">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-right">
        {/* URL-check banner */}
        <URLBanner />

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

        {/* Error */}
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
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </FormInputIcon>

          {/* Forgot Password */}
          <div className="text-center mb-2">
            <button
              type="button"
              className="text-sm text-info-dark hover:underline focus:outline-none"
              onClick={() => setShowForgotModal(true)}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Register */}
          <div className="text-center mb-6">
            <Link
              href="/auth/register"
              className="text-sm text-info-dark hover:underline"
            >
              ليس لديك حساب؟ سجل الآن
            </Link>
          </div>

          {/* Submit */}
          <SubmitButton
            title={loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            Icon={FiLogIn}
            color="info-dark"
          />
        </Form>

        {/* Emergency contact */}
        <div className="mt-6 text-center text-gray-700 text-sm leading-relaxed">
          في حال الطوارئ، يرجى الاتصال بمركز خدمة الزبائن على:
          <br />
          <span className="font-bold text-lg">1595</span> (داخل ليبيا)
          <br />
          <span className="font-bold text-lg">
            218&nbsp;21&nbsp;366&nbsp;0451+
          </span>{" "}
          (دوليًا)
        </div>
      </div>

      {/* 2FA overlay */}
      {show2FAModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShow2FAModal(false)}
        >
          <div
            className="rounded-3xl w-full max-w-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <VerificationForm
              onClose={() => setShow2FAModal(false)}
              sourcePage="login"
            />
          </div>
        </div>
      )}

      {/* Forgot-password overlay */}
      {showForgotModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ForgotPasswordForm onClose={() => setShowForgotModal(false)} />
          </div>
        </div>
      )}

      {/* Company-status modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title={modalTitle || "حالة الشركة"}
        message={modalMessage || "الحساب غير معتمد بعد."}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
