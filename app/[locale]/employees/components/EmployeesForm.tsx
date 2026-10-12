"use client";

import React, { useEffect, useRef, useState } from "react";
import { Field, FormikConfig, useField, useFormikContext } from "formik";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import {
  FaCheckCircle,
  FaCreditCard,
  FaEdit,
  FaEnvelope,
  FaMoneyBill,
  FaPhone,
  FaUser,
  FaWallet,
} from "react-icons/fa";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";

import { createEmployee, updateEmployee } from "../services";
import {
  allocationTotal,
  normalizeDestination,
  normalizeLibyanWalletPhone,
  normalizeWalletRecipientType,
  roundSalaryAmount,
  walletRecipientLooksValid,
  type WalletRecipientType,
} from "../salaryWalletHelpers";
import type { EmployeeFormProps, EmployeeFormValues } from "../types";

type WalletFieldsProps = {
  rail: "evo" | "bcd";
  disabled: boolean;
};

type CompactFieldProps = {
  name: keyof EmployeeFormValues;
  label: string;
  type?: "text" | "number";
  inputMode?: "text" | "numeric" | "decimal" | "tel";
  icon: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  step?: string;
  title?: string;
};

function CompactField({
  name,
  label,
  type = "text",
  inputMode,
  icon,
  placeholder,
  disabled = false,
  readOnly = false,
  min,
  step,
  title,
}: CompactFieldProps) {
  const [field, meta] = useField(name);
  const showError = meta.touched && Boolean(meta.error);

  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-slate-600 lg:hidden">
        {label}
      </span>
      <span className="relative block">
        <span
          aria-hidden
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {icon}
        </span>
        <input
          {...field}
          id={String(name)}
          type={type}
          inputMode={inputMode}
          min={min}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          title={title}
          aria-label={label}
          aria-invalid={showError}
          value={field.value ?? ""}
          className={`h-10 w-full min-w-0 rounded-md border py-2 pe-3 ps-10 text-sm outline-none transition focus:ring-1 ${
            showError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          } ${
            disabled
              ? "cursor-not-allowed bg-slate-200 text-slate-500"
              : readOnly
                ? "cursor-text bg-slate-100 text-slate-700"
                : "bg-white text-slate-800"
          }`}
        />
      </span>
      {showError && (
        <span className="mt-1 block text-xs text-red-500">{meta.error}</span>
      )}
    </label>
  );
}

function WalletDestinationRow({ rail, disabled }: WalletFieldsProps) {
  const t = useTranslations("employees");
  const { values } = useFormikContext<EmployeeFormValues>();
  const isEvo = rail === "evo";
  const typeName = isEvo
    ? "evoWalletRecipientType"
    : "bcdWalletRecipientType";
  const valueName = isEvo ? "evoWallet" : "bcdWallet";
  const allocationName = isEvo
    ? "evoAllocationAmount"
    : "bcdAllocationAmount";
  const [typeField, , typeHelpers] = useField<WalletRecipientType>(typeName);
  const [destinationField, , destinationHelpers] = useField<string | null>(
    valueName
  );
  const selectedType = normalizeWalletRecipientType(
    isEvo
      ? values.evoWalletRecipientType
      : values.bcdWalletRecipientType
  );
  const derivedPhone = normalizeLibyanWalletPhone(values.phone) ?? "";

  useEffect(() => {
    if (
      selectedType === "phoneNumber" &&
      normalizeDestination(destinationField.value) !== derivedPhone
    ) {
      void destinationHelpers.setValue(derivedPhone, false);
    }
  }, [
    derivedPhone,
    destinationField.value,
    destinationHelpers,
    selectedType,
  ]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = normalizeWalletRecipientType(event.target.value);

    // A wallet ID and a phone number identify different provider recipients.
    // Never carry the previous identifier across a type change.
    void typeHelpers.setValue(nextType);
    void destinationHelpers.setValue(
      nextType === "phoneNumber" ? derivedPhone : "",
      false
    );
    void destinationHelpers.setTouched(false, false);
  };

  return (
    <div className="grid min-w-0 gap-3 border-t border-slate-200 px-3 py-3 first:border-t-0 lg:grid-cols-[9rem_minmax(10rem,0.8fr)_minmax(14rem,1.4fr)_minmax(10rem,0.7fr)] lg:items-start lg:px-4">
      <div className="flex h-10 items-center gap-2 text-sm font-semibold text-slate-800">
        <FaWallet aria-hidden />
        <span>{isEvo ? t("evoWallet") : t("bcdWallet")}</span>
      </div>
      <label className="block min-w-0">
        <span className="mb-1 block text-xs font-medium text-slate-600 lg:hidden">
          {t("walletRecipientType")}
        </span>
        <select
          {...typeField}
          id={typeName}
          disabled={disabled}
          value={selectedType}
          onChange={handleTypeChange}
          className="h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <option value="evoId">{t("walletId")}</option>
          <option value="phoneNumber">{t("walletPhoneNumber")}</option>
        </select>
      </label>
      <CompactField
        name={valueName}
        label={
          selectedType === "phoneNumber"
            ? t("walletPhoneNumber")
            : t("walletId")
        }
        inputMode={selectedType === "phoneNumber" ? "tel" : "text"}
        icon={selectedType === "phoneNumber" ? <FaPhone /> : <FaWallet />}
        disabled={disabled}
        readOnly={selectedType === "phoneNumber"}
        placeholder={
          selectedType === "phoneNumber"
            ? t("walletPhoneFromEmployeePlaceholder")
            : t("walletIdPlaceholder")
        }
        title={
          selectedType === "phoneNumber"
            ? t("walletPhoneFromEmployee")
            : undefined
        }
      />
      <CompactField
        name={allocationName}
        label={t("defaultAllocationAmount")}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.001"
        icon={<FaMoneyBill />}
        disabled={disabled}
      />
    </div>
  );
}

