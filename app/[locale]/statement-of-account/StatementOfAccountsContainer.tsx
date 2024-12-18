import React, { useEffect, useState } from "react";
import { Formik, FormikHelpers, useFormikContext } from "formik";
import * as Yup from "yup";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaArrowRight } from "react-icons/fa";
import { useTranslations } from "next-intl";

type StatementFormValues = {
  accountNumber: string;
  fromDate: string;
  toDate: string;
};

type StatementGeneratorProps = {
  onContinue: () => void; // Callback to notify when Continue is pressed
};

// Helper Component to Display Account Name
const AccountNameDisplay: React.FC = () => {
  const { values } = useFormikContext<StatementFormValues>();
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const formatRegex = /^\d{2}-\d{4}-\d{4}$/;
    if (formatRegex.test(values.accountNumber)) {
      setAccountName("عصمت العياش");
    } else {
      setAccountName("");
    }
  }, [values.accountNumber]);

  return accountName ? (
    <div className="mt-2 text-sm font-medium text-gray-700">{accountName}</div>
  ) : null;
};

const StatementGenerator: React.FC<StatementGeneratorProps> = ({
  onContinue,
}) => {
  const t = useTranslations("statementOfAccount");

  const initialValues: StatementFormValues = {
    accountNumber: "",
    fromDate: "",
    toDate: "",
  };

  const validationSchema = Yup.object({
    accountNumber: Yup.string().required(t("account") + " is required"),
    fromDate: Yup.string().required(t("from") + " is required"),
    toDate: Yup.string().required(t("to") + " is required"),
  });

  const handleSubmit = async (
    values: StatementFormValues,
    { resetForm }: FormikHelpers<StatementFormValues>
  ) => {
    console.log("Form Submitted:", values);
    onContinue();
    resetForm();
  };

  return (
    <div className="bg-white shadow-lg w-1/2 rounded-md p-6 m-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {/* Account Number Field */}
          <div className="mb-4 w-full">
            <div className="w-2/5">
              <FormInputIcon
                name="accountNumber"
                label={t("account")}
                type="text"
              />
              <AccountNameDisplay />
            </div>
          </div>

          {/* Date Fields */}
          <div className="flex gap-4 mb-4 items-center">
            <div className="w-2/5">
              <DatePickerValue name="fromDate" label={t("from")} />
            </div>
            <div className="w-2/5">
              <DatePickerValue name="toDate" label={t("to")} />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <SubmitButton
              title={t("continue")}
              Icon={FaArrowRight}
              color="info-main"
              fullWidth={false}
            />
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default StatementGenerator;
