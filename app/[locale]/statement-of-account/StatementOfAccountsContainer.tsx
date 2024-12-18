import React, { useEffect, useState } from "react";
import {  useFormikContext } from "formik";
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

// Helper Component to Display Account Name Beside the Input
const AccountNameDisplay: React.FC = () => {
  const { values } = useFormikContext<StatementFormValues>();
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (values.accountNumber === "01-4011-0001") {
      setAccountName("عصمت العياش");
    } else {
      setAccountName("");
    }
  }, [values.accountNumber]);

  return accountName ? (
    <div className="text-gray-700 text-sm font-semibold whitespace-nowrap">
      {accountName}
    </div>
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

  const handleSubmit = async (values: StatementFormValues) => {
    console.log("Form Submitted:", values);
    onContinue();
  };

  return (
    <div className="bg-gray-100 shadow-lg w-3/4 rounded-md rounded-t-none p-6 mx-auto">
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {/* Account Number Field */}
        <div className="flex items-center gap-4 mb-4 w-full">
          <div className="w-3/5">
            <FormInputIcon
              name="accountNumber"
              label={t("account")}
              type="text"
            />
          </div>
          <AccountNameDisplay />
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
            color="info-dark"
            fullWidth={false}
          />
        </div>
      </Form>
    </div>
  );
};

export default StatementGenerator;
