/* --------------------------------------------------------------------------
 * app/[locale]/requests/rtgs/components/RTGSForm.tsx
 * – Adds commission helper on Amount (categoryId=13) and submits amount+commission:
 *     • Fetches B2C commission using servicePackageId (cookie) + categoryId=13
 *     • Commission = max(amount * pct/100, fixedFee)
 *     • Helper text shows: "Commission: X — Total: Y"
 *     • On submit, replaces `amount` with (amount + commission) then calls onSubmit
 * – Confirmation dialog removed (direct submit).
 * – Copy-paste ready. Strict TypeScript (no `any`), uses `type`.
 * -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { FormikHelpers } from "formik";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import Checkbox from "@/app/components/FormUI/CheckboxWrapper";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";

import {
  FaUser,
  FaUniversity,
  FaMapMarkerAlt,
  FaBuilding,
  FaDollarSign,
  FaInfoCircle,
  FaPaperPlane,
} from "react-icons/fa";

import type { TRTGSFormValues } from "../types";
import { getKycByCode } from "../services";
import { useFormikContext, useField } from "formik";
import StatusBanner from "@/app/components/reusable/StatusBanner";
import BranchesSelect from "@/app/components/reusable/BranchesSelect";
import ReasonBanner from "@/app/components/reusable/ReasonBanner";

/* Commission service (same one used in other forms) */
import { getTransfersCommision } from "@/app/[locale]/transfers/internal/services";
import { TransfersCommision } from "@/app/[locale]/transfers/internal/types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */
const COOKIE_SERVICE_PKG_KEY: string = "servicePackageId";
const CATEGORY_ID_RTGS: number = 13;

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const computeCommission = (
  amount: number,
  pct: number,
  fixed: number
): number => Math.max((amount * pct) / 100, fixed);

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
    setFieldValue: (field: string, value: unknown) => void
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

  useEffect(() => {
    if (field.value) {
      onAccountChange(field.value, setFieldValue);
    }
  }, [field.value, onAccountChange, setFieldValue]);

  return (
    <div className="relative">
      <InputSelectCombo name={name} {...props} />
      {isLoadingKyc && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Commissioned Amount input (wraps FormInputIcon to add helper text)          */
/* -------------------------------------------------------------------------- */

type CommissionedAmountInputProps = {
  name: string;
  label: string;
  type?: "text" | "number";
  startIcon?: React.ReactNode;
  disabled?: boolean;
  b2cPct: number;
  b2cFixed: number;
};

const CommissionedAmountInput: React.FC<CommissionedAmountInputProps> = ({
  name,
  label,
  type = "text",
  startIcon,
  disabled,
  b2cPct,
  b2cFixed,
}) => {
  const { values } = useFormikContext<TRTGSFormValues>();
  const tUi = useTranslations("RTGSForm");

  const amountNum: number = toNumber(values.amount);
  const commission: number =
    amountNum > 0 ? computeCommission(amountNum, b2cPct, b2cFixed) : 0;
  const totalToPay: number = amountNum + commission;

  const helperText: string =
    amountNum > 0
      ? `${tUi("commissionLabel", {
          default: "Commission",
        })}: ${commission.toLocaleString()} — ${tUi("totalToPayLabel", {
          default: "Total to pay",
        })}: ${totalToPay.toLocaleString()}`
      : "";

  return (
    <FormInputIcon
      name={name}
      label={label}
      type={type}
      startIcon={startIcon}
      disabled={disabled}
      helpertext={helperText}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
type RTGSFormProps = {
  initialValues?: Partial<TRTGSFormValues>;
  onSubmit: (
    values: TRTGSFormValues,
    helpers: FormikHelpers<TRTGSFormValues>
  ) => void;
  onCancel?: () => void;
  readOnly?: boolean;
};

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */
const validationSchema = Yup.object({
  refNum: Yup.date().required("Reference Number is required"),
  date: Yup.date().required("Date is required").typeError("Invalid date"),
  paymentType: Yup.string().required("Payment type is required"),
  accountNo: Yup.string().required("Account Number is required"),
  applicantName: Yup.string().required("Applicant Name is required"),
  address: Yup.string().required("Address is required"),
  beneficiaryName: Yup.string().required("Beneficiary Name is required"),
  beneficiaryAccountNo: Yup.string().required(
    "Beneficiary Account Number is required"
  ),
  beneficiaryBank: Yup.string().required("Beneficiary Bank is required"),
  branchName: Yup.string().required("Branch Name is required"),
  amount: Yup.string().required("Amount is required"),
  remittanceInfo: Yup.string().required("Remittance Information is required"),
  invoice: Yup.boolean().default(false).optional(),
  contract: Yup.boolean().default(false).optional(),
  claim: Yup.boolean().default(false).optional(),
  otherDoc: Yup.boolean().default(false).optional(),
});

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const RTGSForm: React.FC<RTGSFormProps> = ({
  initialValues,
  onSubmit,
  readOnly = false,
}) => {
  const t = useTranslations("RTGSForm");
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  /* ---- commission config --------------------------------------------- */
  const [commissionCfg, setCommissionCfg] = useState<TransfersCommision | null>(
    null
  );
  const b2cPct: number = useMemo(
    () => commissionCfg?.b2CCommissionPct ?? 0,
    [commissionCfg]
  );
  const b2cFixed: number = useMemo(
    () => commissionCfg?.b2CFixedFee ?? 0,
    [commissionCfg]
  );

  useEffect(() => {
    const run = async (): Promise<void> => {
      const rawId = Cookies.get(COOKIE_SERVICE_PKG_KEY);
      const parsed = rawId ? Number(rawId) : NaN;
      if (!Number.isFinite(parsed)) {
        console.error(
          `Cookie "${COOKIE_SERVICE_PKG_KEY}" is missing or invalid. Got:`,
          rawId
        );
        return;
      }
      try {
        const cfg = await getTransfersCommision(parsed, CATEGORY_ID_RTGS);
        setCommissionCfg(cfg);
      } catch (err) {
        console.error("[RTGS Commission] Fetch failed:", err);
      }
    };
    void run();
  }, []);

  /* ---- account dropdown from cookie ----------------------------------- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let list: string[] = [];
    try {
      list = JSON.parse(raw);
    } catch {
      try {
        list = JSON.parse(decodeURIComponent(raw));
      } catch {
        list = [];
      }
    }
    setAccountOptions(list.map((acc) => ({ label: acc, value: acc })));
  }, []);

  /* ------------------- Initial values ------------------- */
  const defaultVals: TRTGSFormValues = {
    refNum: new Date(),
    date: new Date(),
    paymentType: "",
    accountNo: "",
    applicantName: "",
    address: "",
    beneficiaryName: "",
    beneficiaryAccountNo: "",
    beneficiaryBank: "",
    branchName: "",
    amount: "",
    remittanceInfo: "",
    invoice: false,
    contract: false,
    claim: false,
    otherDoc: false,
    status: "",
  };

  const mergedValues: TRTGSFormValues = {
    ...defaultVals,
    ...initialValues,
    refNum:
      typeof initialValues?.refNum === "string"
        ? new Date(initialValues.refNum)
        : initialValues?.refNum || new Date(),
    date:
      typeof initialValues?.date === "string"
        ? new Date(initialValues.date)
        : initialValues?.date || new Date(),
  };
  const status =
    (initialValues as { status?: string } | undefined)?.status ?? undefined;

  /* Function to extract company code from account number */
  const extractCompanyCode = (accountNumber: string): string => {
    const cleanAccount = accountNumber.replace(/\D/g, "");
    if (cleanAccount.length >= 10) return cleanAccount.substring(4, 10);
    return "";
  };

  /* Function to fetch and populate KYC data */
  const handleAccountNumberChange = async (
    accountNumber: string,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    if (!accountNumber) return;

    const companyCode = extractCompanyCode(accountNumber);
    if (!companyCode) return;

    if (hasAutoFilled) return; // Only autofill once per session
    setIsLoadingKyc(true);

    try {
      const kycData = await getKycByCode(companyCode);

      if (kycData.hasKyc && kycData.data) {
        setFieldValue(
          "applicantName",
          kycData.data.legalCompanyNameLT || kycData.data.legalCompanyName
        );
        setFieldValue("branchName", kycData.data.branchName);
        const addressParts: string[] = [];
        if (kycData.data.street) addressParts.push(kycData.data.street);
        if (kycData.data.district) addressParts.push(kycData.data.district);
        if (kycData.data.city) addressParts.push(kycData.data.city);
        setFieldValue("address", addressParts.join(", "));
        setHasAutoFilled(true);
      }
    } catch (error) {
      console.error("Failed to fetch KYC data:", error);
    } finally {
      setIsLoadingKyc(false);
    }
  };

  /* ------------------- Types for sections ------------------ */
  type FieldConfig =
    | {
        component: typeof AccountNumberDropdown;
        props: AccountNumberDropdownProps;
      }
    | {
        component: typeof FormInputIcon;
        props: React.ComponentProps<typeof FormInputIcon>;
      }
    | {
        component: typeof BranchesSelect;
        props: React.ComponentProps<typeof BranchesSelect>;
      }
    | {
        component: typeof Checkbox;
        props: React.ComponentProps<typeof Checkbox>;
      }
    | {
        component: typeof CommissionedAmountInput;
        props: React.ComponentProps<typeof CommissionedAmountInput>;
      };

  type Section = {
    title: string;
    fields: FieldConfig[];
    note?: string;
  };

  /* ------------------- Sections config ------------------ */
  const sections: Section[] = [
    {
      title: t("accInfo"),
      fields: [
        {
          component: AccountNumberDropdown,
          props: {
            name: "accountNo",
            label: t("accountNb"),
            options: accountOptions,
            placeholder: t("accountNb"),
            width: "w-full",
            maskingFormat: "0000-000000-000",
            disabled: readOnly,
            onAccountChange: handleAccountNumberChange,
            isLoadingKyc: isLoadingKyc,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "applicantName",
            label: t("name"),
            type: "text",
            startIcon: <FaUser />,
            disabled: readOnly,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "address",
            label: t("address"),
            type: "text",
            startIcon: <FaMapMarkerAlt />,
            disabled: readOnly,
          },
        },
      ],
    },
    {
      title: t("benDetails"),
      fields: [
        {
          component: FormInputIcon,
          props: {
            name: "beneficiaryName",
            label: t("benName"),
            type: "text",
            startIcon: <FaUser />,
            disabled: readOnly,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "beneficiaryAccountNo",
            label: t("benAccNum"),
            type: "text",
            startIcon: <FaUniversity />,
            disabled: readOnly,
            maskingFormat: "0000-000000-000",
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "beneficiaryBank",
            label: t("benBank"),
            type: "text",
            startIcon: <FaBuilding />,
            disabled: readOnly,
          },
        },
        {
          component: BranchesSelect,
          props: {
            name: "branchName",
            label: t("branch"),
            width: "w-full",
            disabled: readOnly,
          },
        },
      ],
    },
    {
      title: t("payDetails"),
      fields: [
        {
          component: CommissionedAmountInput,
          props: {
            name: "amount",
            label: t("amount"),
            type: "text",
            startIcon: <FaDollarSign />,
            disabled: readOnly,
            b2cPct,
            b2cFixed,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "remittanceInfo",
            label: t("reniInfo"),
            type: "text",
            startIcon: <FaInfoCircle />,
            disabled: readOnly,
          },
        },
      ],
    },
    {
      title: t("attachments"),
      note: t("note"),
      fields: [
        {
          component: Checkbox,
          props: { name: "invoice", label: t("invoice"), disabled: readOnly },
        },
        {
          component: Checkbox,
          props: { name: "contract", label: t("contract"), disabled: readOnly },
        },
        {
          component: Checkbox,
          props: { name: "claim", label: t("claim"), disabled: readOnly },
        },
        {
          component: Checkbox,
          props: { name: "otherDoc", label: t("otherDoc"), disabled: readOnly },
        },
      ],
    },
  ];

  /* ------------------- Submit handler ------------------- */
  const handleSubmit = (
    values: TRTGSFormValues,
    helpers: FormikHelpers<TRTGSFormValues>
  ) => {
    // Direct submit: replace amount with (amount + commission), then call onSubmit
    const amountNum = toNumber(values.amount);
    const commission =
      amountNum > 0 ? computeCommission(amountNum, b2cPct, b2cFixed) : 0;
    const totalToPay = amountNum + commission;

    const nextValues: TRTGSFormValues = {
      ...values,
      amount: String(totalToPay),
    };

    onSubmit(nextValues, helpers);
  };

  const bannerStatus: "approved" | "rejected" =
    (status ?? "").toLowerCase() === "approved" ? "approved" : "rejected";

  const bannerReason: string | null =
    typeof mergedValues.reason === "string" &&
    mergedValues.reason.trim().length > 0
      ? mergedValues.reason
      : null;

  /* ====================================================== */
  return (
    <div className="mt-2 w-full rounded bg-gray-100">
      <Form
        initialValues={mergedValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <ReasonBanner reason={bannerReason} status={bannerStatus} />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 bg-info-dark h-auto md:h-16 rounded-t-md px-4 py-4 md:py-0">
          <div className="flex-1">
            <DatePickerValue
              name="refNum"
              label={t("refNum")}
              titlePosition="side"
              textColor="text-white"
              disabled={readOnly}
            />
          </div>

          <div className="flex-1">
            <DatePickerValue
              name="date"
              label={t("date")}
              titlePosition="side"
              textColor="text-white"
              disabled={readOnly}
            />
          </div>

          <div className="flex-1">
            <RadiobuttonWrapper
              name="paymentType"
              label=""
              options={[
                { value: "rtgs", label: "rtgs" },
                { value: "ach", label: "ach" },
              ]}
              t={t}
              flexDir={["row", "row"]}
              disabled={readOnly}
            />
          </div>

          {status && (
            <StatusBanner status={status} className="ltr:ml-auto rtl:mr-auto" />
          )}
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="px-4 md:px-6 py-4">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              {section.title}
            </h2>

            <div
              className={
                section.title === t("attachments")
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-md"
                  : "grid grid-cols-1 md:grid-cols-2 gap-4"
              }
            >
              {section.fields.map((field, fIdx) => {
                const FieldComponent = field.component as React.ElementType;
                return (
                  <FieldComponent
                    key={fIdx}
                    {...(field as unknown as { props: Record<string, unknown> })
                      .props}
                  />
                );
              })}
            </div>

            {section.note && (
              <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                {section.note}
              </p>
            )}
          </div>
        ))}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 px-4 md:px-6 pb-6">
          {!readOnly && (
            <SubmitButton
              title="Submit"
              color="info-dark"
              Icon={FaPaperPlane}
              fullWidth={false}
            />
          )}
          <BackButton
            fallbackPath="/requests/rtgs"
            isEditing={initialValues ? true : false}
          />
        </div>
      </Form>
    </div>
  );
};

export default RTGSForm;
