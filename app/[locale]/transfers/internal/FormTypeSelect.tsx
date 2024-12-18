"use client";

import React from "react";
import { Formik, Form } from "formik";
import RadiobuttonWrapper from "@/app/components/FormUI/Radio";

interface FormValues {
  formType: string; // The value will be one of the radio button options
}

const FormTypeSelect: React.FC = () => {
  const options = [
    { value: "inbank", label: "In Bank" },
    { value: "betweenbanks", label: "Between Banks" },
  ];

  const initialValues: FormValues = { formType: "" };

  const handleSubmit = (values: FormValues) => {
    console.log("Form Submitted:", values);
  };

  return (
    <Formik<FormValues> initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values }) => (
        <Form className="w-full p-4 bg-gray-100 rounded-lg shadow-md">
          <RadiobuttonWrapper
            name="formType"
            label="Select Transaction Type"
            options={options}
            flexDir={["row", "row"]}
          />
          <div className="mt-4">
            {/* Conditional rendering based on selected type */}
            {values.formType === "inbank" && (
              <div className="border p-4 rounded-md bg-white shadow">
                <p className="text-center text-gray-500">In Bank Form</p>
              </div>
            )}
            {values.formType === "betweenbanks" && (
              <div className="border p-4 rounded-md bg-white shadow">
                <p className="text-center text-gray-500">Between Banks Form</p>
              </div>
            )}
            {!values.formType && (
              <div className="border p-4 rounded-md bg-white shadow">
                <p className="text-center text-gray-500">
                  Select a transaction type to display the corresponding form.
                </p>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default FormTypeSelect;
