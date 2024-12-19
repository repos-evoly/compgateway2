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

export type InternalFormValues = {
  from: string;
  to: string;
  value: number;
  curr: string;
  description: string;
  selectField: string;
  recurring: boolean;
  date?: string; // Optional date field for the recurring checkbox
  //   formType: string; // Added formType to InternalFormValues
};

type InternalFormProps = {
  initialData?: Partial<InternalFormValues>; // Optional prop for initial data
  onSubmit: (values: InternalFormValues) => void; // Required onSubmit function
};

type RecurringDateDisplayProps = {
  t: (key: string) => string; // Translation function
  isEditing: boolean; // Editing mode flag
  ends?: string; // Date to display if in editing mode
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

const RecurringDateDisplay = ({
  t,
  isEditing,
  ends,
}: RecurringDateDisplayProps) => {
  const { values } = useFormikContext<InternalFormValues>();

  if (isEditing) {
    // Show static date if in editing mode
    return values.recurring ? (
      <span className="text-sm mb-4 mx-4 text-gray-700">
        {t("ends")}: {ends || ""}
      </span>
    ) : null;
  } else {
    // Show DatePickerValue if checkbox is checked
    return values.recurring ? (
      <div className=" w-1/3">
        <DatePickerValue name="date" label={t("ends")} titlePosition="side" />
      </div>
    ) : null;
  }
};

const InternalForm = ({ initialData, onSubmit }: InternalFormProps) => {
  const isEditing = !!initialData; // Determine if it is editing mode
  const defaultValues: InternalFormValues = {
    from: "",
    to: "",
    value: 0,
    curr: "",
    description: "",
    selectField: "",
    recurring: false,
    date: "", // Default date
    // formType: ""
  };

  // Transform the initialData
  const transformedData = initialData
    ? {
        ...initialData,
        recurring: initialData.recurring === true, // Ensure boolean type for `recurring`
        date: initialData.date || initialData.date, // Use ends as default date in editing
      }
    : {};

  // Merge default values with transformed initial data
  const initialValues = { ...defaultValues, ...transformedData };

  // Log the data passed to the form
  console.log("InternalForm Initial Data:", initialData);
  console.log("InternalForm Initial Values:", initialValues);

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
    // formType: Yup.string().required("Form type is required")
  });

  //   const handleSubmit = (values: InternalFormValues) => {
  //     console.log("Form Submitted:", values);
  //   };

  const t = useTranslations("internalTransferForm");

  const selectOptions = [
    { value: "onhold", label: t("onhold") },
    { value: "inactive", label: t("inactive") },
  ];

  return (
    <div className="p-6 bg-gray-100">
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        enableReinitialize // Reinitialize form when initialData changes
      >
        {/* Dynamically render fields */}
        <div className="grid grid-cols-1 gap-y-6">
          {formFields.map((field) => (
            <div key={field.name}>
              {/* Wrap 'from' and 'to' fields with special logic */}
              {["from", "to"].includes(field.name) ? (
                <SpecialFieldWrapper field={field} t={t} />
              ) : field.type === "checkbox" ? (
                <CheckboxWrapper name="recurring" label={t(field.name)} />
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

        {/* Recurring Checkbox and Conditional Content */}
        <div className="flex items-center gap-4 mt-4">
          <div>
            <CheckboxWrapper name="recurring" label={t("rec")} />
          </div>
          <RecurringDateDisplay
            t={t}
            isEditing={isEditing}
            ends={initialData?.date}
          />
        </div>

        <div className="w-1/3 mt-4">
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
