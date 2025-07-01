"use client";

import React, { useState } from "react";
import { FormikHelpers } from "formik";
import { useTranslations } from "use-intl";
// ⬇️ add with the other imports
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { FaUser } from "react-icons/fa";

import Table from "@/app/[locale]/requests/cbl/components/Table";
import InfoBox from "@/app/[locale]/requests/cbl/components/InfoBox";

import { getColumns, fields, initialValues as defaultVals } from "../data";
import { CBLFormProps, TCBLValues } from "../types";

import { addCblRequest } from "../service";
import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";

/**
 * A CBL form that, if readOnly => disables fields + hides buttons
 */
const CBLForm: React.FC<CBLFormProps> = ({
  initialValues,
  onSubmit,
  readOnly = false,
}) => {
  const t = useTranslations("cblForm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ⬇️ add right after: const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Merge defaults + incoming
  const mergedValues: TCBLValues = {
    id: 0,
    ...defaultVals,
    ...initialValues,
  };

  // Prepare columns for the table
  const columns = getColumns(t);
  const columns1 = columns.table1;
  const columns2 = columns.table2;

  // The dynamic field definitions
  const formFields = fields(t);

  // We'll define the "sections" just like your original
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

  // Handle form submission => do nothing if readOnly
  // Handle form submission
  const handleSubmit = async (
    values: TCBLValues,
    helpers: FormikHelpers<TCBLValues>
  ) => {
    if (readOnly || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addCblRequest(values);

      /* ── success modal ── */
      setModalTitle(t("createSuccessTitle")); // e.g. "Created!"
      setModalMessage(t("createSuccessMessage")); // e.g. "CBL request saved."
      setModalSuccess(true);
      setModalOpen(true);

      onSubmit?.(values, helpers);
    } catch (error) {
      console.error("Failed to create CBL request:", error);

      /* ── error modal ── */
      setModalTitle(t("createErrorTitle")); // e.g. "Error"
      setModalMessage(
        error instanceof Error ? error.message : t("unknownError")
      );
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FormHeader>
        <div className="pb-5">
          <BackButton
            fallbackPath="/requests/cbl"
            isEditing={initialValues !== undefined}
          />
        </div>
      </FormHeader>
      <div className="px-6 bg-gray-100 -mt-6 py-2">
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
                            disabled={readOnly} // DISABLE fields if readOnly
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
                          disabled={readOnly} // DISABLE fields if readOnly
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
            <div className="flex flex-1 flex-col gap-6">
              {/* Table 1 */}
              <Table
                title={t("table1.title")}
                columns={columns1}
                fieldNamePrefix="table1Rows"
                readOnly={readOnly}
              />

              <div className="flex-grow rounded-lg border border-gray-300 bg-gray-100 shadow-sm" />

              {/* Table 2 */}
              <Table
                title={t("table2.title")}
                columns={columns2}
                fieldNamePrefix="table2Rows"
                readOnly={readOnly}
              />
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
                disabled={readOnly}
              />
              <FormInputIcon
                name="specialistName"
                label={t("specialistName")}
                type="text"
                textColor="text-gray-700"
                startIcon={<FaUser />}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Buttons => hidden if readOnly */}
          {!readOnly && (
            <div className="px-6 pb-6 flex justify-center items-center gap-2">
              <SubmitButton
                title="Submit"
                color="info-dark"
                fullWidth={false}
                disabled={isSubmitting}
              />
            </div>
          )}
        </Form>
      </div>
      {/* ⬇️ paste just before the closing fragment */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </>
  );
};

export default CBLForm;
