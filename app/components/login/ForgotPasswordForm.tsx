"use client";
import React, { useState, useRef } from "react";
import * as Yup from "yup";
import {
  FiMail,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiKey,
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

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onClose }) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [processingSubmit, setProcessingSubmit] = useState(false);
  const isSubmittingRef = useRef(false);

  console.log(processingSubmit);

  // Forgot password step 1: initial values and validation
  const forgotInitialValues: ForgotPasswordValues = {
    email: "",
  };

  const forgotValidationSchema = Yup.object({
    email: Yup.string()
      .email("البريد الإلكتروني غير صالح")
      .required("هذا الحقل مطلوب"),
  });

  // Reset password step 2: initial values and validation
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

  // onSubmit for forgot password form with debounce to prevent double submission
  const onForgotPasswordSubmit = async (values: ForgotPasswordValues) => {
    // Use ref to prevent double submission (more reliable than state)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setProcessingSubmit(true);
    setLoading(true);

    try {
      // Store email for display in step 2
      const emailToStore = values.email;

      await forgotPasswordHandler(values, {
        onSuccess: () => {
          // Only update stored email if successful
          setUserEmail(emailToStore);
          // Move to reset password step
          setStep(2);
        },
        onError: (msg) => alert(msg),
      });
    } finally {
      setLoading(false);
      // Reset processing flag with a delay to prevent any potential race conditions
      setTimeout(() => {
        setProcessingSubmit(false);
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  // onSubmit for reset password form
  const onResetPasswordSubmit = async (values: ResetPasswordValues) => {
    // Use ref to prevent double submission
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setProcessingSubmit(true);
    setLoading(true);

    try {
      await resetPasswordHandler(values, {
        onSuccess: () => {
          onClose(); // Close the modal on success
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

  // Render step 1: Email input
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
            fullWidth={true}
          />
        </Form>
      </div>
    );
  }

  // Render step 2: Password reset form
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-center mb-4">
        تغيير كلمة المرور
      </h2>
      <p className="text-gray-500 text-center mb-6">
        تم إرسال رمز إعادة التعيين إلى {userEmail}
      </p>
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
          fullWidth={true}
        />
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
