/* --------------------------------------------------------------------------
   auth/login/components/ForgotPasswordForm.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { useState, useRef, useEffect } from "react";
import * as Yup from "yup";
import {
  FiMail,
  FiEye,
  FiEyeOff,
  FiLock,
  FiKey,
  FiLogIn,
} from "react-icons/fi";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import {
  forgotPasswordHandler,
  resetPasswordHandler,
  ForgotPasswordValues,
  ResetPasswordValues,
} from "@/app/helpers/authentication/authHandler";

type ForgotPasswordFormProps = {
  onClose: () => void;
};

/* escalating resend delays (seconds) */
const RESEND_INTERVALS = [30, 60, 120] as const;

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onClose }) => {
  /* ui state */
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* flow steps */
  const [step, setStep] = useState<1 | 2>(1);
  const [userEmail, setUserEmail] = useState("");

  /* submission control */
  const [processingSubmit, setProcessingSubmit] = useState(false);
  const isSubmittingRef = useRef(false);

  /* resend-code control (step 2 only) */
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  /* start first cooldown when we enter step 2 */
  useEffect(() => {
    if (step === 2) {
      setCooldown(RESEND_INTERVALS[0]);
    }
  }, [step]);

  /* countdown timer */
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((sec) => sec - 1), 1_000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /* ----------------------------------------------------------------------
   * Validation schemas
   * -------------------------------------------------------------------- */
  const forgotInitialValues: ForgotPasswordValues = { email: "" };
  const forgotValidationSchema = Yup.object({
    email: Yup.string()
      .email("البريد الإلكتروني غير صالح")
      .required("هذا الحقل مطلوب"),
  });

  const resetInitialValues: ResetPasswordValues = {
    passwordToken: "",
    password: "",
    confirmPassword: "",
  };
  const resetValidationSchema = Yup.object({
    passwordToken: Yup.string().required("هذا الحقل مطلوب"),
    password: Yup.string().required("هذا الحقل مطلوب"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "كلمة المرور غير متطابقة")
      .required("هذا الحقل مطلوب"),
  });

  /* ----------------------------------------------------------------------
   * Handlers
   * -------------------------------------------------------------------- */
  const onForgotPasswordSubmit = async (values: ForgotPasswordValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setProcessingSubmit(true);
    setLoading(true);

    try {
      await forgotPasswordHandler(values, {
        onSuccess: () => {
          setUserEmail(values.email);
          setStep(2);
          setResendCount(0);
          setCooldown(RESEND_INTERVALS[0]);
        },
        onError: (msg) => alert(msg),
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProcessingSubmit(false);
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  const onResetPasswordSubmit = async (values: ResetPasswordValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setProcessingSubmit(true);
    setLoading(true);

    try {
      await resetPasswordHandler(values, {
        onSuccess: () => onClose(),
        onError: (msg) => alert(msg),
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProcessingSubmit(false);
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || resendCount >= RESEND_INTERVALS.length) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setProcessingSubmit(true);
    setLoading(true);

    try {
      await forgotPasswordHandler(
        { email: userEmail },
        {
          onSuccess: () => {
            const nextCount = resendCount + 1;
            setResendCount(nextCount);
            const nextDelay =
              RESEND_INTERVALS[
                Math.min(nextCount, RESEND_INTERVALS.length - 1)
              ];
            setCooldown(nextDelay);
          },
          onError: (msg) => alert(msg),
        }
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProcessingSubmit(false);
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  /* ----------------------------------------------------------------------
   * Render
   * -------------------------------------------------------------------- */
  if (step === 1) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold text-center mb-4">
          إعادة تعيين كلمة المرور
        </h2>
        <p className="text-gray-500 text-center mb-6">
          أدخل بريدك الإلكتروني وسنرسل إليك رمز إعادة التعيين
        </p>
        <Form
          initialValues={forgotInitialValues}
          onSubmit={onForgotPasswordSubmit}
          validationSchema={forgotValidationSchema}
          key="forgot-form"
        >
          <FormInputIcon
            name="email"
            label="البريد الإلكتروني"
            type="email"
            startIcon={<FiMail />}
            textColor="text-dark"
          />
          <SubmitButton
            title={loading ? "جارٍ الإرسال..." : "إرسال"}
            Icon={FiLogIn}
            color="info-dark"
            fullWidth
            disabled={loading || processingSubmit}
          />
        </Form>
      </div>
    );
  }

  /* ----------------------------- Step 2 ------------------------------- */
  const resendDisabled =
    cooldown > 0 ||
    resendCount >= RESEND_INTERVALS.length ||
    loading ||
    processingSubmit;

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-center mb-4">
        تغيير كلمة المرور
      </h2>
      <p className="text-gray-500 text-center mb-4">
        تم إرسال رمز إعادة التعيين إلى {userEmail}
      </p>

      {/* Resend code link / timer */}
      <div className="text-center mb-6">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendDisabled}
          className="text-sm text-info-dark hover:underline disabled:opacity-50 disabled:hover:no-underline"
        >
          {resendDisabled
            ? `يمكن الإعادة بعد ${cooldown} ث`
            : "إعادة إرسال الرمز"}
        </button>
      </div>

      <Form
        initialValues={resetInitialValues}
        onSubmit={onResetPasswordSubmit}
        validationSchema={resetValidationSchema}
        key="reset-form"
        enableReinitialize={false}
      >
        <FormInputIcon
          name="passwordToken"
          label="رمز إعادة التعيين"
          type="text"
          startIcon={<FiKey />}
          textColor="text-dark"
        />
        <FormInputIcon
          name="password"
          label="كلمة المرور الجديدة"
          type={showNewPassword ? "text" : "password"}
          startIcon={<FiLock />}
          onClick={() => setShowNewPassword((prev) => !prev)}
          textColor="text-dark"
        >
          {showNewPassword ? <FiEyeOff /> : <FiEye />}
        </FormInputIcon>
        <FormInputIcon
          name="confirmPassword"
          label="تأكيد كلمة المرور"
          type={showConfirmPassword ? "text" : "password"}
          startIcon={<FiLock />}
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          textColor="text-dark"
        >
          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        </FormInputIcon>
        <SubmitButton
          title={loading ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
          Icon={FiLogIn}
          color="info-dark"
          fullWidth
          disabled={loading || processingSubmit}
        />
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
