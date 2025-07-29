import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TSalaryFormValues } from "../types";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import FormHeader from "@/app/components/reusable/FormHeader";
import { useTranslations } from "next-intl";

export type SalariesFormProps = {
  initialValues?: Partial<TSalaryFormValues>;
  onSubmit: (values: TSalaryFormValues) => void;
  onCancel?: () => void;
};

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  salary: Yup.number().typeError("Salary must be a number").required("Salary is required"),
  date: Yup.string().required("Date is required"),
  accountNumber: Yup.string(), // optional
});

const SalariesForm: React.FC<SalariesFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const t = useTranslations("salaries");
  const defaultValues: TSalaryFormValues = {
    name: "",
    email: "",
    phone: "",
    salary: undefined,
    date: "",
    accountNumber: "",
    sendSalary: false,
    canPost: false,
  };

  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 p-4 bg-gray-50 rounded-md">
          <FormHeader
            showBackButton={true}
            fallbackPath="/salaries"
            onBack={onCancel}
            isEditing={true}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputIcon name="name" label={t("name")} type="text" />
            <FormInputIcon name="email" label={t("email")} type="email" />
            <FormInputIcon name="phone" label={t("phone")} type="text" />
            <FormInputIcon name="salary" label={t("salary")} type="number" />
            <DatePickerValue name="date" label={t("date")} />
            <FormInputIcon name="accountNumber" label={t("accountNumber")} type="text" />
          </div>
          <div className="flex gap-4 mt-6">
            <SubmitButton title={t("submit", { defaultValue: "Submit" })} color="info-dark" disabled={isSubmitting} />
            {onCancel && (
              <button
                type="button"
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t("cancel", { defaultValue: "Cancel" })}
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SalariesForm;
