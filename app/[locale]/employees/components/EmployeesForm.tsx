"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";

import { createEmployee, updateEmployee } from "../services";
import type { EmployeeFormProps, EmployeeFormValues } from "../types";
import {
  EMPTY_BANK_ACCOUNT,
  allocationTotal,
  hasBankDestination,
  hasBcdDestination,
  hasEvoDestination,
  roundAmount,
  toAmount,
  validateAllocations,
} from "../salaryAllocationHelpers";

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

const normalizeOptionalText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeVisibleAccount = (value?: string | null): string => {
  const trimmed = value?.trim() ?? "";
  return trimmed === EMPTY_BANK_ACCOUNT ? "" : trimmed;
};

function SalaryAllocationFields({ disabled }: { disabled: boolean }) {
  const t = useTranslations("employees");
  const { values, setFieldValue } = useFormikContext<EmployeeFormValues>();

  const bankEnabled = hasBankDestination(values);
  const bcdEnabled = hasBcdDestination(values);
  const evoEnabled = hasEvoDestination(values);
  const total = allocationTotal(values);
  const salary = roundAmount(toAmount(values.salary));

  useEffect(() => {
    if (!bankEnabled && toAmount(values.accountAllocationAmount) !== 0) {
      setFieldValue("accountAllocationAmount", 0, false);
    }
    if (!bcdEnabled && toAmount(values.bcdAllocationAmount) !== 0) {
      setFieldValue("bcdAllocationAmount", 0, false);
    }
    if (!evoEnabled && toAmount(values.evoAllocationAmount) !== 0) {
      setFieldValue("evoAllocationAmount", 0, false);
    }
  }, [
    bankEnabled,
    bcdEnabled,
    evoEnabled,
    values.accountAllocationAmount,
    values.bcdAllocationAmount,
    values.evoAllocationAmount,
    setFieldValue,
  ]);

  return (
    <div className="md:col-span-2 rounded border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {t("salaryAllocations", { defaultValue: "Salary allocations" })}
        </h3>
        <span
          className={`text-sm font-medium ${
            total === salary ? "text-slate-700" : "text-red-600"
          }`}
        >
          {t("allocationTotal", { defaultValue: "Allocation total" })}:{" "}
          {total.toLocaleString()} / {salary.toLocaleString()}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FormInputIcon
          name="accountAllocationAmount"
          label={t("bankAllocation", { defaultValue: "Bank allocation" })}
          type="number"
          startIcon={<FaMoneyBill />}
          disabled={disabled || !bankEnabled}
          helpertext={
            bankEnabled
              ? t("bankAllocationHelp", {
                  defaultValue: "Amount sent to the bank account.",
                })
              : t("bankAllocationDisabled", {
                  defaultValue: "Enter a bank account to enable this split.",
                })
          }
        />
        <FormInputIcon
          name="bcdAllocationAmount"
          label={t("bcdAllocation", { defaultValue: "BCD allocation" })}
          type="number"
          startIcon={<FaMoneyBill />}
          disabled={disabled || !bcdEnabled}
          helpertext={
            bcdEnabled
              ? t("bcdAllocationHelp", {
                  defaultValue: "Amount sent to the BCD wallet.",
                })
              : t("bcdAllocationDisabled", {
                  defaultValue: "Enter a BCD wallet to enable this split.",
                })
          }
        />
        <FormInputIcon
          name="evoAllocationAmount"
          label={t("evoAllocation", { defaultValue: "Evo allocation" })}
          type="number"
          startIcon={<FaMoneyBill />}
          disabled={disabled || !evoEnabled}
          helpertext={
            evoEnabled
              ? t("evoAllocationHelp", {
                  defaultValue: "Amount sent to the Evo wallet.",
                })
              : t("evoAllocationDisabled", {
                  defaultValue: "Enter an Evo wallet to enable this split.",
                })
          }
        />
      </div>
    </div>
  );
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

  const isEditMode = Boolean(initialData?.id);

  const initialValues: EmployeeFormValues = {
    id: initialData?.id,
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    salary: initialData?.salary || 0,
    date: initialData?.date || new Date().toISOString(),
    accountNumber: normalizeVisibleAccount(initialData?.accountNumber),
    accountType: initialData?.accountType ?? "account",
    evoWallet: initialData?.evoWallet || "",
    bcdWallet: initialData?.bcdWallet || "",
    accountAllocationAmount: initialData?.accountAllocationAmount ?? 0,
    evoAllocationAmount: initialData?.evoAllocationAmount ?? 0,
    bcdAllocationAmount: initialData?.bcdAllocationAmount ?? 0,
    sendSalary: initialData?.sendSalary ?? true,
    canPost: true,
  };

  const validationSchema = Yup.object()
    .shape({
      name: Yup.string()
        .required(t("nameRequired"))
        .min(2, t("nameMinLength"))
        .max(100, t("nameMaxLength")),
      email: Yup.string()
        .trim()
        .email(
          t("emailFormat", {
            defaultValue: "Please enter a valid email address",
          })
        ),
      phone: Yup.string()
        .trim()
        .matches(/^[0-9+\-\s()]+$/, {
          message: t("phoneFormat"),
          excludeEmptyString: true,
        }),
      salary: Yup.number()
        .typeError(t("salaryFormat"))
        .moreThan(0, t("salaryMin", { defaultValue: "Salary must be greater than zero." }))
        .required(t("salaryRequired")),
      date: Yup.string().required(t("dateRequired")),
      accountNumber: Yup.string()
        .trim()
        .matches(/^\d{13}$/, {
          message: t("accountNumberFormat", {
            defaultValue: "Bank account must be 13 digits.",
          }),
          excludeEmptyString: true,
        })
        .test(
          "not-empty-placeholder",
          t("accountNumberFormat", {
            defaultValue: "Bank account must be 13 digits.",
          }),
          (value) => !value || value.trim() !== EMPTY_BANK_ACCOUNT
        ),
      evoWallet: Yup.string()
        .trim()
        .matches(/^\d{10}$/, {
          message: t("walletFormat", {
            defaultValue: "Wallet number must be 10 digits.",
          }),
          excludeEmptyString: true,
        }),
      bcdWallet: Yup.string()
        .trim()
        .matches(/^\d{10}$/, {
          message: t("walletFormat", {
            defaultValue: "Wallet number must be 10 digits.",
          }),
          excludeEmptyString: true,
        }),
      accountAllocationAmount: Yup.number()
        .typeError(t("salaryFormat"))
        .min(0, t("salaryMin")),
      evoAllocationAmount: Yup.number()
        .typeError(t("salaryFormat"))
        .min(0, t("salaryMin")),
      bcdAllocationAmount: Yup.number()
        .typeError(t("salaryFormat"))
        .min(0, t("salaryMin")),
      sendSalary: Yup.boolean().required(),
    })
    .test("valid-salary-allocations", function (values) {
      const result = validateAllocations(values as EmployeeFormValues);
      if (result.valid) return true;

      const messages = {
        missing_destination: t("salaryDestinationRequired", {
          defaultValue:
            "Enter at least one salary destination: bank account, Evo wallet, or BCD wallet.",
        }),
        missing_allocation: t("salaryAllocationRequired", {
          defaultValue: "Enter at least one salary allocation amount.",
        }),
        disabled_channel_amount: t("salaryAllocationDestinationMissing", {
          defaultValue:
            "Allocation amount cannot be entered for a missing destination.",
        }),
        total_mismatch: t("salaryAllocationTotalMismatch", {
          defaultValue: "Allocation total must equal the employee salary.",
        }),
      };

      const path =
        result.reason === "missing_destination"
          ? "accountNumber"
          : "accountAllocationAmount";

      return this.createError({
        path,
        message: messages[result.reason ?? "total_mismatch"],
      });
    });

  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    const bankAccount = normalizeVisibleAccount(values.accountNumber);
    const hasBank = hasBankDestination({ ...values, accountNumber: bankAccount });

    const payload: EmployeeFormValues = {
      ...values,
      salary: roundAmount(toAmount(values.salary)),
      email: normalizeOptionalText(values.email),
      phone: normalizeOptionalText(values.phone),
      accountNumber: hasBank ? bankAccount : EMPTY_BANK_ACCOUNT,
      accountType: hasBank ? "account" : "wallet",
      evoWallet: normalizeOptionalText(values.evoWallet),
      bcdWallet: normalizeOptionalText(values.bcdWallet),
      accountAllocationAmount: hasBank
        ? roundAmount(toAmount(values.accountAllocationAmount))
        : 0,
      bcdAllocationAmount: hasBcdDestination(values)
        ? roundAmount(toAmount(values.bcdAllocationAmount))
        : 0,
      evoAllocationAmount: hasEvoDestination(values)
        ? roundAmount(toAmount(values.evoAllocationAmount))
        : 0,
      canPost: true,
    };

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

          <FormInputIcon
            name="bcdWallet"
            label={t("bcdWallet", { defaultValue: "BCD Wallet" })}
            type="text"
            startIcon={<FaPhone />}
            disabled={isSubmitting}
            helpertext={t("bcdWalletPlaceholder", {
              defaultValue: "Enter BCD wallet number",
            })}
          />

          <FormInputIcon
            name="evoWallet"
            label={t("evoWallet", { defaultValue: "Evo Wallet" })}
            type="text"
            startIcon={<FaPhone />}
            disabled={isSubmitting}
            helpertext={t("evoWalletPlaceholder", {
              defaultValue: "Enter Evo wallet number",
            })}
          />

          <SalaryAllocationFields disabled={isSubmitting} />

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
    </div>
  );
};

export default EmployeeForm;
