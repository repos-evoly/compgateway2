"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Formik, useField } from "formik";
import * as Yup from "yup";
import { useLocale, useTranslations } from "next-intl";
import { FiLoader } from "react-icons/fi";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import BackButton from "@/app/components/reusable/BackButton";
import { getBeneficiariesForRail } from "@/app/[locale]/beneficiaries/services";
import type { BeneficiaryResponse } from "@/app/[locale]/beneficiaries/types";

import {
  createOnePayTransfer,
  getOnePayAccounts,
  getOnePayInstitutions,
  validateOnePayTransfer,
} from "../services";
import type {
  OnePayAccount,
  OnePayDeviceInfo,
  OnePayFormValues,
  OnePayInstitution,
  OnePayTransfer,
  OnePayValidationResponse,
} from "../types";
import VerifiedRecipientModal from "./VerifiedRecipientModal";

type OnePayFormProps = {
  onCreated: (transfer: OnePayTransfer) => void;
};

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
  emptyOptionLabel?: string;
};

function FormikSelect({
  name,
  label,
  placeholder,
  options,
  disabled = false,
  onValueChange,
  emptyOptionLabel,
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
          helpers.setValue(value);
          onValueChange?.(value);
        }}
        className={`w-full rounded-md border p-2 text-black focus:outline-none focus:ring disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 ${
          hasError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        <option value="" disabled={!emptyOptionLabel}>
          {emptyOptionLabel ?? placeholder}
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

type FormikRecipientInputProps = {
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

function FormikRecipientInput({
  name,
  label,
  placeholder,
  disabled = false,
  onValueChange,
}: FormikRecipientInputProps) {
  const [field, meta, helpers] = useField<string>(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className="mb-4 w-full">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={field.value ?? ""}
        disabled={disabled}
        autoComplete="off"
        maxLength={34}
        placeholder={placeholder}
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
      />
      {hasError && <p className="mt-1 text-sm text-red-500">{meta.error}</p>}
    </div>
  );
}

const getOptionalLocation = (): Promise<OnePayDeviceInfo | undefined> => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          deviceLat: position.coords.latitude.toFixed(6),
          deviceLon: position.coords.longitude.toFixed(6),
        });
      },
      () => resolve(undefined),
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 3500,
      }
    );
  });
};

export default function OnePayForm({ onCreated }: OnePayFormProps) {
  const t = useTranslations("onePayTransfer");
  const locale = useLocale();

  const [accounts, setAccounts] = useState<OnePayAccount[]>([]);
  const [institutions, setInstitutions] = useState<OnePayInstitution[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResponse[]>([]);
  const [beneficiariesUnavailable, setBeneficiariesUnavailable] =
    useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [validation, setValidation] =
    useState<OnePayValidationResponse | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorOpen(true);
  };

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [accountValues, institutionValues, beneficiaryResult] =
          await Promise.all([
            getOnePayAccounts(),
            getOnePayInstitutions(locale === "ar" ? "ar" : "en"),
            getBeneficiariesForRail("onePay")
              .then((values) => ({ values, failed: false }))
              .catch(() => ({
                values: [] as BeneficiaryResponse[],
                failed: true,
              })),
          ]);
        if (!active) return;
        setAccounts(accountValues);
        setInstitutions(institutionValues);
        setBeneficiaries(beneficiaryResult.values);
        setBeneficiariesUnavailable(beneficiaryResult.failed);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : t("errors.unknown");
        showError(t("errors.loadOptionsTitle"), message);
      } finally {
        if (active) setLoadingOptions(false);
      }
    };

    void loadOptions();
    return () => {
      active = false;
    };
  }, [locale, t]);

  const accountOptions = useMemo<SelectOption[]>(
    () =>
      [...accounts]
        .sort((left, right) =>
          left.accountNumber.localeCompare(right.accountNumber)
        )
        .map((account) => ({
          value: account.accountNumber,
          label: `${account.accountNumber} - ${account.accountName} (${account.currency})`,
        })),
    [accounts]
  );

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

  const resolveBeneficiaryInstitution = useCallback(
    (beneficiary: BeneficiaryResponse): OnePayInstitution | undefined =>
      institutions.find(
        (institution) => institution.institutionId === beneficiary.institutionId
      ),
    [institutions]
  );

  const beneficiaryOptions = useMemo<SelectOption[]>(
    () =>
      beneficiaries
        .filter(
          (beneficiary) =>
            beneficiary.paymentRail === "onePay" &&
            Boolean(resolveBeneficiaryInstitution(beneficiary))
        )
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((beneficiary) => ({
          value: String(beneficiary.id),
          label: `${beneficiary.name} - ${beneficiary.accountNumber}`,
        })),
    [beneficiaries, resolveBeneficiaryInstitution]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        fromAccount: Yup.string().trim().required(t("validation.fromRequired")),
        toInstitutionId: Yup.string()
          .trim()
          .required(t("validation.bankRequired")),
        toAccount: Yup.string().trim().required(t("validation.toRequired")),
        amount: Yup.number()
          .typeError(t("validation.amountNumber"))
          .required(t("validation.amountRequired"))
          .moreThan(0, t("validation.amountPositive"))
          .test(
            "maximum-four-decimals",
            t("validation.amountPrecision"),
            (value) =>
              value === undefined ||
              Math.abs(value * 10000 - Math.round(value * 10000)) < 1e-8
          ),
        description: Yup.string()
          .trim()
          .required(t("validation.narrativeRequired")),
      }),
    [t]
  );

  const initialValues: OnePayFormValues = {
    beneficiaryId: "",
    fromAccount: "",
    toInstitutionId: "",
    toAccount: "",
    amount: "",
    description: "",
  };

  const validateTransfer = async (values: OnePayFormValues) => {
    if (isValidating) return;
    setIsValidating(true);
    try {
      const deviceInfo = await getOptionalLocation();
      const result = await validateOnePayTransfer({
        ...(values.beneficiaryId
          ? { beneficiaryId: Number(values.beneficiaryId) }
          : {}),
        fromAccount: values.fromAccount,
        toInstitutionId: values.toInstitutionId,
        toAccount: values.toAccount.trim(),
        amount: Number(values.amount),
        description: values.description.trim(),
        language: locale === "ar" ? "ar" : "en",
        ...(deviceInfo ? { deviceInfo } : {}),
      });
      setValidation(result);
      setValidationModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("errors.unknown");
      showError(t("errors.validationTitle"), message);
    } finally {
      setIsValidating(false);
    }
  };

  const createTransfer = async () => {
    if (!validation || isCreating) return;
    setIsCreating(true);
    try {
      const transfer = await createOnePayTransfer({
        validationToken: validation.validationToken,
      });
      setValidationModalOpen(false);
      onCreated(transfer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("errors.unknown");
      showError(t("errors.createTitle"), message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-center gap-3 rounded-md bg-info-dark p-4 text-white">
        <BackButton fallbackPath="/transfers/onepay" isEditing />
        <div>
          <h1 className="text-lg font-bold">{t("form.title")}</h1>
          <p className="text-sm text-white/80">{t("form.subtitle")}</p>
        </div>
      </div>

      <Formik<OnePayFormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={validateTransfer}
      >
        {({ values, setFieldValue, setFieldTouched }) => {
          const selectedAccount = accounts.find(
            (account) => account.accountNumber === values.fromAccount
          );

          const applyBeneficiary = async (beneficiaryId: string) => {
            await setFieldValue("beneficiaryId", beneficiaryId, false);
            if (!beneficiaryId) {
              await setFieldValue("toInstitutionId", "", false);
              await setFieldTouched("toInstitutionId", false, false);
              await setFieldValue("toAccount", "", false);
              await setFieldTouched("toAccount", false, false);
              return;
            }

            const beneficiary = beneficiaries.find(
              (candidate) => candidate.id === Number(beneficiaryId)
            );
            if (!beneficiary) return;
            const institution = resolveBeneficiaryInstitution(beneficiary);
            if (!institution) return;

            // Preserve bank-before-account ordering for dependent validation.
            await setFieldValue(
              "toInstitutionId",
              institution.institutionId,
              false
            );
            await setFieldTouched("toInstitutionId", false, false);
            await setFieldValue("toAccount", beneficiary.accountNumber, false);
            await setFieldTouched("toAccount", false, false);
          };

          return (
            <Form className="mt-6">
              <div className="grid gap-x-5 md:grid-cols-2 xl:grid-cols-4">
                <FormikSelect
                  name="fromAccount"
                  label={t("fields.fromAccount")}
                  placeholder={
                    loadingOptions
                      ? t("form.loadingAccounts")
                      : t("form.selectFromAccount")
                  }
                  options={accountOptions}
                  disabled={loadingOptions || isValidating || isCreating}
                />

                <FormikSelect
                  name="beneficiaryId"
                  label={t("fields.savedBeneficiary")}
                  placeholder={t("form.manualEntry")}
                  emptyOptionLabel={t("form.manualEntry")}
                  options={beneficiaryOptions}
                  disabled={loadingOptions || isValidating || isCreating}
                  onValueChange={(beneficiaryId) => {
                    void applyBeneficiary(beneficiaryId);
                  }}
                />

                <FormikSelect
                  name="toInstitutionId"
                  label={t("fields.toBank")}
                  placeholder={
                    loadingOptions
                      ? t("form.loadingBanks")
                      : t("form.selectBank")
                  }
                  options={institutionOptions}
                  disabled={loadingOptions || isValidating || isCreating}
                  onValueChange={() => {
                    void setFieldValue("beneficiaryId", "", false);
                    void setFieldValue("toAccount", "", false);
                    void setFieldTouched("toAccount", false, false);
                  }}
                />

                <FormikRecipientInput
                  name="toAccount"
                  label={t("fields.toAccount")}
                  disabled={
                    !values.toInstitutionId || isValidating || isCreating
                  }
                  placeholder={
                    values.toInstitutionId
                      ? t("form.enterToAccount")
                      : t("form.selectBankFirst")
                  }
                  onValueChange={() => {
                    if (values.beneficiaryId) {
                      void setFieldValue("beneficiaryId", "", false);
                    }
                  }}
                />
              </div>

              <div className="grid gap-x-5 md:grid-cols-2">
                <FormInputIcon
                  name="amount"
                  label={t("fields.amount")}
                  type="number"
                  inputMode="decimal"
                  step="0.0001"
                  disabled={isValidating || isCreating}
                  autoComplete="off"
                />

                <div className="mb-4 w-full">
                  <label
                    htmlFor="onepay-currency"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("fields.currency")}
                  </label>
                  <input
                    id="onepay-currency"
                    value={selectedAccount?.currency ?? ""}
                    readOnly
                    disabled
                    placeholder={t("form.currencyDerived")}
                    className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-200 p-2 text-gray-600"
                  />
                </div>
              </div>

              <FormInputIcon
                name="description"
                label={t("fields.narrative")}
                disabled={isValidating || isCreating}
                autoComplete="off"
                maxLength={500}
              />

              {!loadingOptions && accounts.length === 0 && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {t("form.noAccounts")}
                </p>
              )}
              {!loadingOptions && institutions.length === 0 && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {t("form.noInstitutions")}
                </p>
              )}
              {beneficiariesUnavailable && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {t("form.beneficiariesUnavailable")}
                </p>
              )}

              <div className="mt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={
                    loadingOptions ||
                    isValidating ||
                    isCreating ||
                    accounts.length === 0 ||
                    institutions.length === 0
                  }
                  className="inline-flex min-w-52 items-center justify-center gap-2 rounded-lg bg-info-dark px-6 py-3 font-semibold text-white hover:bg-warning-light hover:text-info-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isValidating && <FiLoader className="animate-spin" />}
                  {isValidating
                    ? t("actions.validating")
                    : t("actions.validateAndContinue")}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>

      <VerifiedRecipientModal
        isOpen={validationModalOpen}
        validation={validation}
        isSubmitting={isCreating}
        onClose={() => {
          if (isCreating) return;
          setValidationModalOpen(false);
          setValidation(null);
        }}
        onConfirm={() => void createTransfer()}
      />

      <ErrorOrSuccessModal
        isOpen={errorOpen}
        isSuccess={false}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setErrorOpen(false)}
        okLabel={t("common.ok")}
        confirmLabel={t("common.confirm")}
        closeAriaLabel={t("common.close")}
      />
    </div>
  );
}
