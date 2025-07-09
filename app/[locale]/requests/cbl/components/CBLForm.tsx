/* --------------------------------------------------------------------------
   app/[locale]/requests/cbl/components/CBLForm.tsx
   – Current Account uses <InputSelectCombo> with cookie options
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FormikHelpers } from "formik";
import { useTranslations } from "use-intl";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import InputSelectCombo, {
  InputSelectComboOption,
} from "@/app/components/FormUI/InputSelectCombo";

import { FaUser } from "react-icons/fa";

import Table from "@/app/[locale]/requests/cbl/components/Table";
import InfoBox from "@/app/[locale]/requests/cbl/components/InfoBox";

import { getColumns, fields, initialValues as defaultVals } from "../data";
import { CBLFormProps, TCBLValues } from "../types";

import { addCblRequest } from "../service";
import BackButton from "@/app/components/reusable/BackButton";
import FormHeader from "@/app/components/reusable/FormHeader";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const CBLForm: React.FC<CBLFormProps> = ({
  initialValues,
  onSubmit,
  readOnly = false,
}) => {
  const t = useTranslations("cblForm");

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---- modal state ---- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /* ---- account dropdown options (cookie) ---- */
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  useEffect(() => {
    const raw = Cookies.get("statementAccounts") ?? "[]";
    let list: string[] = [];
    try {
      list = JSON.parse(raw);
    } catch {
      try {
        list = JSON.parse(decodeURIComponent(raw));
      } catch {
        list = [];
      }
    }
    setAccountOptions(list.map((acc) => ({ label: acc, value: acc })));
  }, []);

  /* ---- merged initial values ---- */
  const mergedValues: TCBLValues = {
    id: 0,
    ...defaultVals,
    ...initialValues,
  };

  /* ---- dynamic columns ---- */
  const columns = getColumns(t);
  const columns1 = columns.table1;
  const columns2 = columns.table2;

  /* ---- dynamic field schema ---- */
  const formFields = fields(t);
  const status =
    (initialValues as { status?: string } | undefined)?.status ?? undefined;

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

  /* ---- submit ---- */
  const handleSubmit = async (
    values: TCBLValues,
    helpers: FormikHelpers<TCBLValues>
  ) => {
    if (readOnly || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addCblRequest(values);

      setModalTitle(t("createSuccessTitle"));
      setModalMessage(t("createSuccessMessage"));
      setModalSuccess(true);
      setModalOpen(true);

      onSubmit?.(values, helpers);
    } catch (error) {
      setModalTitle(t("createErrorTitle"));
      setModalMessage(
        error instanceof Error ? error.message : t("unknownError")
      );
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* JSX                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <FormHeader status={status}>
        <div className="pb-5">
          <BackButton
            fallbackPath="/requests/cbl"
            isEditing={initialValues !== undefined}
          />
        </div>
      </FormHeader>

      <div className="px-6 bg-gray-100 -mt-6 py-2">
        <Form initialValues={mergedValues} onSubmit={handleSubmit}>
          {/* ---------------- Sections ---------------- */}
          {sections.map((section, idx) => (
            <div className="mt-6" key={idx}>
              <h2 className="text-lg font-bold text-gray-800">
                {section.title}
              </h2>

              {section.fieldGroups ? (
                section.fieldGroups.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className={`grid ${group.gridCols} gap-4 mt-4`}
                  >
                    {group.fields.map((field, fIdx) => {
                      const FieldComponent =
                        field.component as React.ElementType;
                      const commonProps = {
                        name: field.name,
                        label: field.label,
                        disabled: readOnly,
                        textColor: "text-gray-700",
                        titlePosition:
                          field.component === DatePickerValue
                            ? "top"
                            : undefined,
                      };

                      return (
                        <div key={fIdx} className="w-full">
                          {field.name === "currentAccount" ? (
                            <InputSelectCombo
                              {...commonProps}
                              options={accountOptions}
                              width="w-full"
                              maskingFormat="0000-000000-000"
                            />
                          ) : (
                            <FieldComponent
                              {...commonProps}
                              type={field.type}
                              startIcon={field.icon || null}
                              maskingFormat={
                                field.name === "currentAccount"
                                  ? "0000-000000-000"
                                  : undefined
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className={`grid ${section.gridCols} gap-4 mt-4`}>
                  {section.fields.map((field, fIdx) => {
                    const FieldComponent = field.component as React.ElementType;
                    const commonProps = {
                      name: field.name,
                      label: field.label,
                      disabled: readOnly,
                      textColor: "text-gray-700",
                      titlePosition:
                        field.component === DatePickerValue ? "top" : undefined,
                    };

                    return (
                      <div key={fIdx} className="w-full">
                        {field.name === "currentAccount" ? (
                          <InputSelectCombo
                            {...commonProps}
                            options={accountOptions}
                            width="w-full"
                            maskingFormat="0000-000000-000"
                          />
                        ) : (
                          <FieldComponent
                            {...commonProps}
                            type={field.type}
                            startIcon={field.icon || null}
                            maskingFormat={
                              field.name === "currentAccount"
                                ? "0000-000000-000"
                                : undefined
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* -------------- Tables + InfoBox -------------- */}
          <div className="flex w-full gap-6">
            <div className="flex flex-1 flex-col gap-6">
              <Table
                title={t("table1.title")}
                columns={columns1}
                fieldNamePrefix="table1Rows"
                readOnly={readOnly}
              />

              <div className="flex-grow rounded-lg border border-gray-300 bg-gray-100 shadow-sm" />

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

          {/* -------------- Additional Info -------------- */}
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

          {/* -------------- Buttons -------------- */}
          {!readOnly && (
            <div className="px-6 pb-6 flex justify-center gap-2">
              <SubmitButton
                title="Submit"
                color="info-dark"
                disabled={isSubmitting}
              />
            </div>
          )}
        </Form>
      </div>

      {/* Modal */}
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
