"use client";

import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { FormikHelpers } from "formik";
import { FiShield, FiX } from "react-icons/fi";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { getUserById } from "@/app/helpers/authentication/getUserById";
import { parseJwt } from "@/app/helpers/tokenHandler";
import { loginRoutingHandler } from "@/app/helpers/authentication/authHandler";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

type VerificationFormProps = {
  onClose: () => void;
  sourcePage?: string;
};

export default function VerificationForm({
  onClose,
  sourcePage,
}: VerificationFormProps) {
  const router = useRouter();

  /* ----------------------- Local state ----------------------- */
  const [apiError, setApiError] = useState<string | null>(null);
  const [storedlogin, setStoredlogin] = useState<string | null>(null);

  /* Modal for company-status fallback */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* Synchronous flag so we know whether fallback ran */
  const fallbackTriggered = useRef(false);

  /* -------------------- Side-effects -------------------- */
  useEffect(() => {
    const login = localStorage.getItem("auth_login");
    if (login) setStoredlogin(login);
  }, [sourcePage]);

  /* -------------------- Validation -------------------- */
  const validationSchema = Yup.object().shape({
    code: Yup.string()
      .trim()
      .length(6, "يجب أن يكون رمز التحقق مكونًا من 6 أرقام")
      .required("هذا الحقل مطلوب"),
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (
    values: { code: string },
    helpers: FormikHelpers<{ code: string }>
  ) => {
    helpers.setSubmitting(true);
    setApiError(null);

    try {
      const endpoint =
        sourcePage === "qr"
          ? `${process.env.NEXT_PUBLIC_AUTH_API}/verify-initial-2fa`
          : `${process.env.NEXT_PUBLIC_AUTH_API}/verify-2fa`;

      const payload = {
        login: storedlogin,
        token: values.code.trim(),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل التحقق من الرمز. تأكد من صحة الرمز وحاول مرة أخرى."
        );
      }

      if (!data.accessToken || !data.refreshToken) {
        onClose(); // nothing else to do
        return;
      }

      /* Store tokens */
      Cookies.set("accessToken", data.accessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
      });
      Cookies.set("refreshToken", data.refreshToken, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
      });

      /* Remove saved login */
      localStorage.removeItem("auth_login");

      /* Optional: fetch user if needed */
      const parsed = parseJwt(data.accessToken);
      if (!parsed?.nameid) throw new Error("Invalid access token.");
      await getUserById(Number(parsed.nameid));

      /* Shared post-login routing */
      await loginRoutingHandler(
        data.accessToken,
        data.refreshToken,
        data.kycToken || "",
        router,
        (status, msg) => {
          fallbackTriggered.current = true;
          setModalTitle(`حالة الشركة: ${status}`);
          setModalMessage(msg);
          setModalOpen(true);
        }
      );

      /* Close the 2FA overlay only if fallback didn’t show */
      if (!fallbackTriggered.current) onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      helpers.setSubmitting(false);
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <>
      <div
        dir="rtl"
        className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 bg-info-dark">
          <h2 className="text-xl font-bold text-white m-0">إدخال رمز التحقق</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white bg-info-dark text-white hover:bg-warning-light hover:text-info-dark transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-6 text-right">
          <p className="text-sm text-gray-500 mb-6">
            يرجى إدخال رمز التحقق المكوّن من 6 أرقام لمتابعة عملية التحقق
            بخطوتين.
          </p>

          <Form
            initialValues={{ code: "" }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            <FormInputIcon
              name="code"
              label="رمز التحقق"
              type="text"
              startIcon={<FiShield />}
              textColor="text-dark"
            />

            {apiError && (
              <p className="text-red-500 text-sm text-center mt-2">
                {apiError}
              </p>
            )}

            <div className="flex justify-end mt-6">
              <SubmitButton title="تأكيد" Icon={FiShield} color="info-dark" />
            </div>
          </Form>
        </div>
      </div>

      {modalOpen && (
        <ErrorOrSuccessModal
          isOpen={modalOpen}
          isSuccess={false}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
