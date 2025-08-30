"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import Description from "@/app/components/FormUI/Description";
import CheckRequestTable from "../components/Table";
import { FaPaperPlane } from "react-icons/fa";
import { useFormikContext, useField } from "formik";

import { TCheckRequestFormValues } from "../types";
import { getKycByCode } from "../services";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { TCheckRequestFormProps } from "../types";

/* Representatives query --------------------------------------------------- */
import { getRepresentatives } from "@/app/[locale]/representatives/services";
import BranchesSelect from "@/app/components/reusable/BranchesSelect";
import ReasonBanner from "@/app/components/reusable/ReasonBanner";
import BackButton from "@/app/components/reusable/BackButton";

/* -------------------------------------------------------------------------- */
/* AccountNumberDropdown Component                                             */
/* -------------------------------------------------------------------------- */

type AccountNumberDropdownProps = {
  name: string;
  label: string;
  options: InputSelectComboOption[];
  placeholder: string;
  width: string;
  maskingFormat: string;
  disabled: boolean;
  onAccountChange: (
    accountNumber: string,
    setFieldValue: (
      field: string,
      value: unknown,
      shouldValidate?: boolean
    ) => void
  ) => void;
  isLoadingKyc: boolean;
};

const AccountNumberDropdown: React.FC<AccountNumberDropdownProps> = ({
  onAccountChange,
  isLoadingKyc,
  name,
  ...props
}) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField<string>(name);

  /* Guard to only call onAccountChange when the value actually changes */
  const prevValueRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const current = field.value;
    if (current && current !== prevValueRef.current) {
      prevValueRef.current = current;
      onAccountChange(current, setFieldValue);
    }
  }, [field.value, onAccountChange, setFieldValue]);

  return (
    <div className="relative">
      <InputSelectCombo name={name} {...props} />
      {isLoadingKyc && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 transform">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const CheckRequestForm: React.FC<TCheckRequestFormProps> = ({
  initialValues,
  onSubmit,
  readOnly = false,
  isSubmitting = false,
}) => {
  const t = useTranslations("CheckRequest");

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* account options state */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);

  /* representative options state */
  const [representativeOptions, setRepresentativeOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [isLoadingRepresentatives, setIsLoadingRepresentatives] =
    useState(false);

  /* default values */
  const defaultValues: TCheckRequestFormValues = {
    branch: "",
    date: new Date(),
    customerName: "",
    cardNum: "",
    accountNum: "",
    beneficiary: "",
    representativeId: undefined,
    lineItems: [
      { dirham: "", lyd: "" },
      { dirham: "", lyd: "" },
      { dirham: "", lyd: "" },
    ],
  };

  const mergedValues: TCheckRequestFormValues = {
    ...defaultValues,
    ...initialValues,
    date:
      typeof initialValues?.date === "string"
        ? new Date(initialValues.date)
        : initialValues?.date || new Date(),
    lineItems:
      initialValues?.lineItems && initialValues.lineItems.length === 3
        ? initialValues.lineItems
        : defaultValues.lineItems,
  };

  const status =
    (initialValues as { status?: string } | undefined)?.status ?? undefined;

  /* Load account options from cookies */
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let accounts: string[] = [];

    try {
      accounts = JSON.parse(raw);
    } catch {
      try {
        accounts = JSON.parse(decodeURIComponent(raw));
      } catch {
        accounts = [];
      }
    }

    setAccountOptions(accounts.map((acc) => ({ label: acc, value: acc })));
  }, []);

  /* Load representative options */
  useEffect(() => {
    const fetchRepresentatives = async () => {
      setIsLoadingRepresentatives(true);
      try {
        const response = await getRepresentatives(1, 100);
        const options = response.data.map((rep) => ({
          label: rep.name,
          value: rep.id,
        }));
        setRepresentativeOptions(options);
      } catch (error) {
        console.error("Failed to fetch representatives:", error);
        setRepresentativeOptions([]);
      } finally {
        setIsLoadingRepresentatives(false);
      }
    };

    fetchRepresentatives();
  }, []);

  /* Extract company code (stable) */
  const extractCompanyCode = useCallback((accountNumber: string): string => {
    const cleanAccount = accountNumber.replace(/\D/g, "");
    if (cleanAccount.length >= 10) return cleanAccount.substring(4, 10);
    return "";
  }, []);

  /* Deduplicate KYC fetches for the same company code */
  const lastFetchedCodeRef = useRef<string | null>(null);

  /* Fetch and populate KYC data (stable) */
  const handleAccountNumberChange = useCallback(
    async (
      accountNumber: string,
      setFieldValue: (
        field: string,
        value: unknown,
        shouldValidate?: boolean
      ) => void
    ) => {
      if (!accountNumber) return;

      const companyCode = extractCompanyCode(accountNumber);
      if (!companyCode) return;

      /* Prevent repeat calls for the same code */
      if (lastFetchedCodeRef.current === companyCode) return;
      lastFetchedCodeRef.current = companyCode;

      setIsLoadingKyc(true);
      try {
        const kycData = await getKycByCode(companyCode);

        if (kycData.hasKyc && kycData.data) {
          setFieldValue(
            "customerName",
            kycData.data.legalCompanyNameLT || kycData.data.legalCompanyName
          );
          setFieldValue("branch", kycData.data.branchName);

          const parts: string[] = [];
          if (kycData.data.street) parts.push(kycData.data.street);
          if (kycData.data.district) parts.push(kycData.data.district);
          if (kycData.data.city) parts.push(kycData.data.city);
          setFieldValue("address", parts.join(", "));
        }
      } catch (error) {
        console.error("Failed to fetch KYC data:", error);
      } finally {
        setIsLoadingKyc(false);
      }
    },
    [extractCompanyCode]
  );

  /* form fields array */
  const formFields = [
    {
      name: "date",
      label: t("date"),
      component: DatePickerValue,
      readOnly: false,
    },
    {
      name: "customerName",
      label: t("customerName"),
      type: "text",
      component: FormInputIcon,
      readOnly: true,
    },
    {
      name: "cardNum",
      label: t("cardNum"),
      type: "text",
      component: FormInputIcon,
      readOnly: false,
    },
    {
      name: "beneficiary",
      label: t("beneficiary"),
      type: "text",
      component: FormInputIcon,
      readOnly: false,
    },
  ];

  /* wrapped submit */
  const handleSubmit = async (values: TCheckRequestFormValues) => {
    const hasValidAmount = values.lineItems.some((item) => {
      const dirhamValid =
        item.dirham && item.dirham.trim() !== "" && !isNaN(Number(item.dirham));
      const lydValid =
        item.lyd && item.lyd.trim() !== "" && !isNaN(Number(item.lyd));
      return dirhamValid || lydValid;
    });

    const hasNonNumericValues = values.lineItems.some((item) => {
      const dirhamNonNumeric =
        item.dirham && item.dirham.trim() !== "" && isNaN(Number(item.dirham));
      const lydNonNumeric =
        item.lyd && item.lyd.trim() !== "" && isNaN(Number(item.lyd));
      return dirhamNonNumeric || lydNonNumeric;
    });

    if (hasNonNumericValues) {
      setModalTitle(t("errorTitle"));
      setModalMessage(t("numericAmountRequired"));
      setModalSuccess(false);
      setModalOpen(true);
      return;
    }

    if (!hasValidAmount) {
      setModalTitle(t("errorTitle"));
      setModalMessage(t("amountRequired"));
      setModalSuccess(false);
      setModalOpen(true);
      return;
    }

    try {
      await onSubmit(values);
      setModalTitle(t("successTitle"));
      setModalMessage(t("successMessage"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  /* JSX */
  return (
    <>
      <div className="rounded w-full bg-gray-100">
        <ReasonBanner
          reason={initialValues?.reason ?? null}
          status={
            (status ?? "").toLowerCase() === "approved"
              ? "approved"
              : "rejected"
          }
        />

        <FormHeader status={status}>
          <BackButton
            isEditing={initialValues ? true : false}
            fallbackPath="/requests/checkRequest"
          />
        </FormHeader>

        <div className="px-6 pb-6">
          <Form<TCheckRequestFormValues>
            initialValues={mergedValues}
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AccountNumberDropdown
                name="accountNum"
                label={t("accountNum")}
                options={accountOptions}
                placeholder={t("accountNum")}
                width="w-full"
                maskingFormat="0000-000000-000"
                disabled={readOnly || isSubmitting}
                onAccountChange={handleAccountNumberChange}
                isLoadingKyc={isLoadingKyc}
              />

              <BranchesSelect
                name="branch"
                label={t("branch")}
                width="w-full"
                disabled={readOnly || isSubmitting}
              />

              <InputSelectCombo
                name="representativeId"
                label={t("delegate")}
                options={representativeOptions}
                placeholder={t("delegate")}
                width="w-full"
                disabled={readOnly || isSubmitting || isLoadingRepresentatives}
              />

              {formFields.map(
                ({ component: Field, readOnly: fieldReadOnly, ...props }) => (
                  <Field
                    key={props.name}
                    {...props}
                    width="w-full"
                    disabled={readOnly || isSubmitting || fieldReadOnly}
                  />
                )
              )}
            </div>

            <div className="mt-6">
              <CheckRequestTable readOnly={readOnly || isSubmitting} />
            </div>

            <Description
              variant="h3"
              className="text-center font-bold text-black"
            >
              {t("note")}
            </Description>

            {!readOnly && (
              <div className="mt-4 flex justify-center gap-3">
                <SubmitButton
                  title="Submit"
                  Icon={FaPaperPlane}
                  color="info-dark"
                  disabled={isSubmitting}
                  fullWidth={false}
                />
              </div>
            )}
          </Form>
        </div>
      </div>

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </>
  );
};

export default CheckRequestForm;
