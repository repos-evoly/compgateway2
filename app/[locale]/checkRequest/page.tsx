"use client";

import React from "react";
import * as Yup from "yup";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaPaperPlane } from "react-icons/fa";
import CheckRequestTable from "@/app/components/forms/CheckRequestForm/Table";
import { useTranslations } from "next-intl";
import Description from "@/app/components/FormUI/Description";
import { FormikHelpers } from "formik";

const Page = () => {
  const t = useTranslations("CheckRequest");
  const initialValues = {
    branch: "",
    branchNum: "",
    date: new Date(),
    customerName: "",
    cardNum: "",
    accountNum: "",
    beneficiary: "",
    tableData: Array(3).fill({ dirham: "", lyd: "" }), // For the dynamic table inputs
  };

  const validationSchema = Yup.object({
    branch: Yup.string().required("Branch is required"),
    branchNum: Yup.string().required("Branch number is required"),
    date: Yup.date().required("Date is required").typeError("Invalid date"),
    customerName: Yup.string().required("Customer name is required"),
    cardNum: Yup.string()
      .required("Card number is required")
      .matches(/^\d{16}$/, "Card number must be 16 digits"),
    accountNum: Yup.string().required("Account number is required"),
    beneficiary: Yup.string().required("Beneficiary is required"),
    tableData: Yup.array()
      .of(
        Yup.object().shape({
          dirham: Yup.string().required("Dirham value is required"),
          lyd: Yup.string().required("LYD value is required"),
        })
      )
      .required()
      .min(3, "Table must have at least 3 rows"),
  });

  const handleSubmit = (
    values: typeof initialValues,
    { setTouched }: FormikHelpers<typeof initialValues>
  ) => {
    // Manually construct the touched object
    const touchedTableData = values.tableData.map(() => ({
      dirham: true,
      lyd: true,
    }));

    const touchedFields = {
      branch: true,
      branchNum: true,
      date: true,
      customerName: true,
      cardNum: true,
      accountNum: true,
      beneficiary: true,
      tableData: touchedTableData,
    };

    setTouched(touchedFields);

    console.log("Form submitted with values:", values);
  };

  const formFields = [
    {
      name: "branch",
      label: t("branch"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "branchNum",
      label: t("branchNum"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "date",
      label: t("date"),
      component: DatePickerValue,
      width: "w-full",
    },
    {
      name: "customerName",
      label: t("customerName"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "cardNum",
      label: t("cardNum"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "accountNum",
      label: t("accountNum"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "beneficiary",
      label: t("beneficiary"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
  ];

  return (
    <div className="mt-10 rounded w-full bg-gray-100">
      <div className="w-full bg-info-dark h-16 rounded-t-md"></div>
      <div className="px-6 pb-6">
        <Form
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formFields.map(({ component: Component, ...fieldProps }) => (
              <Component key={fieldProps.name} {...fieldProps} />
            ))}
          </div>

          <div className="mt-6">
            <CheckRequestTable />
          </div>

          <Description
            variant="h3"
            className="text-black font-bold text-center"
          >
            {t("note")}
          </Description>

          {/* Submit Button */}
          <div className="mt-6">
            <SubmitButton
              title="Submit"
              Icon={FaPaperPlane}
              color="info-dark"
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Page;
