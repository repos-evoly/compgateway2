"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FormikConfig, useField, useFormikContext } from "formik";
import { useLocale, useTranslations } from "next-intl";
import * as Yup from "yup";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import { getLyPayInstitutions } from "@/app/[locale]/transfers/lypay/services";
import type { LyPayInstitution } from "@/app/[locale]/transfers/lypay/types";
import { getOnePayInstitutions } from "@/app/[locale]/transfers/onepay/services";
import type { OnePayInstitution } from "@/app/[locale]/transfers/onepay/types";

import { createBeneficiary, updateBeneficiary } from "../services";
import type {
  BeneficiaryFormProps,
  BeneficiaryFormValues,
  BeneficiaryPaymentRail,
  BeneficiaryType,
} from "../types";

import {
  FaCreditCard,
  FaGlobe,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaUniversity,
  FaUser,
} from "react-icons/fa";

type ProviderInstitution = OnePayInstitution | LyPayInstitution;
type BeneficiaryKind = "local" | "international" | "onePay" | "lyPay";

type SelectOption = {
  value: string;
  label: string;
};

type FormikSelectProps = {
  name: string;
  label: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

function FormikSelect({
  name,
  label,
  placeholder,
  options,
  disabled = false,
  onValueChange,
}: FormikSelectProps) {
  const [field, meta, helpers] = useField<string>(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="mb-4 w-full">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={field.value ?? ""}
        disabled={disabled}
        onBlur={() => helpers.setTouched(true)}
        onChange={(event) => {
          const value = event.target.value;
          void helpers.setValue(value);
          onValueChange?.(value);
        }}
        className={`w-full rounded-md border p-2 text-black focus:outline-none focus:ring disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 ${
          hasError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && <p className="mt-1 text-sm text-red-500">{meta.error}</p>}
    </div>
  );
}

const normalizeLibyanIban = (value: string): string =>
  value.toUpperCase().replace(/[\s-]/g, "");

const isValidLibyanIban = (value: string): boolean => {
  if (!/^LY\d{23}$/.test(value)) return false;

  const rearranged = `${value.slice(4)}${value.slice(0, 4)}`;
  const numeric = rearranged.replace(/[A-Z]/g, (letter) =>
    String(letter.charCodeAt(0) - 55)
  );
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
};

type RailDestinationFieldsProps = {
  paymentRail: Exclude<BeneficiaryPaymentRail, "normal">;
  institutions: ProviderInstitution[];
  loading: boolean;
  disabled: boolean;
};

function RailDestinationFields({
  paymentRail,
  institutions,
  loading,
  disabled,
}: RailDestinationFieldsProps) {
  const t = useTranslations("beneficiaries");
  const { setFieldTouched, setFieldValue, values } =
    useFormikContext<BeneficiaryFormValues>();

  const institutionOptions = useMemo<SelectOption[]>(
    () =>
      [...institutions]
        .sort((left, right) =>
          (left.shortName || left.fullName).localeCompare(
            right.shortName || right.fullName
          )
        )
        .map((institution) => ({
          value: institution.institutionId,
          label: institution.shortName || institution.fullName,
        })),
    [institutions]
  );

  return (
    <>
      <FormikSelect
        name="institutionId"
        label={t("bank")}
        placeholder={
          loading ? t("loadingBanks") : t("selectProviderInstitution")
        }
        options={institutionOptions}
        disabled={disabled || loading}
        onValueChange={(institutionId) => {
          const institution = institutions.find(
            (candidate) => candidate.institutionId === institutionId
          );
          void setFieldValue("accountNumber", "", false);
          void setFieldTouched("accountNumber", false, false);
          void setFieldValue(
            "providerInstitutionReference",
            institution?.reference ?? "",
            false
          );
          void setFieldValue(
            "institutionName",
            institution?.shortName || institution?.fullName || "",
            false
          );
          void setFieldValue(
            "bank",
            institution?.shortName || institution?.fullName || "",
            false
          );
        }}
      />

      <FormInputIcon
        name="accountNumber"
        label={paymentRail === "lyPay" ? t("toIban") : t("accountNumber")}
        type="text"
        startIcon={<FaCreditCard />}
        disabled={disabled || !values.institutionId}
        helpertext={
          values.institutionId
            ? paymentRail === "lyPay"
              ? t("ibanPlaceholder")
              : t("accountNumberPlaceholder")
            : t("selectBankFirst")
        }
        maxLength={34}
      />
    </>
  );
}

const availableBanks = [
  "National Bank",
  "Commercial Bank",
  "Islamic Bank",
  "Central Bank",
  "Investment Bank",
  "Savings Bank",
  "Development Bank",
  "Cooperative Bank",
];

const beneficiaryKindButtonClass = (selected: boolean): string =>
  `inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/80 ${
    selected
      ? "border-white bg-white text-info-dark shadow-sm"
      : "border-transparent bg-transparent text-white hover:border-white/40 hover:bg-white/15"
  }`;

const BeneficiaryForm: React.FC<BeneficiaryFormProps> = ({
  initialData,
  viewOnly = false,
  canManageProviderRails = false,
  onSuccess,
  onBack,
}) => {
  const t = useTranslations("beneficiaries");
  const locale = useLocale();
  const initialPaymentRail = initialData?.paymentRail ?? "normal";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [selectedType, setSelectedType] = useState<BeneficiaryType>(
    initialData?.type || "local"
  );
  const [selectedRail, setSelectedRail] =
    useState<BeneficiaryPaymentRail>(initialPaymentRail);
  const [institutions, setInstitutions] = useState<ProviderInstitution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  const isEditMode = Boolean(initialData?.id);
  const type: "local" | "international" =
    selectedRail === "normal" && selectedType === "international"
      ? "international"
      : "local";

  useEffect(() => {
    let active = true;

    if (selectedRail === "normal") {
      setInstitutions([]);
      setLoadingInstitutions(false);
      return () => {
        active = false;
      };
    }

    if (viewOnly) {
      const institutionId = initialData?.institutionId;
      setInstitutions(
        institutionId
          ? [
              {
                institutionId,
                reference: initialData?.providerInstitutionReference ?? "",
                shortName:
                  initialData?.institutionName ||
                  initialData?.bank ||
                  institutionId,
                fullName:
                  initialData?.institutionName ||
                  initialData?.bank ||
                  institutionId,
              },
            ]
          : []
      );
      setLoadingInstitutions(false);
      return () => {
        active = false;
      };
    }

    const loadInstitutions = async () => {
      setLoadingInstitutions(true);
      try {
        const language = locale === "ar" ? "ar" : "en";
        const values =
          selectedRail === "onePay"
            ? await getOnePayInstitutions(language)
            : await getLyPayInstitutions(language);
        if (active) setInstitutions(values);
      } catch (error) {
        if (!active) return;
        setInstitutions([]);
        setModalTitle(t("loadBanksErrorTitle"));
        setModalMessage(
          error instanceof Error ? error.message : t("unknownError")
        );
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        if (active) setLoadingInstitutions(false);
      }
    };

    void loadInstitutions();
    return () => {
      active = false;
    };
  }, [initialData, locale, selectedRail, t, viewOnly]);

  const initialValues: BeneficiaryFormValues = useMemo(() => {
    if (selectedRail !== "normal") {
      return {
        id: initialData?.id,
        type: "local",
        paymentRail: selectedRail,
        name: initialData?.name || "",
        accountNumber: initialData?.accountNumber || "",
        bank: initialData?.bank || "",
        address: initialData?.address || "",
        country: initialData?.country || "Libya",
        institutionId: initialData?.institutionId || "",
        providerInstitutionReference:
          initialData?.providerInstitutionReference || "",
        institutionName: initialData?.institutionName || "",
        rowVersion: initialData?.rowVersion,
      };
    }

    if (type === "international") {
      return {
        id: initialData?.id,
        type: "international",
        paymentRail: "normal",
        name: initialData?.name || "",
        address: initialData?.address || "",
        country: initialData?.country || "",
        accountNumber: initialData?.accountNumber || "",
        intermediaryBankSwift: initialData?.intermediaryBankSwift || "",
        intermediaryBankName: initialData?.intermediaryBankName || "",
        rowVersion: initialData?.rowVersion,
      };
    }

    return {
      id: initialData?.id,
      type: "local",
      paymentRail: "normal",
      name: initialData?.name || "",
      accountNumber: initialData?.accountNumber || "",
      bank: initialData?.bank || "",
      amount: initialData?.amount ?? 0,
      address: initialData?.address || "",
      country: initialData?.country || "Libya",
      rowVersion: initialData?.rowVersion,
    };
  }, [initialData, selectedRail, type]);

  const validationSchema = useMemo(() => {
    const name = Yup.string()
      .required(t("nameRequired"))
      .min(2, t("nameMinLength"))
      .max(100, t("nameMaxLength"));

    if (selectedRail === "onePay") {
      return Yup.object({
        name,
        institutionId: Yup.string().trim().required(t("bankRequired")),
        accountNumber: Yup.string()
          .trim()
          .required(t("accountNumberRequired"))
          .max(34, t("accountNumberMaxLength"))
          .matches(/^[0-9A-Za-z-]+$/, t("accountNumberRailFormat")),
      });
    }

    if (selectedRail === "lyPay") {
      return Yup.object({
        name,
        institutionId: Yup.string().trim().required(t("bankRequired")),
        accountNumber: Yup.string()
          .trim()
          .required(t("ibanRequired"))
          .test("libyan-iban", t("ibanFormat"), (value) =>
            value ? isValidLibyanIban(normalizeLibyanIban(value)) : true
          )
          .test(
            "institution-matches-iban",
            t("ibanBankMismatch"),
            function (value) {
              const institutionId = String(this.parent.institutionId ?? "");
              if (!value || !institutionId) return true;
              return normalizeLibyanIban(value).slice(4, 7) === institutionId;
            }
          ),
      });
    }

    if (type === "international") {
      return Yup.object({
        name,
        address: Yup.string().required(t("addressRequired")),
        country: Yup.string().required(t("countryRequired")),
        accountNumber: Yup.string()
          .required(t("accountNumberRequired"))
          .matches(/^.+$/, t("accountNumberFormat")),
        intermediaryBankSwift: Yup.string(),
        intermediaryBankName: Yup.string(),
      });
    }

    return Yup.object({
      name,
      accountNumber: Yup.string()
        .required(t("accountNumberRequired"))
        .matches(/^[0-9A-Za-z-]+$/, t("accountNumberFormat")),
      bank: Yup.string().required(t("bankRequired")),
      amount: Yup.number()
        .typeError(t("amountFormat"))
        .min(0, t("amountMin")),
      address: Yup.string().required(t("addressRequired")),
    });
  }, [selectedRail, t, type]);

  const handleSubmit = async (values: BeneficiaryFormValues) => {
    setIsSubmitting(true);
    try {
      const language = locale === "ar" ? "ar" : "en";
      let payload: BeneficiaryFormValues = {
        ...values,
        type,
        paymentRail: selectedRail,
        language,
      };

      if (selectedRail !== "normal") {
        const institution = institutions.find(
          (candidate) => candidate.institutionId === values.institutionId
        );
        payload = {
          ...payload,
          accountNumber:
            selectedRail === "lyPay"
              ? normalizeLibyanIban(values.accountNumber)
              : values.accountNumber.trim(),
          bank:
            institution?.shortName ||
            institution?.fullName ||
            values.institutionName ||
            values.bank ||
            "",
          institutionId: institution?.institutionId ?? values.institutionId,
          providerInstitutionReference:
            institution?.reference ?? values.providerInstitutionReference,
          institutionName:
            institution?.shortName ||
            institution?.fullName ||
            values.institutionName,
        };
      }

      if (isEditMode && initialData?.id) {
        await updateBeneficiary(initialData.id, payload);
        setModalTitle(t("updateSuccessTitle"));
        setModalMessage(t("updateSuccessMsg"));
      } else {
        await createBeneficiary(payload);
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

  const selectBeneficiaryKind = (kind: BeneficiaryKind) => {
    if (kind === "onePay" || kind === "lyPay") {
      if (!canManageProviderRails) return;
      setSelectedRail(kind);
      setSelectedType("local");
      return;
    }

    setSelectedRail("normal");
    setSelectedType(kind);
  };

  return (
    <div className="p-2">
      <Form
        initialValues={initialValues}
        validationSchema={
          validationSchema as FormikConfig<BeneficiaryFormValues>["validationSchema"]
        }
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <FormHeader
          text={isEditMode ? t("editTitle") : t("addTitle")}
          showBackButton
          isEditing={false}
          onBack={() => {
            if (onBack) onBack();
            else onSuccess?.();
          }}
        >
          {!isEditMode && (
            <div
              className="ms-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2"
              aria-label={t("beneficiaryType")}
            >
              <div
                className="flex items-center gap-1 rounded-lg border border-white/30 bg-black/10 p-1"
                role="group"
                aria-label={t("bankTransferBeneficiaries")}
              >
                <span className="px-1.5 text-[11px] font-medium text-white/75">
                  {t("bankTransferBeneficiaries")}
                </span>
                <button
                  type="button"
                  aria-pressed={selectedRail === "normal" && type === "local"}
                  className={beneficiaryKindButtonClass(
                    selectedRail === "normal" && type === "local"
                  )}
                  onClick={() => selectBeneficiaryKind("local")}
                >
                  <FaUniversity aria-hidden="true" />
                  {t("local")}
                </button>
                <button
                  type="button"
                  aria-pressed={
                    selectedRail === "normal" && type === "international"
                  }
                  className={beneficiaryKindButtonClass(
                    selectedRail === "normal" && type === "international"
                  )}
                  onClick={() => selectBeneficiaryKind("international")}
                >
                  <FaGlobe aria-hidden="true" />
                  {t("international")}
                </button>
              </div>

              {canManageProviderRails && (
                <div
                  className="flex items-center gap-1 rounded-lg border border-white/30 bg-black/10 p-1"
                  role="group"
                  aria-label={t("paymentServiceBeneficiaries")}
                >
                  <span className="px-1.5 text-[11px] font-medium text-white/75">
                    {t("paymentServiceBeneficiaries")}
                  </span>
                  <button
                    type="button"
                    aria-pressed={selectedRail === "onePay"}
                    className={beneficiaryKindButtonClass(
                      selectedRail === "onePay"
                    )}
                    onClick={() => selectBeneficiaryKind("onePay")}
                  >
                    <FaCreditCard aria-hidden="true" />
                    {t("rails.onePay")}
                  </button>
                  <button
                    type="button"
                    aria-pressed={selectedRail === "lyPay"}
                    className={beneficiaryKindButtonClass(
                      selectedRail === "lyPay"
                    )}
                    onClick={() => selectBeneficiaryKind("lyPay")}
                  >
                    <FaMoneyBill aria-hidden="true" />
                    {t("rails.lyPay")}
                  </button>
                </div>
              )}
            </div>
          )}
        </FormHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormInputIcon
            name="name"
            label={t("name")}
            type="text"
            startIcon={<FaUser />}
            disabled={viewOnly || isSubmitting}
            helpertext={t("namePlaceholder")}
          />

          {selectedRail !== "normal" ? (
            <RailDestinationFields
              paymentRail={selectedRail}
              institutions={institutions}
              loading={loadingInstitutions}
              disabled={viewOnly || isSubmitting}
            />
          ) : type === "international" ? (
            <>
              <FormInputIcon
                name="address"
                label={t("address")}
                type="text"
                startIcon={<FaMapMarkerAlt />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("addressPlaceholder")}
              />
              <FormInputIcon
                name="country"
                label={t("country")}
                type="text"
                startIcon={<FaGlobe />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("countryPlaceholder")}
              />
              <FormInputIcon
                name="accountNumber"
                label={t("accountNumber")}
                type="text"
                startIcon={<FaCreditCard />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("accountNumberPlaceholder")}
              />
              <FormInputIcon
                name="intermediaryBankSwift"
                label={t("intermediaryBankSwift")}
                type="text"
                startIcon={<FaUniversity />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("intermediaryBankSwiftPlaceholder")}
              />
              <FormInputIcon
                name="intermediaryBankName"
                label={t("intermediaryBankName")}
                type="text"
                startIcon={<FaUniversity />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("intermediaryBankNamePlaceholder")}
              />
            </>
          ) : (
            <>
              <FormikSelect
                name="bank"
                label={t("bank")}
                placeholder={t("bankPlaceholder")}
                options={availableBanks.map((bank) => ({
                  value: bank,
                  label: bank,
                }))}
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
              <FormInputIcon
                name="amount"
                label={t("amount")}
                type="number"
                startIcon={<FaMoneyBill />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("amountPlaceholder")}
              />
              <FormInputIcon
                name="address"
                label={t("address")}
                type="text"
                startIcon={<FaMapMarkerAlt />}
                disabled={viewOnly || isSubmitting}
                helpertext={t("addressPlaceholder")}
              />
              <FormInputIcon
                name="country"
                label={t("country")}
                type="text"
                startIcon={<FaGlobe />}
                disabled
                helpertext="Libya"
              />
            </>
          )}
        </div>

        {!viewOnly && (
          <div className="mt-6 flex gap-4">
            <SubmitButton
              disabled={
                isSubmitting ||
                (selectedRail !== "normal" && loadingInstitutions)
              }
              title={t("submit")}
            />
          </div>
        )}
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

export default BeneficiaryForm;
