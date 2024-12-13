"use client";

import React, { useState } from "react";
import SingleRow from "../CBLForm/SingleRow"; // Reusable SingleRow component
import Checkbox from "../../reusable/CheckBox"; // Checkbox component
import CheckFieldsArray from "./CheckFieldsArray"; // Import the fields array
import { useTranslations } from "next-intl";

const CheckForm: React.FC = () => {
  const [formData, setFormData] = useState({
    checkNumber: "",
    bankName: "",
    checkAmount: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const t = useTranslations("checkForm");

  return (
    <div className="border border-gray-300 rounded-lg shadow-lg  mx-auto bg-white p-6 space-y-6">
      {/* Sections */}
      {CheckFieldsArray.map((section, index) => (
        <div key={index} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            {section.section ? t(section.section) : ""}
          </h2>
          {section.fields.map((field, fieldIndex) => {
            if (field.inputItems) {
              // Render SingleRow for inputItems
              return (
                <SingleRow
                  key={fieldIndex}
                  title={t(field.title)}
                  inputItems={{
                    ...field.inputItems,
                    inputType: field.inputItems.inputType || "text", // Default to "text" if undefined
                    inputValue:
                      formData[
                        field.inputItems.inputName as keyof typeof formData
                      ] || "",
                    onChange: (e) =>
                      handleChange(
                        field.inputItems?.inputName || "",
                        e.target.value
                      ),
                  }}
                />
              );
            } else if (field.checkboxItems) {
              // Render checkboxes for checkboxItems
              return (
                <div
                  key={fieldIndex}
                  className="flex space-x-6 rtl:space-x-reverse"
                >
                  <h2>{t("book")}</h2>
                  <div className="flex flex-wrap gap-4">
                    {field.checkboxItems.map((checkbox, checkboxIndex) => (
                      <Checkbox
                        key={checkboxIndex}
                        label={checkbox.label}
                        checked={checkbox.checked}
                        onChange={checkbox.onChange}
                      />
                    ))}
                  </div>
                  <h2>{t("checkbox")}</h2>
                  <Checkbox
                    label=""
                    checked={true}
                    onChange={(e) => console.log(e.target.checked)}
                  />
                </div>
              );
            } else {
              // If no inputItems or checkboxItems, render nothing
              return null;
            }
          })}
        </div>
      ))}

      <div className="flex flex-wrap items-start gap-6 rtl:space-x-reverse">
        <div className="flex flex-col items-center justify-center my-6 w-1/5">
          {/* Top Text */}
          <span className="text-green-800 text-xl font-bold mb-2">
            {t("for")}
          </span>

          {/* Line with text on both sides */}
          <div className="flex items-center w-full max-w-sm justify-between">
            <span className="text-green-800 text-lg font-medium">
              {t("checks")}
            </span>
            <div className="flex-grow border-t border-green-800 mx-4"></div>
            <span className="text-green-800 text-lg font-medium">
              {t("forUse")}
            </span>
          </div>

          {/* Bottom Text */}
          <span className="text-green-800 text-lg font-medium mt-2">
            {t("holder")}
          </span>
        </div>

        <div className="flex-grow">
          <SingleRow
            title={t("branch")}
            inputItems={{
              inputType: "text",
              inputID: "branch",
              inputName: "branch",
              inputValue: "", // Replace with a state or dynamic value
              onChange: () => {}, // Replace with a function to handle the input change
              error: [], // Add error messages if needed
              required: true,
            }}
            extraText={t("specificTo")}
          />
        </div>

        <div className="flex flex-col items-center justify-center my-6 w-1/5 rtl:space-x-reverse">
          {/* Top Text */}
          <span className="text-green-800 text-xl font-bold mb-2">
            {t("email")}
          </span>

          {/* Line with text on both sides */}
          <div className="flex items-center w-full max-w-sm justify-between">
            <span className="text-green-800 text-lg font-medium"></span>
            <div className="flex-grow border-t border-green-800 mx-4"></div>
            <span className="text-green-800 text-lg font-medium"></span>
          </div>

          {/* Bottom Text */}
          <span className="text-green-800 text-lg font-medium mt-2">
            {t("savedUntil")}
          </span>
        </div>
      </div>

      <div className="text-center text-xl font-bold mt-6">{t("erase")}</div>
      <div className="text-center text-xl font-bold mt-6">{t("agree")}</div>

      {/* Replace DoubleRow with SingleRow */}
      <SingleRow
        title={t("date")}
        inputItems={{
          inputType: "date",
          inputID: "date",
          inputName: "date",
          inputValue: "", // Replace with a state or dynamic value
          onChange: () => {}, // Replace with a function to handle the input change
          error: [], // Add error messages if needed
          required: true,
        }}
      />

      <div className="text-center text-xl font-bold mt-6">{t("note")}</div>
    </div>
  );
};

export default CheckForm;
