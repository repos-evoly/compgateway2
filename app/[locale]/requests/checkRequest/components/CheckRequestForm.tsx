"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FormikHelpers } from "formik";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import Description from "@/app/components/FormUI/Description";
import CheckRequestTable from "../components/Table";
import { FaPaperPlane } from "react-icons/fa";

// We'll use the "form type," not the API type
import { TCheckRequestFormValues } from "../types";

type CheckRequestFormProps = {
  initialValues?: Partial<TCheckRequestFormValues>;
  onSubmit: (
    values: TCheckRequestFormValues,
    helpers: FormikHelpers<TCheckRequestFormValues>
  ) => void;
  onCancel?: () => void;
};

const CheckRequestForm: React.FC<CheckRequestFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const t = useTranslations("CheckRequest");

  // Track whether the form is currently submitting to prevent double-submit
  const [submitting, setSubmitting] = useState(false);

  // Default form values
  const defaultValues: TCheckRequestFormValues = {
    branch: "",
    branchNum: "",
    date: new Date(),
    customerName: "",
    cardNum: "",
    accountNum: "",
    beneficiary: "",
    // 3 rows in lineItems
    lineItems: [
      { dirham: "", lyd: "" },
      { dirham: "", lyd: "" },
      { dirham: "", lyd: "" },
    ],
  };

  // Merge any passed-in props
  const mergedValues: TCheckRequestFormValues = {
    ...defaultValues,
    ...initialValues,
    // If `initialValues.date` is a string, convert to Date
    date:
      typeof initialValues?.date === "string"
        ? new Date(initialValues.date)
        : initialValues?.date || new Date(),
    // If lineItems is passed with exactly 3 rows, use them; otherwise default
    lineItems:
      initialValues?.lineItems && initialValues.lineItems.length === 3
        ? initialValues.lineItems
        : defaultValues.lineItems,
  };

  // Form fields
  const formFields = [
    {
      name: "branch",
      label: t("branch"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "branchNum",
      label: t("branchNum"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "date",
      label: t("date"),
      component: DatePickerValue,
      width: "w-full",
    },
    {
      name: "customerName",
      label: t("customerName"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "cardNum",
      label: t("cardNum"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "accountNum",
      label: t("accountNum"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "beneficiary",
      label: t("beneficiary"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
  ];

  // Wrap the parent onSubmit with our "prevent double submit" logic
  const handleSubmit = async (
    values: TCheckRequestFormValues,
    helpers: FormikHelpers<TCheckRequestFormValues>
  ) => {
    if (submitting) return; // Prevent double submission

    setSubmitting(true);
    try {
      // Call parent onSubmit
      await onSubmit(values, helpers);
    } finally {
      // Re-enable the submit button
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 rounded w-full bg-gray-100">
      <div className="w-full bg-info-dark h-16 rounded-t-md"></div>

      <div className="px-6 pb-6">
        {/* No validation schema so we can test the API freely */}
        <Form<TCheckRequestFormValues>
          initialValues={mergedValues}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formFields.map(({ component: FieldComp, ...props }) => (
              <FieldComp key={props.name} {...props} />
            ))}
          </div>

          <div className="mt-6">
            <CheckRequestTable />
          </div>

          <Description
            variant="h3"
            className="text-black font-bold text-center"
          >
            {t("note")}
          </Description>

          <div className="mt-6 flex gap-2">
            <SubmitButton
              title="Submit"
              Icon={FaPaperPlane}
              color="info-dark"
              // Disable button while submitting
              disabled={submitting}
            />
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CheckRequestForm;
