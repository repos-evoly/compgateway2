/* --------------------------------------------------------------------------
 * app/[locale]/requests/checkbook/components/CheckbookForm.tsx
 * Account Number field now uses <InputSelectCombo> (cookie‑based options)
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
import { FaPaperPlane } from "react-icons/fa";
import Description from "@/app/components/FormUI/Description";

import { createCheckbookRequest } from "../services";
import { TCheckbookFormProps, TCheckbookFormValues } from "../types";
import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

const CheckbookForm: React.FC<TCheckbookFormProps> = ({
  onSubmit,
  initialData,
  readOnly = false,
}) => {
  const t = useTranslations("checkForm");

  /* submitting flag */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* account dropdown options */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
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

  /* default values */
  const defaultValues: TCheckbookFormValues = {
    fullName: "",
    address: "",
    accountNumber: "",
    pleaseSend: "",
    branch: "",
    date: "",
    bookContaining: "",
  };
  const initialValues = initialData
    ? { ...defaultValues, ...initialData }
    : defaultValues;

  /* validation */
  const schema = Yup.object({
    fullName: Yup.string().required(`${t("name")} ${t("required")}`),
    address: Yup.string().required(`${t("address")} ${t("required")}`),
    accountNumber: Yup.string().required(`${t("accNum")} ${t("required")}`),
    pleaseSend: Yup.string().required(`${t("sendTo")} ${t("required")}`),
    branch: Yup.string().required(`${t("branch")} ${t("required")}`),
    date: Yup.string().required(`${t("date")} ${t("required")}`),
    bookContaining: Yup.string().required(t("selectOneOption")),
  });

  /* submit */
  const handleSubmit = async (values: TCheckbookFormValues) => {
    if (readOnly || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newItem = await createCheckbookRequest(values);
      onSubmit(newItem);

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
      setIsSubmitting(false);
    }
  };

  /* render */
  return (
    <>
      <div className="mt-2 rounded w-full bg-gray-100">
        <FormHeader>
          <BackButton
            fallbackPath="/requests/checkbook"
            isEditing={initialData !== undefined}
          />
        </FormHeader>

        <div className="px-6 pb-6">
          <Form
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={schema}
          >
            {/* inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              ].map((f) => (
                <FormInputIcon
                  key={f.name}
                  {...f}
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

            {/* radio */}
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

            <Description variant="h1" className="text-black m-auto mt-4">
              {t("agree")}
            </Description>

            {!readOnly && (
              <div className="mt-4 flex justify-center gap-3">
                <SubmitButton
                  title={t("submit")}
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

      {/* modal */}
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

export default CheckbookForm;
