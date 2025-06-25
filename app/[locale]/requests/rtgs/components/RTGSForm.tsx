/* --------------------------------------------------------------------------
   app/requests/rtgs/components/RTGSForm.tsx
   -------------------------------------------------------------------------- */
"use client";

import React from "react";
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
  /** If true, form fields are disabled and the submit button is hidden */
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

  /* ------------------- Sections config ------------------ */
  const sections = [
    {
      title: t("accInfo"),
      fields: [
        {
          component: FormInputIcon,
          props: {
            name: "accountNo",
            label: t("accountNb"),
            type: "text" as const,
            startIcon: <FaUniversity />,
            disabled: readOnly,
            maskingFormat: "0000-000000-000",
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "applicantName",
            label: t("name"),
            type: "text" as const,
            startIcon: <FaUser />,
            disabled: readOnly,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "address",
            label: t("address"),
            type: "text" as const,
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
            type: "text" as const,
            startIcon: <FaUser />,
            disabled: readOnly,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "beneficiaryAccountNo",
            label: t("benAccNum"),
            type: "text" as const,
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
            type: "text" as const,
            startIcon: <FaBuilding />,
            disabled: readOnly,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "branchName",
            label: t("branch"),
            type: "text" as const,
            startIcon: <FaMapMarkerAlt />,
            disabled: readOnly,
          },
        },
      ],
    },
    {
      title: t("payDetails"),
      fields: [
        {
          component: FormInputIcon,
          props: {
            name: "amount",
            label: t("amount"),
            type: "text" as const,
            startIcon: <FaDollarSign />,
            disabled: readOnly,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "remittanceInfo",
            label: t("reniInfo"),
            type: "text" as const,
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
    onSubmit(values, helpers);
  };

  /* ========================== RENDER ============================ */
  return (
    <div className="mt-2 w-full rounded bg-gray-100">
      <Form
        initialValues={mergedValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {/* ----------------- Header (responsive) ----------------- */}
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
        </div>

        {/* ----------------- Dynamic sections ----------------- */}
        {sections.map((section, idx) => (
          <div key={idx} className="px-4 md:px-6 py-4">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              {section.title}
            </h2>

            {/* Form fields */}
            <div
              className={
                section.title === t("attachments")
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-md"
                  : "grid grid-cols-1 md:grid-cols-2 gap-4"
              }
            >
              {section.fields.map((field, fieldIdx) => {
                const FieldComponent = field.component;
                return <FieldComponent key={fieldIdx} {...field.props} />;
              })}
            </div>

            {/* Section note */}
            {section.note && (
              <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                {section.note}
              </p>
            )}
          </div>
        ))}

        {/* ----------------- Buttons ----------------- */}
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
            isEditing={initialValues !== undefined}
          />
        </div>
      </Form>
    </div>
  );
};

export default RTGSForm;
