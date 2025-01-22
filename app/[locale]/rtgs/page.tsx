"use client";

import React from "react";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import Form from "@/app/components/FormUI/Form";
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
} from "react-icons/fa";
import * as Yup from "yup";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("RTGSForm");
  const initialValues = {
    refNum: new Date(),
    date: new Date(),
    paymentType: "", // New field for radio buttons
    accountNo: "", // Account Number input
    applicantName: "", // Applicant Name input
    address: "", // Address input
    beneficiaryName: "", // Beneficiary Name input
    beneficiaryAccountNo: "", // Beneficiary Account Number input
    beneficiaryBank: "", // Beneficiary Bank input
    branchName: "", // Branch Name input
    amount: "", // Payment Amount input
    remittanceInfo: "", // Remittance Information input
    invoice: false, // Checkbox for invoice
    contract: false, // Checkbox for contract
    claim: false, // Checkbox for claim
    otherDoc: false, // Checkbox for other documents
  };

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

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form submitted with values:", values);
  };

  const sections = [
    {
      title: t("accInfo"),
      fields: [
        {
          component: FormInputIcon,
          props: {
            name: "accountNo",
            label: t("accountNb"),
            type: "text",
            startIcon: <FaUniversity />,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "applicantName",
            label: t("name"),
            type: "text",
            startIcon: <FaUser />,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "address",
            label: t("address"),
            type: "text",
            startIcon: <FaMapMarkerAlt />,
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
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "beneficiaryAccountNo",
            label: t("benAccNum"),
            type: "text",
            startIcon: <FaUniversity />,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "beneficiaryBank",
            label: t("benBank"),
            type: "text",
            startIcon: <FaBuilding />,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "branchName",
            label: t("branch"),
            type: "text",
            startIcon: <FaMapMarkerAlt />,
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
            type: "text",
            startIcon: <FaDollarSign />,
          },
        },
        {
          component: FormInputIcon,
          props: {
            name: "remittanceInfo",
            label: t("reniInfo"),
            type: "text",
            startIcon: <FaInfoCircle />,
          },
        },
      ],
    },
    {
      title: t("attachments"),
      fields: [
        {
          component: Checkbox,
          props: { name: "invoice", label: t("invoice") },
        },
        {
          component: Checkbox,
          props: { name: "contract", label: t("contract") },
        },
        {
          component: Checkbox,
          props: { name: "claim", label: t("claim") },
        },
        {
          component: Checkbox,
          props: { name: "otherDoc", label: t("otherDoc") },
        },
      ],
      note: t("note"),
    },
  ];

  return (
    <div className="mt-2 rounded w-full bg-gray-100">
      <Form
        initialValues={initialValues}
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
            />
          </div>
          <div className="mt-3 w-1/3">
            <DatePickerValue
              name="date"
              label={t("date")}
              titlePosition="side"
              textColor="text-white"
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
              textColor="text-white"
              flexDir={["row", "row"]}
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

        {/* Submit Button Section */}
        <div className="px-6 pb-6">
          <SubmitButton
            title="Submit"
            Icon={FaPaperPlane}
            color="info-dark"
            fullWidth
          />
        </div>
      </Form>
    </div>
  );
};

export default Page;
