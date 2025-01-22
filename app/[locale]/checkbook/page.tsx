"use client";

import React from "react";
import * as Yup from "yup";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaPaperPlane } from "react-icons/fa";
import { useTranslations } from "next-intl";
import Description from "@/app/components/FormUI/Description";

const Page = () => {
  const t = useTranslations("checkForm");
  const initialValues = {
    fullName: "",
    address: "",
    accountNumber: "",
    pleaseSend: "",
    branch: "",
    date: new Date(),
    bookContaining: "",
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    address: Yup.string().required("Address is required"),
    accountNumber: Yup.string().required("Account number is required"),
    pleaseSend: Yup.string().required("Please send is required"),
    branch: Yup.string().required("Branch is required"),
    date: Yup.date().required("Date is required").typeError("Invalid date"), // Use Yup.date()
    bookContaining: Yup.string().required("Select one option"),
  });

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form submitted with values:", values);
    // Handle form submission logic
  };

  const formFields = [
    {
      name: "fullName",
      label: t("name"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "address",
      label: t("address"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "accountNumber",
      label: t("accNum"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "pleaseSend",
      label: t("sendTo"),
      type: "text",
      component: FormInputIcon,
      width: "w-full",
    },
    {
      name: "branch",
      label: t("branch"),
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
  ];

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
            {formFields.map(({ component: Component, ...fieldProps }) => (
              <Component key={fieldProps.name} {...fieldProps} />
            ))}
          </div>

          {/* Book Containing (Radio Buttons) */}
          <div className="mt-4">
            <RadiobuttonWrapper
              name="bookContaining"
              label={t("book")} // Translated label for the group
              options={[
                { value: "24", label: "24" }, // Static label
                { value: "48", label: "48" }, // Static label
              ]}
              t={(key) => key} // Identity function for static labels
            />
          </div>

          <Description variant="h1" className=" text-black m-auto mt-4">
            {t("agree")}
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
