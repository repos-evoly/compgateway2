"use client";
import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { FormikHelpers } from "formik";
import { FiShield, FiX } from "react-icons/fi";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

type VerificationFormProps = {
  onClose: () => void;
  sourcePage?: string;
};

const VerificationForm: React.FC<VerificationFormProps> = ({
  onClose,
  sourcePage,
}) => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("auth_email");
    if (email) {
      setStoredEmail(email);
      console.log("Stored email:", email);
    }
  }, [sourcePage]);

  const initialValues = {
    code: "",
  };

  const validationSchema = Yup.object().shape({
    code: Yup.string()
      .min(6, "يجب أن يكون رمز التحقق مكونًا من 6 أرقام")
      .required("هذا الحقل مطلوب"),
  });

  const handleSubmit = async (
    values: { code: string },
    formikHelpers: FormikHelpers<{ code: string }>
  ) => {
    formikHelpers.setSubmitting(true);
    setApiError(null);

    try {
      let endpoint: string;
      if (sourcePage === "qr") {
        endpoint = `${process.env.NEXT_PUBLIC_AUTH_API}/verify-initial-2fa`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_AUTH_API}/verify-2fa`;
      }

      // Use const since payload is not reassigned
      const payload = {
        email: storedEmail,
        token: values.code.trim(),
      };

      console.log("Request details:", {
        endpoint,
        payload,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "فشل التحقق من الرمز. تأكد من صحة الرمز وحاول مرة أخرى."
        );
      }

      // If tokens are returned (i.e. verification is successful)
      if (data.accessToken && data.refreshToken) {
        Cookies.set("accessToken", data.accessToken, {
          expires: 24, // TODO: Change to 1 hour
          secure: process.env.NODE_ENV === "production",
        });
        Cookies.set("refreshToken", data.refreshToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
        });
        localStorage.removeItem("auth_email");
        onClose();
        router.push("/dashboard");
      } else {
        // For cases where tokens aren't returned, simply close the modal
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error details:", {
          message: err.message,
          storedEmail,
          sourcePage,
        });
        setApiError(err.message);
      } else {
        console.error("Unexpected error:", err);
        setApiError("An unexpected error occurred");
      }
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="w-full max-w-sm bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-info-dark">
        <h2 className="text-xl font-bold text-white m-0">إدخال رمز التحقق</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-white bg-info-dark text-white hover:bg-warning-light hover:border-transparent hover:text-info-dark transition-colors"
        >
          <FiX className="text-lg" />
        </button>
      </div>
      {/* Body */}
      <div className="p-6 text-right">
        <p className="text-sm text-gray-500 mb-6">
          يرجى إدخال رمز التحقق المكوّن من 6 أرقام لمتابعة عملية التحقق بخطوتين.
        </p>
        <Form
          initialValues={initialValues}
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
            <p className="text-red-500 text-sm text-center mt-2">{apiError}</p>
          )}
          <div className="flex justify-end mt-6">
            <SubmitButton title="تأكيد" Icon={FiShield} color="info-dark" />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VerificationForm;
