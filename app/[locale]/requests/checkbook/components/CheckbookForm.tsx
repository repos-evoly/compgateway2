/* --------------------------------------------------------------------------
 * app/[locale]/requests/checkbook/components/CheckbookForm.tsx
 * Account Number field now uses <InputSelectCombo> (cookie-based options)
 * Updated to handle both create and update operations
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaPaperPlane, FaEdit } from "react-icons/fa";
import Description from "@/app/components/FormUI/Description";

import { createCheckbookRequest } from "../services";
import { TCheckbookFormProps, TCheckbookFormValues } from "../types";
import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

// Updated props interface to include isSubmitting
interface UpdatedCheckbookFormProps extends TCheckbookFormProps {
  isSubmitting?: boolean;
}

const CheckbookForm: React.FC<UpdatedCheckbookFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  readOnly = false,
  isSubmitting: externalIsSubmitting = false,
}) => {
  const t = useTranslations("checkForm");

  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);

  // Determine if this is an edit form (has initialData) or create form
  const isEditMode = initialData !== undefined && initialData !== null;

  /* ------------------------------------------------------------------ */
  /* Effects                                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    /* Pull saved statement-account numbers from a cookie */
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

  /* ------------------------------------------------------------------ */
  /* Form values & validation                                            */
  /* ------------------------------------------------------------------ */
  const defaultValues: TCheckbookFormValues = {
    fullName: "",
    address: "",
    accountNumber: "",
    pleaseSend: "",
    branch: "",
    date: "",
    bookContaining: "",
  };

  const initialValues: TCheckbookFormValues = initialData
    ? { ...defaultValues, ...initialData }
    : defaultValues;

  const schema = Yup.object({
    fullName: Yup.string().required(`${t("name")} ${t("required")}`),
    address: Yup.string().required(`${t("address")} ${t("required")}`),
    accountNumber: Yup.string().required(`${t("accNum")} ${t("required")}`),
    pleaseSend: Yup.string().required(`${t("sendTo")} ${t("required")}`),
    branch: Yup.string().required(`${t("branch")} ${t("required")}`),
    date: Yup.string().required(`${t("date")} ${t("required")}`),
    bookContaining: Yup.string().required(t("selectOneOption")),
  });

  /* ------------------------------------------------------------------ */
  /* Handlers                                                            */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (values: TCheckbookFormValues): Promise<void> => {
    if (readOnly || isSubmitting || externalIsSubmitting) return;

    if (isEditMode) {
      // For edit mode, just call the parent's onSubmit (which should handle the update)
      onSubmit(values);
    } else {
      // For create mode, handle the API call here
      setIsSubmitting(true);

      try {
        const newItem = await createCheckbookRequest(values);
        onSubmit(newItem);

        setModalTitle(t("successTitle"));
        setModalMessage(t("successMessage"));
        setModalSuccess(true);
        setModalOpen(true);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  const status =
    (initialData as { status?: string } | undefined)?.status ?? undefined;

  const submitButtonDisabled = isSubmitting || externalIsSubmitting;

  return (
    <>
      <div className="mt-2 w-full rounded bg-gray-100">
        {/* ---------- Header ---------- */}
        <FormHeader status={status}>
          <BackButton
            fallbackPath="/requests/checkbook"
            isEditing={isEditMode}
            
          />
        </FormHeader>

        {/* ---------- Form body ---------- */}
        <div className="px-6 pb-6">
          <Form
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={schema}
          >
            {/* Inputs grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Account Number dropdown */}
              <InputSelectCombo
                name="accountNumber"
                label={t("accNum")}
                options={accountOptions}
                placeholder={t("accNum")}
                width="w-full"
                maskingFormat="0000-000000-000"
                disabled={readOnly}
              />

              {/* Other text fields */}
              {[
                { name: "fullName", label: t("name"), type: "text" },
                { name: "address", label: t("address"), type: "text" },
                { name: "pleaseSend", label: t("sendTo"), type: "text" },
                { name: "branch", label: t("branch"), type: "text" },
              ].map(({ name, label, type }) => (
                <FormInputIcon
                  key={name}
                  name={name}
                  label={label}
                  type={type}
                  width="w-full"
                  disabled={readOnly}
                />
              ))}

              {/* Date picker */}
              <DatePickerValue
                name="date"
                label={t("date")}
                disabled={readOnly}
              />
            </div>

            {/* Radio buttons */}
            <div className="mt-4">
              <RadiobuttonWrapper
                name="bookContaining"
                label={t("book")}
                options={[
                  { value: "24", label: "24" },
                  { value: "48", label: "48" },
                ]}
                t={(key: string) => key}
                disabled={readOnly}
              />
            </div>

            {/* Agreement text */}
            <Description variant="h1" className="m-auto mt-4 text-black">
              {t("agree")}
            </Description>

            {/* Submit button */}
            {!readOnly && (
              <div className="mt-4 flex justify-center gap-3">
                <SubmitButton
                  title={ t("submit")}
                  Icon={isEditMode ? FaEdit : FaPaperPlane}
                  color="info-dark"
                  disabled={submitButtonDisabled}
                  fullWidth={false}
                />
                
                {/* Cancel button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
                  disabled={submitButtonDisabled}
                >
                  {t("cancel")}
                </button>
              </div>
            )}
          </Form>
        </div>
      </div>

      {/* ---------- Modal (only for create mode) ---------- */}
      {!isEditMode && (
        <ErrorOrSuccessModal
          isOpen={modalOpen}
          isSuccess={modalSuccess}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
          onConfirm={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default CheckbookForm;