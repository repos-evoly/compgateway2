import React from "react";
import * as Yup from "yup";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import CheckboxWrapper from "@/app/components/FormUI/CheckboxWrapper";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import ResetButton from "@/app/components/FormUI/ResetButton";
import SelectWrapper from "@/app/components/FormUI/Select";
import { formFields } from "./internalFormFields";
import { FaCheck, FaTrash } from "react-icons/fa";
import { useTranslations } from "next-intl";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";

const InternalForm = () => {
  const initialValues = {
    fromAccount: "",
    toAccount: "",
    value: 0,
    currency: "",
    description: "",
    selectField: "", // New field for the select component
    recurring: false, // Recurring checkbox
  };

  const validationSchema = Yup.object({
    fromAccount: Yup.string().required("From account is required"),
    toAccount: Yup.string().required("To account is required"),
    value: Yup.number()
      .typeError("Value must be a number")
      .required("Value is required")
      .positive("Value must be greater than 0"),
    currency: Yup.string().required("Currency is required"),
    description: Yup.string().required("Description is required"),
    selectField: Yup.string().required("Please select an option"),
    recurring: Yup.boolean().default(false),
  });

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form Submitted:", values);
  };

  const t = useTranslations("internalTransferForm");

  // Options for the SelectWrapper
  const selectOptions = [
    { value: "onhold", label: t("onhold") },
    { value: "inactive", label: t("inactive") },
  ];

  return (
    <div className="p-6 bg-gray-100">
      {/* Title */}
      {/* <div className="flex justify-center mb-6">
        <h1 className="text-2xl font-bold text-center text-info-dark">
          {t("title")}
        </h1>
      </div> */}
      {/* Form */}
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {formFields.map((field) =>
          field.type === "checkbox" ? (
            <CheckboxWrapper
              key={field.name}
              name={field.name}
              label={t(field.name)}
            />
          ) : field.type === "date" ? (
            <DatePickerValue
              key={field.name}
              name={field.name}
              label={t(field.name)}
            />
          ) : (
            <FormInputIcon
              key={field.name}
              name={field.name}
              label={t(field.name)}
              startIcon={field.startIcon}
              type={field.type}
            />
          )
        )}

        {/* Recurring Checkbox and SelectWrapper aligned horizontally */}
        <div className="flex gap-6 items-center mt-4">
          <div className="flex-1">
            <SelectWrapper
              name="selectField"
              label={t("ends")}
              options={selectOptions}
            />
          </div>

          <div className="flex-1 mt-9">
            <CheckboxWrapper name="recurring" label={t("rec")} />
          </div>
        </div>

        {/* Submit and Reset Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <SubmitButton
            title={t("continue")}
            Icon={FaCheck}
            color="info-dark"
            fullWidth={false}
          />
          <ResetButton
            title={t("delete")}
            Icon={FaTrash}
            color="warning-light"
            fullWidth={false}
          />
        </div>
      </Form>
    </div>
  );
};

export default InternalForm;
