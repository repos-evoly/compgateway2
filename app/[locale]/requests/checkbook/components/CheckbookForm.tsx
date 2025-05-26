"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import * as Yup from "yup";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import Description from "@/app/components/FormUI/Description";

import type { TCheckbookFormValues } from "../types";
import { createCheckbookRequest } from "../services";
import CancelButton from "@/app/components/FormUI/CancelButton";

type TCheckbookFormProps = {
  onSubmit: (newItem: TCheckbookFormValues) => void;
  onCancel: () => void;
  initialData?: TCheckbookFormValues | null;
};

const CheckbookForm: React.FC<TCheckbookFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const t = useTranslations("checkForm");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default initial values
  const defaultValues: TCheckbookFormValues = {
    fullName: "",
    address: "",
    accountNumber: "",
    pleaseSend: "",
    branch: "",
    date: "",
    bookContaining: "",
  };

  // Merge defaultValues with any provided initialData
  const initialValues: TCheckbookFormValues = initialData
    ? { ...defaultValues, ...initialData }
    : defaultValues;

  // Validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string().required(`${t("name")} ${t("required")}`),
    address: Yup.string().required(`${t("address")} ${t("required")}`),
    accountNumber: Yup.string().required(`${t("accNum")} ${t("required")}`),
    pleaseSend: Yup.string().required(`${t("sendTo")} ${t("required")}`),
    branch: Yup.string().required(`${t("branch")} ${t("required")}`),
    date: Yup.string().required(`${t("date")} ${t("required")}`),
    bookContaining: Yup.string().required(t("selectOneOption")),
  });

  // On form submit -> create new record
  const handleSubmit = async (values: TCheckbookFormValues) => {
    if (isSubmitting) return; // prevent double-click
    setIsSubmitting(true);

    try {
      // 1) POST to server, get the newly created record
      const newItem = await createCheckbookRequest(values);

      // 2) Pass newItem to parent -> update grid
      onSubmit(newItem);
    } catch (error) {
      console.error("Failed to create checkbook request:", error);
      alert("Error creating checkbook request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 rounded w-full bg-gray-100">
      {/* Header styling */}
      <div className="w-full bg-info-dark h-16 rounded-t-md"></div>

      <div className="px-6 pb-6">
        <Form
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "fullName",
                label: t("name"),
                type: "text" as const,
                component: FormInputIcon,
              },
              {
                name: "address",
                label: t("address"),
                type: "text" as const,
                component: FormInputIcon,
              },
              {
                name: "accountNumber",
                label: t("accNum"),
                type: "text" as const,
                component: FormInputIcon,
              },
              {
                name: "pleaseSend",
                label: t("sendTo"),
                type: "text" as const,
                component: FormInputIcon,
              },
              {
                name: "branch",
                label: t("branch"),
                type: "text" as const,
                component: FormInputIcon,
              },
              {
                name: "date",
                label: t("date"),
                component: DatePickerValue,
              },
            ].map(({ component: Comp, ...field }) => (
              <Comp key={field.name} {...field} width="w-full" />
            ))}
          </div>

          {/* File Upload Input */}
          <div className="mt-4">
            <label
              htmlFor="representativePassport"
              className="block text-sm font-medium text-gray-700"
            >
              صورة جواز المندوب
            </label>
            <input
              id="representativePassport"
              name="representativePassport"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700"
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
            />
          </div>

          <Description variant="h1" className="text-black m-auto mt-4">
            {t("agree")}
          </Description>

          {/* Buttons */}
          <div className="mt-4 flex justify-center items-center gap-3 ">
            <SubmitButton
              title={t("submit")}
              Icon={FaPaperPlane}
              color="info-dark"
              disabled={isSubmitting}
              fullWidth={false}
            />
            <CancelButton
              title={t("cancel")}
              onClick={onCancel}
              disabled={isSubmitting}
              fullWidth={false}
              Icon={FaTimes}
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CheckbookForm;