function FocusPhoneOnValidationError() {
  const { errors, submitCount } = useFormikContext<EmployeeFormValues>();
  const lastFocusedSubmit = useRef(0);

  useEffect(() => {
    if (
      submitCount > lastFocusedSubmit.current &&
      typeof errors.phone === "string"
    ) {
      lastFocusedSubmit.current = submitCount;
      document.getElementById("phone")?.focus();
    }
  }, [errors.phone, submitCount]);

  return null;
}

function AllocationSummary() {
  const t = useTranslations("employees");
  const { values } = useFormikContext<EmployeeFormValues>();
  const salary = roundSalaryAmount(values.salary);
  const total = allocationTotal({
    bankAccount: roundSalaryAmount(values.bankAllocationAmount),
    evoWallet: roundSalaryAmount(values.evoAllocationAmount),
    bcdWallet: roundSalaryAmount(values.bcdAllocationAmount),
  });
  const matches = total === salary;

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        matches
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <span className="font-semibold">{t("defaultAllocationTotal")}: </span>
      <span>{total.toLocaleString()} / {salary.toLocaleString()} LYD</span>
      {!matches && values.sendSalary && (
        <span className="ms-2">{t("allocationTotalMustMatchSalary")}</span>
      )}
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
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    salary: initialData?.salary ?? 0,
    date: initialData?.date ?? new Date().toISOString(),
    accountNumber: initialData?.accountNumber ?? "",
    accountType: initialData?.accountType ?? "account",
    evoWallet: initialData?.evoWallet ?? "",
    evoWalletRecipientType: normalizeWalletRecipientType(
      initialData?.evoWalletRecipientType
    ),
    bcdWallet: initialData?.bcdWallet ?? "",
    bcdWalletRecipientType: normalizeWalletRecipientType(
      initialData?.bcdWalletRecipientType
    ),
    bankAllocationAmount: roundSalaryAmount(
      initialData?.bankAllocationAmount
    ),
    evoAllocationAmount: roundSalaryAmount(
      initialData?.evoAllocationAmount
    ),
    bcdAllocationAmount: roundSalaryAmount(
      initialData?.bcdAllocationAmount
    ),
    sendSalary: initialData?.sendSalary ?? true,
    canPost: initialData?.canPost ?? true,
  };

  const walletField = (
    field: "evoWallet" | "bcdWallet",
    typeField: "evoWalletRecipientType" | "bcdWalletRecipientType"
  ) =>
    Yup.string()
      .trim()
      .nullable()
      .test("wallet-recipient-format", t("walletRecipientFormat"), function (value) {
        if (!normalizeDestination(value)) return true;
        const type = normalizeWalletRecipientType(
          this.parent[typeField] as WalletRecipientType | undefined
        );
        return walletRecipientLooksValid(value, type);
      })
      .test("wallet-recipient-type", t("walletRecipientTypeRequired"), function (value) {
        if (!normalizeDestination(value)) return true;
        return ["evoId", "phoneNumber"].includes(String(this.parent[typeField]));
      })
      .label(field);

  const allocationField = Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? 0 : value
    )
    .typeError(t("allocationAmountFormat"))
    .min(0, t("allocationAmountMin"))
    .test(
      "allocation-max-three-decimals",
      t("allocationAmountDecimals"),
      (value) =>
        value == null ||
        Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-8
    )
    .required(t("allocationAmountRequired"));

  const validationSchema = Yup.object()
    .shape({
      name: Yup.string()
        .required(t("nameRequired"))
        .min(2, t("nameMinLength"))
        .max(100, t("nameMaxLength")),
      email: Yup.string().trim().email(t("emailFormat")),
      phone: Yup.string()
        .trim()
        .matches(/^[0-9+\-\s().]+$/, {
          message: t("phoneFormat"),
          excludeEmptyString: true,
        })
        .test(
          "wallet-phone-source",
          t("walletPhoneSourceRequired"),
          function (value) {
            const formValues = this.parent as EmployeeFormValues;
            const evoNeedsPhone =
              normalizeWalletRecipientType(
                formValues.evoWalletRecipientType
              ) === "phoneNumber" &&
              roundSalaryAmount(formValues.evoAllocationAmount) > 0;
            const bcdNeedsPhone =
              normalizeWalletRecipientType(
                formValues.bcdWalletRecipientType
              ) === "phoneNumber" &&
              roundSalaryAmount(formValues.bcdAllocationAmount) > 0;

            return !evoNeedsPhone && !bcdNeedsPhone
              ? true
              : normalizeLibyanWalletPhone(value) !== null;
          }
        ),
      salary: Yup.number()
        .typeError(t("salaryFormat"))
        .min(0, t("salaryMin"))
        .when("sendSalary", {
          is: true,
          then: (schema) => schema.moreThan(0, t("salaryPositive")),
        })
        .required(t("salaryRequired")),
      date: Yup.string().required(t("dateRequired")),
      accountNumber: Yup.string().trim().matches(/^\d{13}$/, {
        message: t("accountNumberFormat"),
        excludeEmptyString: true,
      }),
      evoWalletRecipientType: Yup.string().oneOf(["evoId", "phoneNumber"]),
      bcdWalletRecipientType: Yup.string().oneOf(["evoId", "phoneNumber"]),
      evoWallet: walletField("evoWallet", "evoWalletRecipientType"),
      bcdWallet: walletField("bcdWallet", "bcdWalletRecipientType"),
      bankAllocationAmount: allocationField,
      evoAllocationAmount: allocationField,
      bcdAllocationAmount: allocationField,
      sendSalary: Yup.boolean().required(),
    })
    .test("bank-allocation-destination", t("allocationDestinationRequired", {
      channel: t("bankAccount"),
    }), function (values) {
      return roundSalaryAmount(values.bankAllocationAmount) <= 0 ||
        normalizeDestination(values.accountNumber)
        ? true
        : this.createError({
            path: "bankAllocationAmount",
            message: t("allocationDestinationRequired", {
              channel: t("bankAccount"),
            }),
          });
    })
    .test("evo-allocation-destination", t("allocationDestinationRequired", {
      channel: t("evoWallet"),
    }), function (values) {
      return roundSalaryAmount(values.evoAllocationAmount) <= 0 ||
        normalizeWalletRecipientType(values.evoWalletRecipientType) ===
          "phoneNumber" ||
        normalizeDestination(values.evoWallet)
        ? true
        : this.createError({
            path: "evoAllocationAmount",
            message: t("allocationDestinationRequired", {
              channel: t("evoWallet"),
            }),
          });
    })
    .test("bcd-allocation-destination", t("allocationDestinationRequired", {
      channel: t("bcdWallet"),
    }), function (values) {
      return roundSalaryAmount(values.bcdAllocationAmount) <= 0 ||
        normalizeWalletRecipientType(values.bcdWalletRecipientType) ===
          "phoneNumber" ||
        normalizeDestination(values.bcdWallet)
        ? true
        : this.createError({
            path: "bcdAllocationAmount",
            message: t("allocationDestinationRequired", {
              channel: t("bcdWallet"),
            }),
          });
    })
    .test("allocation-total", t("allocationTotalMustMatchSalary"), function (values) {
      if (!values.sendSalary) return true;
      const salary = roundSalaryAmount(values.salary);
      const total = allocationTotal({
        bankAccount: roundSalaryAmount(values.bankAllocationAmount),
        evoWallet: roundSalaryAmount(values.evoAllocationAmount),
        bcdWallet: roundSalaryAmount(values.bcdAllocationAmount),
      });
      return total === salary
        ? true
        : this.createError({
            path: "bankAllocationAmount",
            message: t("allocationTotalMustMatchSalary"),
          });
    });

  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    const accountNumber = normalizeDestination(values.accountNumber);
    const employeeWalletPhone = normalizeLibyanWalletPhone(values.phone);
    const evoRecipientType = normalizeWalletRecipientType(
      values.evoWalletRecipientType
    );
    const bcdRecipientType = normalizeWalletRecipientType(
      values.bcdWalletRecipientType
    );
    const evoWallet =
      evoRecipientType === "phoneNumber"
        ? employeeWalletPhone ?? ""
        : normalizeDestination(values.evoWallet);
    const bcdWallet =
      bcdRecipientType === "phoneNumber"
        ? employeeWalletPhone ?? ""
        : normalizeDestination(values.bcdWallet);
    const payload: EmployeeFormValues = {
      ...values,
      name: normalizeDestination(values.name),
      email: normalizeDestination(values.email) || null,
      phone: normalizeDestination(values.phone) || null,
      accountNumber,
      accountType: accountNumber ? "account" : "wallet",
      evoWallet: evoWallet || null,
      evoWalletRecipientType: evoWallet
        ? evoRecipientType
        : null,
      bcdWallet: bcdWallet || null,
      bcdWalletRecipientType: bcdWallet
        ? bcdRecipientType
        : null,
      bankAllocationAmount: roundSalaryAmount(values.bankAllocationAmount),
      evoAllocationAmount: roundSalaryAmount(values.evoAllocationAmount),
      bcdAllocationAmount: roundSalaryAmount(values.bcdAllocationAmount),
      canPost: values.canPost ?? true,
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
      setModalTitle(t("errorTitle"));
      setModalMessage(
        error instanceof Error ? error.message : t("unknownError")
      );
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <FocusPhoneOnValidationError />
        <FormHeader>
          <BackButton isEditing={isEditMode} fallbackPath="/employees" />
        </FormHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormInputIcon name="name" label={t("name")} type="text" startIcon={<FaUser />} disabled={isSubmitting} helpertext={t("namePlaceholder")} />
          <FormInputIcon name="email" label={t("email")} type="email" startIcon={<FaEnvelope />} disabled={isSubmitting} helpertext={t("emailPlaceholder")} />
          <FormInputIcon name="phone" label={t("phone")} type="tel" startIcon={<FaPhone />} disabled={isSubmitting} helpertext={t("phonePlaceholder")} />
          <FormInputIcon name="salary" label={t("salary")} type="number" step="0.001" startIcon={<FaMoneyBill />} disabled={isSubmitting} helpertext={t("salaryPlaceholder")} />
          <DatePickerValue name="date" label={t("date")} disabled={isSubmitting} />

          <div className="md:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              {t("salaryDestinations")}
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              {t("salaryDestinationsHelp")}
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[9rem_minmax(10rem,0.8fr)_minmax(14rem,1.4fr)_minmax(10rem,0.7fr)] gap-3 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>{t("salaryRail")}</span>
                <span>{t("walletRecipientType")}</span>
                <span>{t("salaryDestination")}</span>
                <span>{t("defaultAllocationAmount")}</span>
              </div>

              <div className="grid min-w-0 gap-3 px-3 py-3 lg:grid-cols-[9rem_minmax(10rem,0.8fr)_minmax(14rem,1.4fr)_minmax(10rem,0.7fr)] lg:items-start lg:px-4">
                <div className="flex h-10 items-center gap-2 text-sm font-semibold text-slate-800">
                  <FaCreditCard aria-hidden />
                  <span>{t("bankAccount")}</span>
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-600 lg:hidden">
                    {t("walletRecipientType")}
                  </span>
                  <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                    {t("accountNumber")}
                  </div>
                </div>
                <CompactField
                  name="accountNumber"
                  label={t("accountNumber")}
                  inputMode="numeric"
                  icon={<FaCreditCard />}
                  disabled={isSubmitting}
                  placeholder={t("accountNumberPlaceholder")}
                />
                <CompactField
                  name="bankAllocationAmount"
                  label={t("defaultAllocationAmount")}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.001"
                  icon={<FaMoneyBill />}
                  disabled={isSubmitting}
                />
              </div>

              <WalletDestinationRow rail="evo" disabled={isSubmitting} />
              <WalletDestinationRow rail="bcd" disabled={isSubmitting} />

              <div className="border-t border-slate-200 bg-slate-50 p-3">
                <AllocationSummary />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Field type="checkbox" id="sendSalary" name="sendSalary" className="me-2" disabled={isSubmitting} />
            <label htmlFor="sendSalary" className="text-sm font-medium">
              {t("sendSalary")}
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <SubmitButton disabled={isSubmitting} title={isEditMode ? t("update") : t("submit")} Icon={isEditMode ? FaEdit : FaCheckCircle} />
        </div>
      </Form>

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
};

export default EmployeeForm;
