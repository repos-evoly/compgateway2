"use client";

import React from "react";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaPaperPlane } from "react-icons/fa";
import Description from "@/app/components/FormUI/Description";

export type TCheckbookValues = {
  fullName: string;
  address: string;
  accountNumber: string;
  pleaseSend: string;
  branch: string;
  date: Date;
  bookContaining: string;
};

type TCheckbookFormProps = {
  onSubmit: (values: TCheckbookValues) => void;
  onCancel: () => void;
  // Optional: if provided, the form uses these as initial values for editing
  initialData?: TCheckbookValues | null;
};

const CheckbookForm = ({ onSubmit, onCancel, initialData }: TCheckbookFormProps) => {
  const t = useTranslations("checkForm");

  // Default initial values:
  const defaultValues: TCheckbookValues = {
    fullName: "",
    address: "",
    accountNumber: "",
    pleaseSend: "",
    branch: "",
    date: new Date(),
    bookContaining: "",
  };

  // Merge defaultValues with any provided initialData
  const initialValues: TCheckbookValues = initialData
    ? { ...defaultValues, ...initialData }
    : defaultValues;

  const validationSchema = Yup.object({
    fullName: Yup.string().required(`${t("name")} ${t("required")}`),
    address: Yup.string().required(`${t("address")} ${t("required")}`),
    accountNumber: Yup.string().required(`${t("accNum")} ${t("required")}`),
    pleaseSend: Yup.string().required(`${t("sendTo")} ${t("required")}`),
    branch: Yup.string().required(`${t("branch")} ${t("required")}`),
    date: Yup.date()
      .required(`${t("date")} ${t("required")}`)
      .typeError(`${t("invalidDate")}`),
    bookContaining: Yup.string().required(t("selectOneOption")),
  });

  const formFields = [
    {
      name: "fullName",
      label: t("name"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "address",
      label: t("address"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "accountNumber",
      label: t("accNum"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "pleaseSend",
      label: t("sendTo"),
      type: "text" as const,
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "branch",
      label: t("branch"),
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
  ];

  const handleSubmit = (values: TCheckbookValues) => {
    onSubmit(values);
  };

  return (
    <div className="mt-2 rounded w-full bg-gray-100">
      <div className="w-full bg-info-dark h-16 rounded-t-md"></div>
      <div className="px-6 pb-6">
        <Form
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formFields.map(({ component: Component, ...props }) => (
              <Component key={props.name} {...props} />
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

          {/* Book Containing (Radio Buttons) */}
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

          <Description variant="h1" className=" text-black m-auto mt-4">
            {t("agree")}
          </Description>

          {/* Buttons */}
          <div className="mt-6 flex space-x-2">
            <SubmitButton
              title={t("submit")}
              Icon={FaPaperPlane}
              color="info-dark"
            />
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-black rounded"
            >
              {t("cancel")}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CheckbookForm;
