"use client";

import React from "react";
import Form from "@/app/components/FormUI/Form";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import DatePickerValue from "@/app/components/FormUI/DatePickerValue";
import { FaUser, FaPaperPlane } from "react-icons/fa";
import { useTranslations } from "use-intl";
import Table from "@/app/components/forms/CBLForm/Table";
import InfoBox from "@/app/components/forms/CBLForm/InfoBox";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import { getColumns, initialValues, validationSchema, fields } from "./data";

const Page = () => {
  const t = useTranslations("cblForm");
  const columns = getColumns(t); // Assuming getColumns returns { table1, table2 }
  const columns1 = columns.table1; // Ensure this is an array
  const columns2 = columns.table2; // Ensure this is an array
  const formFields = fields(t);

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form submitted with values:", values);
  };

  return (
    <>
      <div className="w-full bg-info-dark h-16 rounded-t-md mb-0"></div>

      <div className="px-6 bg-gray-100 -mt-6 py-2">
        {/* Header Section */}
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {/* General Information Section */}
          {/* Dynamic Sections Rendering */}
          {[
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
          ].map((section, index) => (
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

          {/* table and information section */}
          <div className="flex w-full gap-6">
            <div className="flex flex-col gap-6 flex-1">
              {/* First Table */}
              <Table title={t("table1.title")} columns={columns1} />

              {/* Styled Filler Div */}
              <div className="flex-grow bg-gray-100 rounded-lg shadow-sm border border-gray-300 flex items-center justify-center">
                {/* Optional content can go here if needed */}
              </div>

              {/* Second Table */}
              <Table title={t("table2.title")} columns={columns2} />
            </div>

            <div className="flex-1">
              {/* InfoBox */}
              <InfoBox />
            </div>
          </div>

          {/* additional information section */}
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

          {/* Submit Button */}
          <div className="px-6 pb-6">
            <SubmitButton
              title="Submit"
              Icon={FaPaperPlane}
              color="info-dark"
              fullWidth
            />
          </div>
        </Form>
      </div>
    </>
  );
};

export default Page;
