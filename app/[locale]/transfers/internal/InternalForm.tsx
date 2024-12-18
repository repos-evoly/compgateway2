import React from "react";
import * as Yup from "yup";
import { useFormikContext } from "formik";
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
import { FormInputIconProps } from "@/types";

type SpecialFieldWrapperProps = {
  field: FormInputIconProps;
  t: (key: string) => string; // Properly typed translation function
};

type InternalFormValues = {
  from: string;
  to: string;
  value: number;
  curr: string;
  description: string;
  selectField: string;
  recurring: boolean;
  date?: string; // Optional date field for the recurring checkbox
};

const SpecialFieldWrapper = ({ field, t }: SpecialFieldWrapperProps) => {
  const { values } = useFormikContext<InternalFormValues>();

  // Determine special display logic
  let accountName = "";
  let balance = "";

  if (field.name === "from" && values.from === "test") {
    accountName = "عصمت العياش";
    balance = `${t("balance") || "Balance"}: 1000`;
  } else if (field.name === "to" && values.to === "test") {
    accountName = "نادر خداج";
  }

  return (
    <div className="flex items-center gap-6">
      <div className={`${field.width || "w-full"}`}>
        <FormInputIcon
          name={field.name}
          label={t(field.name)}
          startIcon={field.startIcon}
          type={field.type}
        />
      </div>

      {/* Special content for account name and balance */}
      {accountName && (
        <div className="flex gap-4 items-center text-gray-800">
          <span className="text-lg font-semibold">{accountName}</span>
          {balance && (
            <span className="text-lg font-medium text-green-600">
              {balance}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const InternalForm = () => {
  const initialValues = {
    from: "",
    to: "",
    value: 0,
    curr: "",
    description: "",
    selectField: "",
    recurring: false,
  };

  const validationSchema = Yup.object({
    from: Yup.string().required("From account is required"),
    to: Yup.string().required("To account is required"),
    value: Yup.number()
      .typeError("Value must be a number")
      .required("Value is required")
      .positive("Value must be greater than 0"),
    curr: Yup.string().required("Currency is required"),
    description: Yup.string().required("Description is required"),
    selectField: Yup.string().required("Please select an option"),
    recurring: Yup.boolean().default(false),
  });

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form Submitted:", values);
  };

  const t = useTranslations("internalTransferForm");

  const selectOptions = [
    { value: "onhold", label: t("onhold") },
    { value: "inactive", label: t("inactive") },
  ];

  return (
    <div className="p-6 bg-gray-100">
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {/* Dynamically render fields */}
        <div className="grid grid-cols-1 gap-y-6">
          {formFields.map((field) => (
            <div key={field.name}>
              {/* Wrap 'from' and 'to' fields with special logic */}
              {["from", "to"].includes(field.name) ? (
                <SpecialFieldWrapper field={field} t={t} />
              ) : field.type === "checkbox" ? (
                <CheckboxWrapper name={field.name} label={t(field.name)} />
              ) : field.type === "date" ? (
                <DatePickerValue name={field.name} label={t(field.name)} />
              ) : (
                <div className={`${field.width || "w-full"}`}>
                  <FormInputIcon
                    name={field.name}
                    label={t(field.name)}
                    startIcon={field.startIcon}
                    type={field.type}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recurring Checkbox and SelectWrapper */}
        <div className="flex gap-6 items-center mt-4">
          <div className="flex-1 mt-5">
            <CheckboxWrapper name="recurring" label={t("rec")} />
          </div>
          <div className="flex-1">
            <DatePickerValue
              name="date"
              label={t("ends")}
              titlePosition="side"
            />
          </div>
        </div>

        <div className="w-1/4 mt-4">
          <SelectWrapper
            name="selectField"
            label={t("status")}
            options={selectOptions}
          />
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
