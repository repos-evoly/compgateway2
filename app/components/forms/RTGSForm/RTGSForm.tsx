"use client";

import React, { useState } from "react";
import SingleRow from "../CBLForm/SingleRow"; // Use the SingleRow component
import FormType from "./FormType";
import RTGSFieldsArray, { FormTypeFields } from "./RTGSFieldsArray"; // Import the fields array
import ComponentsTitle from "../../reusable/ComponentsTitle";
import { useTranslations } from "next-intl";
import RTGSFooter from "./RTGSFooter";

const RTGSForm: React.FC = () => {
  const [formData, setFormData] = useState({
    accountNo: "",
    applicantName: "",
    address: "",
    beneficiaryName: "",
    beneficiaryAccountNo: "",
    beneficiaryBank: "",
    branchName: "",
    amount: "",
    remittanceInfo: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [formType, setFormType] = useState<{ [key: string]: boolean }>({
    ACH: false,
    RTGS: false,
  });

  const handleFormTypeChange = (label: string, checked: boolean) => {
    setFormType((prev) => ({ ...prev, [label]: checked }));
  };

  const t = useTranslations("RTGSForm");

  // Remove signature pads by excluding the footer section entirely
  const filteredFieldsArray = RTGSFieldsArray.filter(
    (section) => section.section !== "footer"
  );

  return (
    <div className="border border-gray-300 rounded-lg shadow-lg  mx-auto bg-white p-6 space-y-6">
      <ComponentsTitle title={t("title")} subtitle={t("subtitle")} />
      {/* ACH/RTGS Checkboxes */}
      <FormType
        options={[
          { label: t("ach"), checked: formType.ACH },
          { label: t("rtgs"), checked: formType.RTGS },
        ]}
        onChange={handleFormTypeChange}
        doubleRowInputs={{
          textInput: {
            title: t(FormTypeFields[0].title),
            inputType: FormTypeFields[0].inputType,
            inputID: FormTypeFields[0].inputID,
            inputName: FormTypeFields[0].inputName,
            inputValue: FormTypeFields[0].inputValue,
            onChange: FormTypeFields[0].onChange,
          },
          dateInput: {
            title: t(FormTypeFields[1].title),
            inputType: FormTypeFields[1].inputType,
            inputID: FormTypeFields[1].inputID,
            inputName: FormTypeFields[1].inputName,
            inputValue: FormTypeFields[1].inputValue,
            onChange: FormTypeFields[1].onChange,
          },
        }}
      />

      {/* Sections */}
      {filteredFieldsArray.map((section, index) => (
        <div key={index} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800">
            {section.section ? t(section.section) : ""}
          </h2>
          {section.fields.map((field, fieldIndex) =>
            field.inputItems ? (
              <SingleRow
                key={fieldIndex}
                title={t(field.title)}
                inputItems={{
                  ...field.inputItems,
                  inputType: field.inputItems.inputType || "text", // Default to "text" if undefined
                  inputValue:
                    formData[
                      field.inputItems.inputName as keyof typeof formData
                    ],
                  onChange: (e) =>
                    handleChange(
                      field.inputItems?.inputName || "",
                      e.target.value
                    ),
                }}
              />
            ) : null
          )}
        </div>
      ))}

      <RTGSFooter />
    </div>
  );
};

export default RTGSForm;
