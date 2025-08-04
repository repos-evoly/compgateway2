"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SelectWrapper from "@/app/components/FormUI/Select";
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
import { FormikConfig, Field } from "formik";

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  viewOnly = false,
  onSuccess,
  onBack,
}) => {
  const t = useTranslations("employees");

  // Available account types for dropdown
  const availableAccountTypes = [
    "Savings Account",
    "Current Account",
    "Salary Account",
    "Business Account",
    "Personal Account",
  ];

  /* -------------------------------------------------------- */
  /*                        State                             */
  /* -------------------------------------------------------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* -------------------------------------------------------- */
  /*                    Form Configuration                     */
  /* -------------------------------------------------------- */
  const isEditMode = Boolean(initialData?.id);

  const initialValues: EmployeeFormValues = {
    id: initialData?.id,
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    salary: initialData?.salary || 0,
    date: initialData?.date || new Date().toISOString(),
    accountNumber: initialData?.accountNumber || "",
    accountType: initialData?.accountType || "",
    sendSalary: initialData?.sendSalary ?? true,
    canPost: initialData?.canPost ?? true,
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("nameRequired"))
      .min(2, t("nameMinLength"))
      .max(100, t("nameMaxLength")),
    email: Yup.string().required(t("emailRequired")).email(t("emailFormat")),
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
    canPost: Yup.boolean().required(),
  });

  /* -------------------------------------------------------- */
  /*                    Form Handlers                         */
  /* -------------------------------------------------------- */
  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && initialData?.id) {
        await updateEmployee(initialData.id, values);
        setModalTitle(t("updateSuccessTitle"));
        setModalMessage(t("updateSuccessMsg"));
      } else {
        await createEmployee(values);
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

  const handleModalClose = () => {
    setModalOpen(false);
  };

  /* -------------------------------------------------------- */
  /*                       Render                             */
  /* -------------------------------------------------------- */
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
        <FormHeader
          showBackButton
          isEditing={false}
          onBack={() => {
            // Call onBack if provided, otherwise fallback to onSuccess
            if (onBack) {
              onBack();
            } else if (onSuccess) {
              onSuccess();
            }
          }}
        >
          <h2 className="text-lg font-semibold text-white">
            {isEditMode ? t("editEmployee") : t("addEmployee")}
          </h2>
        </FormHeader>

        {/* Form Fields */}
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <FormInputIcon
            name="name"
            label={t("name")}
            type="text"
            startIcon={<FaUser />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("namePlaceholder")}
          />

          <FormInputIcon
            name="email"
            label={t("email")}
            type="email"
            startIcon={<FaEnvelope />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("emailPlaceholder")}
          />

          <FormInputIcon
            name="phone"
            label={t("phone")}
            type="tel"
            startIcon={<FaPhone />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("phonePlaceholder")}
          />

          <FormInputIcon
            name="salary"
            label={t("salary")}
            type="number"
            startIcon={<FaMoneyBill />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("salaryPlaceholder")}
          />

          <DatePickerValue
            name="date"
            label={t("date")}
            disabled={viewOnly || isSubmitting}
          />

          <FormInputIcon
            name="accountNumber"
            label={t("accountNumber")}
            type="text"
            startIcon={<FaCreditCard />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("accountNumberPlaceholder")}
          />

          <SelectWrapper
            name="accountType"
            label={t("accountType")}
            options={availableAccountTypes.map((type) => ({
              value: type,
              label: type,
            }))}
            disabled={viewOnly || isSubmitting}
          />

          <div className="flex gap-4">
            <div className="flex items-center">
              <Field
                type="checkbox"
                id="sendSalary"
                name="sendSalary"
                className="mr-2"
                disabled={viewOnly || isSubmitting}
              />
              <label htmlFor="sendSalary" className="text-sm font-medium">
                {t("sendSalary")}
              </label>
            </div>

            <div className="flex items-center">
              <Field
                type="checkbox"
                id="canPost"
                name="canPost"
                className="mr-2"
                disabled={viewOnly || isSubmitting}
              />
              <label htmlFor="canPost" className="text-sm font-medium">
                {t("canPost")}
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!viewOnly && (
          <div className="flex gap-4 mt-6">
            <SubmitButton
              disabled={isSubmitting}
              title={isEditMode ? t("update") : t("submit")}
              Icon={isEditMode ? FaEdit : FaCheckCircle}
            />
          </div>
        )}
      </Form>

      {/* Error/Success Modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalClose}
      />
    </div>
  );
};

export default EmployeeForm;
