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
import {
  FaUser,
  FaUniversity,
  FaMapMarkerAlt,
  FaBuilding,
  FaDollarSign,
  FaInfoCircle,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";
import CancelButton from "@/app/components/FormUI/CancelButton";

import { TRTGSFormValues } from "../types";

/** Props for the RTGSForm component */
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

/** Validation Schema */
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

/** The RTGS form component */
const RTGSForm: React.FC<RTGSFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  readOnly = false, // defaults to editable
}) => {
  const t = useTranslations("RTGSForm");

  // Default initial values
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

  // Merge with passed-in initial values
  const mergedValues: TRTGSFormValues = {
    ...defaultVals,
    ...initialValues,
    // If parent gave refNum/date as string, convert them to Date
    refNum:
      typeof initialValues?.refNum === "string"
        ? new Date(initialValues.refNum)
        : initialValues?.refNum || new Date(),
    date:
      typeof initialValues?.date === "string"
        ? new Date(initialValues.date)
        : initialValues?.date || new Date(),
  };

  // We'll separate the sections for clarity
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
      fields: [
        {
          component: Checkbox,
          props: {
            name: "invoice",
            label: t("invoice"),
            disabled: readOnly,
          },
        },
        {
          component: Checkbox,
          props: {
            name: "contract",
            label: t("contract"),
            disabled: readOnly,
          },
        },
        {
          component: Checkbox,
          props: {
            name: "claim",
            label: t("claim"),
            disabled: readOnly,
          },
        },
        {
          component: Checkbox,
          props: {
            name: "otherDoc",
            label: t("otherDoc"),
            disabled: readOnly,
          },
        },
      ],
      note: t("note"),
    },
  ];

  const handleSubmit = (
    values: TRTGSFormValues,
    helpers: FormikHelpers<TRTGSFormValues>
  ) => {
    onSubmit(values, helpers);
  };

  return (
    <div className="mt-2 rounded w-full bg-gray-100">
      <Form
        initialValues={mergedValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {/* Header Section */}
        <div className="w-full bg-info-dark h-16 rounded-t-md flex items-center gap-6 px-4">
          <div className="mt-3 w-1/3">
            <DatePickerValue
              name="refNum"
              label={t("refNum")}
              titlePosition="side"
              textColor="text-white"
              disabled={readOnly}
            />
          </div>
          <div className="mt-3 w-1/3">
            <DatePickerValue
              name="date"
              label={t("date")}
              titlePosition="side"
              textColor="text-white"
              disabled={readOnly}
            />
          </div>
          <div className="mt-3 w-1/3">
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

        {sections.map((section, index) => (
          <div key={index} className="px-6 py-4">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <div
              className={`${
                section.title === t("attachments")
                  ? "grid grid-cols-4 w-1/2"
                  : "flex gap-4"
              }`}
            >
              {section.fields.map((field, fieldIndex) => {
                const FieldComponent = field.component;
                return (
                  <div key={fieldIndex} className="w-full">
                    <FieldComponent {...field.props} />
                  </div>
                );
              })}
            </div>
            {section.note && (
              <p className="text-sm text-gray-700 mt-4">{section.note}</p>
            )}
          </div>
        ))}

        {/* Buttons */}
        <div className="px-6 pb-6 flex justify-center items-center gap-2">
          {/* Hide the submit button if readOnly */}
          {!readOnly && (
            <SubmitButton
              title="Submit"
              color="info-dark"
              Icon={FaPaperPlane}
              fullWidth={false}
            />
          )}
          {onCancel && (
            <CancelButton
              title={t("cancel")}
              Icon={FaTimes}
              onClick={onCancel}
              fullWidth={false}
            />
          )}
        </div>
      </Form>
    </div>
  );
};

export default RTGSForm;
