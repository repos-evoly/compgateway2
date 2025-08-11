"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";

import { createEmployee, updateEmployee } from "../services";
import type { EmployeeFormProps, EmployeeFormValues } from "../types";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMoneyBill,
  FaCreditCard,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";
import { Field, FormikConfig, useFormikContext } from "formik";
import BackButton from "@/app/components/reusable/BackButton";

/* Guard that prevents choosing the unavailable "wallet" option */
type AccountTypeGuardProps = {
  onChooseWallet: () => void;
  initialAccountType: string;
};
function AccountTypeGuard({
  onChooseWallet,
  initialAccountType,
}: AccountTypeGuardProps) {
  const { values, setFieldValue } = useFormikContext<EmployeeFormValues>();
  const prevRef = useRef<string>(initialAccountType);

  useEffect(() => {
    if (values.accountType === "wallet") {
      onChooseWallet();
      const fallback = prevRef.current || "";
      setFieldValue("accountType", fallback, false);
    } else {
      prevRef.current = values.accountType ?? "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.accountType]);

  return null;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const t = useTranslations("employees");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const isEditMode = Boolean(initialData?.id);

  /* Ensure wallet is never preselected: sanitize initial value */
  const sanitizedAccountType: string =
    initialData?.accountType === "wallet" ? "" : initialData?.accountType ?? "";

  const initialValues: EmployeeFormValues = {
    id: initialData?.id,
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    salary: initialData?.salary || 0,
    date: initialData?.date || new Date().toISOString(),
    accountNumber: initialData?.accountNumber || "",
    accountType: sanitizedAccountType, // empty if it was "wallet"
    sendSalary: initialData?.sendSalary ?? true,
    canPost: true,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("nameRequired"))
      .min(2, t("nameMinLength"))
      .max(100, t("nameMaxLength")),
    email: Yup.string(),
    phone: Yup.string()
      .required(t("phoneRequired"))
      .matches(/^[0-9+\-\s()]+$/, t("phoneFormat")),
    salary: Yup.number()
      .typeError(t("salaryFormat"))
      .min(0, t("salaryMin"))
      .required(t("salaryRequired")),
    date: Yup.string().required(t("dateRequired")),
    accountNumber: Yup.string()
      .required(t("accountNumberRequired"))
      .matches(/^[0-9A-Za-z\-]+$/, t("accountNumberFormat")),
    accountType: Yup.string().required(t("accountTypeRequired")),
    sendSalary: Yup.boolean().required(),
  });

  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    const payload: EmployeeFormValues = { ...values, canPost: true };

    try {
      if (isEditMode && initialData?.id) {
        await updateEmployee(initialData.id, payload);
        setModalTitle(t("updateSuccessTitle"));
        setModalMessage(t("updateSuccessMsg"));
      } else {
        await createEmployee(payload);
        setModalTitle(t("createSuccessTitle"));
        setModalMessage(t("createSuccessMsg"));
      }
      setModalSuccess(true);
      setModalOpen(true);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unknownError");
      setModalTitle(t("errorTitle"));
      setModalMessage(errorMessage);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => setModalOpen(false);

  const accountTypeOptions: readonly InputSelectComboOption[] = [
    { value: "account", label: "account" },
    { value: "wallet", label: "wallet", disabled: true }, // ⬅️ disabled
  ];

  return (
    <div className="p-2">
      <Form
        initialValues={initialValues}
        validationSchema={
          validationSchema as FormikConfig<EmployeeFormValues>["validationSchema"]
        }
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <AccountTypeGuard
          initialAccountType={sanitizedAccountType}
          onChooseWallet={() => setWalletModalOpen(true)}
        />

        <FormHeader>
          <BackButton isEditing={isEditMode} fallbackPath="/employees" />
        </FormHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <FormInputIcon
            name="name"
            label={t("name")}
            type="text"
            startIcon={<FaUser />}
            disabled={isSubmitting}
            helpertext={t("namePlaceholder")}
          />

          <FormInputIcon
            name="email"
            label={t("email")}
            type="email"
            startIcon={<FaEnvelope />}
            disabled={isSubmitting}
            helpertext={t("emailPlaceholder")}
          />

          <FormInputIcon
            name="phone"
            label={t("phone")}
            type="tel"
            startIcon={<FaPhone />}
            disabled={isSubmitting}
            helpertext={t("phonePlaceholder")}
          />

          <FormInputIcon
            name="salary"
            label={t("salary")}
            type="number"
            startIcon={<FaMoneyBill />}
            disabled={isSubmitting}
            helpertext={t("salaryPlaceholder")}
          />

          <DatePickerValue
            name="date"
            label={t("date")}
            disabled={isSubmitting}
          />

          <FormInputIcon
            name="accountNumber"
            label={t("accountNumber")}
            type="text"
            startIcon={<FaCreditCard />}
            disabled={isSubmitting}
            helpertext={t("accountNumberPlaceholder")}
          />

          <InputSelectCombo
            name="accountType"
            label={t("accountType")}
            options={accountTypeOptions as InputSelectComboOption[]}
            placeholder=""
            disabled={isSubmitting}
            onDisabledOptionAttempt={(opt) => {
              if (opt.value === "wallet") setWalletModalOpen(true);
            }}
            clearIfDisabledSelected
          />

          <div className="flex items-center">
            <Field
              type="checkbox"
              id="sendSalary"
              name="sendSalary"
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="sendSalary" className="text-sm font-medium">
              {t("sendSalary")}
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <SubmitButton
            disabled={isSubmitting}
            title={isEditMode ? t("update") : t("submit")}
            Icon={isEditMode ? FaEdit : FaCheckCircle}
          />
        </div>
      </Form>

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalClose}
      />

      <ErrorOrSuccessModal
        isOpen={walletModalOpen}
        isSuccess={false}
        title="Wallet not available"
        message="The wallet account type is currently not available. You can't choose it right now. It will be available soon."
        onClose={() => setWalletModalOpen(false)}
        onConfirm={() => setWalletModalOpen(false)}
      />
    </div>
  );
};

export default EmployeeForm;
