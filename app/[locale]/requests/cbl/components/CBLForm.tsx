"use client";

import React, { useState } from "react";
import { FormikHelpers } from "formik";
import { useTranslations } from "use-intl";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaTimes, FaUser } from "react-icons/fa";

import Table from "@/app/components/forms/CBLForm/Table";
import InfoBox from "@/app/components/forms/CBLForm/InfoBox";

import { getColumns, fields, initialValues as defaultVals } from "../data";
import { CBLFormProps, TCBLValues } from "../types";

import { addCblRequest } from "../service";
import CancelButton from "@/app/components/FormUI/CancelButton";

const CBLForm: React.FC<CBLFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const t = useTranslations("cblForm");

  // Track if we're currently submitting to avoid double-submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge defaults with any partial values, then cast to TCBLValues
  const mergedValues: TCBLValues = {
    id: 0, // default ID in case initialValues doesn't have one
    ...defaultVals,
    ...initialValues,
  };

  // Prepare columns for the table
  const columns = getColumns(t);
  const columns1 = columns.table1;
  const columns2 = columns.table2;

  // The dynamic field definitions
  const formFields = fields(t);

  // We'll define the "sections" just like the original page
  const sections = [
    {
      title: t("generalInformation"),
      fields: formFields.slice(0, 5),
      gridCols: "grid-cols-1 md:grid-cols-3",
    },
    {
      title: t("financialInformation"),
      fields: formFields.slice(5, 15),
      gridCols: "grid-cols-1 md:grid-cols-4",
    },
    {
      title: t("representativeInformation"),
      fieldGroups: [
        { fields: formFields.slice(15, 17), gridCols: "grid-cols-2" },
        { fields: formFields.slice(17, 20), gridCols: "grid-cols-3" },
        { fields: formFields.slice(20, 23), gridCols: "grid-cols-3" },
        { fields: formFields.slice(23), gridCols: "grid-cols-2" },
      ],
    },
  ];

  // Handle form submission -> call API
  const handleSubmit = async (
    values: TCBLValues,
    helpers: FormikHelpers<TCBLValues>
  ) => {
    // If already submitting, do nothing
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Call the API to create a new record
      await addCblRequest(values);

      // Show success or handle success
      alert("CBL request created successfully!");

      // Optionally call parent onSubmit
      onSubmit(values, helpers);
    } catch (error) {
      console.error("Failed to create CBL request:", error);
      alert("An error occurred while creating the CBL request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full bg-info-dark h-16 rounded-t-md mb-0"></div>

      <div className="px-6 bg-gray-100 -mt-6 py-2">
        {/* No validationSchema to allow testing */}
        <Form initialValues={mergedValues} onSubmit={handleSubmit}>
          {/* Dynamic sections */}
          {sections.map((section, index) => (
            <div className="mt-6" key={index}>
              <h2 className="text-lg font-bold text-gray-800">
                {section.title}
              </h2>
              {section.fieldGroups ? (
                section.fieldGroups.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className={`grid ${group.gridCols} gap-4 mt-4`}
                  >
                    {group.fields.map((field, fieldIndex) => {
                      const FieldComponent = field.component;
                      return (
                        <div key={fieldIndex} className="w-full">
                          <FieldComponent
                            name={field.name}
                            label={field.label}
                            type={field.type}
                            startIcon={field.icon || null}
                            titlePosition={
                              field.component === DatePickerValue
                                ? "top"
                                : undefined
                            }
                            textColor="text-gray-700"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className={`grid ${section.gridCols} gap-4 mt-4`}>
                  {section.fields.map((field, fieldIndex) => {
                    const FieldComponent = field.component;
                    return (
                      <div key={fieldIndex} className="w-full">
                        <FieldComponent
                          name={field.name}
                          label={field.label}
                          type={field.type}
                          startIcon={field.icon || null}
                          titlePosition={
                            field.component === DatePickerValue
                              ? "top"
                              : undefined
                          }
                          textColor="text-gray-700"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Table + InfoBox */}
          <div className="flex w-full gap-6">
            <div className="flex flex-col gap-6 flex-1">
              <Table title={t("table1.title")} columns={columns1} />
              <div className="flex-grow bg-gray-100 rounded-lg shadow-sm border border-gray-300 flex items-center justify-center" />
              <Table title={t("table2.title")} columns={columns2} />
            </div>

            <div className="flex-1">
              <InfoBox />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800">
              {t("additionalInformation")}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <DatePickerValue
                name="packingDate"
                label={t("packingDate")}
                textColor="text-gray-700"
              />
              <FormInputIcon
                name="specialistName"
                label={t("specialistName")}
                type="text"
                textColor="text-gray-700"
                startIcon={<FaUser />}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex justify-center items-center gap-2">
            <SubmitButton
              title="Submit"
              color="info-dark"
              // Icon defaults to FaPaperPlane now, so no need to pass Icon
              fullWidth={false}
              disabled={isSubmitting}
            />
            {onCancel && (
              <CancelButton
                title="Cancel"
                Icon={FaTimes}
                onClick={onCancel}
                disabled={isSubmitting}
                fullWidth={false}
              />
            )}
          </div>
        </Form>
      </div>
    </>
  );
};

export default CBLForm;
