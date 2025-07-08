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

import { TCheckRequestFormValues } from "../types";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CheckRequestFormProps = {
  initialValues?: Partial<TCheckRequestFormValues>;
  onSubmit: (
    values: TCheckRequestFormValues,
    helpers: FormikHelpers<TCheckRequestFormValues>
  ) => void;
  onCancel?: () => void;
  readOnly?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const CheckRequestForm: React.FC<CheckRequestFormProps> = ({
  initialValues,
  onSubmit,
  readOnly = false,
}) => {
  const t = useTranslations("CheckRequest");

  /* submitting flag */
  const [submitting, setSubmitting] = useState(false);

  /* modal state (NEW) */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* default values */
  const defaultValues: TCheckRequestFormValues = {
    branch: "",
    branchNum: "",
    date: new Date(),
    customerName: "",
    cardNum: "",
    accountNum: "",
    beneficiary: "",
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

  /* form fields array */
  const formFields = [
    {
      name: "branch",
      label: t("branch"),
      type: "text",
      component: FormInputIcon,
    },
    {
      name: "branchNum",
      label: t("branchNum"),
      type: "text",
      component: FormInputIcon,
    },
    { name: "date", label: t("date"), component: DatePickerValue },
    {
      name: "customerName",
      label: t("customerName"),
      type: "text",
      component: FormInputIcon,
    },
    {
      name: "cardNum",
      label: t("cardNum"),
      type: "text",
      component: FormInputIcon,
    },
    {
      name: "accountNum",
      label: t("accountNum"),
      type: "text",
      component: FormInputIcon,
    },
    {
      name: "beneficiary",
      label: t("beneficiary"),
      type: "text",
      component: FormInputIcon,
    },
  ] as const;

  /* wrapped submit */
  const handleSubmit = async (
    values: TCheckRequestFormValues,
    helpers: FormikHelpers<TCheckRequestFormValues>
  ) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await onSubmit(values, helpers);

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
    } finally {
      setSubmitting(false);
    }
  };

  /* JSX */
  return (
    <>
      <div className="mt-4 rounded w-full bg-gray-100">
        <FormHeader
          status={status}
          showBackButton
          fallbackPath="/requests/checkRequest"
          isEditing={readOnly}
        />

        <div className="px-6 pb-6">
          <Form<TCheckRequestFormValues>
            initialValues={mergedValues}
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formFields.map(({ component: Field, ...props }) => (
                <Field
                  key={props.name}
                  {...props}
                  width="w-full"
                  disabled={readOnly}
                />
              ))}
            </div>

            <div className="mt-6">
              <CheckRequestTable readOnly={readOnly} />
            </div>

            <Description
              variant="h3"
              className="text-black font-bold text-center"
            >
              {t("note")}
            </Description>

            {!readOnly && (
              <div className="mt-4 flex justify-center gap-3">
                <SubmitButton
                  title="Submit"
                  Icon={FaPaperPlane}
                  color="info-dark"
                  disabled={submitting}
                  fullWidth={false}
                />
              </div>
            )}
          </Form>
        </div>
      </div>

      {/* Error / Success modal (NEW) */}
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
