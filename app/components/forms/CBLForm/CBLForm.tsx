"use client";

import React from "react";
import SingleRow from "./SingleRow";
import DoubleRow from "./DoubleRow";
import CBLFieldsArray, { FieldConfig } from "./CBLFieldsArray";
import { useTranslations } from "next-intl";
import Table from "./Table";
import InfoBox from "./InfoBox";
import CBLFooter from "./CBLFooter";

const CBLForm = () => {
  const t = useTranslations("cblForm");
  const columns1 = [t("table1.columns.name"), t("table1.columns.position")]; // Column titles
  const columns2 = [t("table2.columns.name"), t("table2.columns.signature")]; // Column titles

  // Helper function to group consecutive double rows
  const groupFields = (
    fields: FieldConfig[]
  ): (FieldConfig | FieldConfig[])[] => {
    const grouped: (FieldConfig | FieldConfig[])[] = [];
    let tempGroup: FieldConfig[] = [];

    fields.forEach((field) => {
      if (field.type === "double") {
        tempGroup.push(field);
      } else {
        if (tempGroup.length) {
          grouped.push(tempGroup);
          tempGroup = [];
        }
        grouped.push(field); // Single row added directly
      }
    });

    if (tempGroup.length) grouped.push(tempGroup); // Push any remaining double rows

    return grouped;
  };

  const groupedFields = groupFields(CBLFieldsArray);

  return (
    <div className="p-6">
      {groupedFields.map((group, index) => {
        if (Array.isArray(group)) {
          // Render double rows
          return (
            <DoubleRow
              key={index}
              rows={group.map((field) => ({
                title: t(field.title),
                inputItems: field.inputItems ?? {
                  inputType: "text",
                  inputID: "default-id",
                  inputName: "default-name",
                  inputValue: "",
                  onChange: () => {}, // Default onChange handler
                  error: [],
                  required: false,
                },
                extraText: field.extraTextKey
                  ? t(field.extraTextKey)
                  : undefined,
              }))}
            />
          );
        } else {
          // Render single row
          return (
            <SingleRow
              key={index}
              title={t(group.title)}
              inputItems={group.inputItems}
              extraText={group.extraTextKey ? t(group.extraTextKey) : undefined}
            />
          );
        }
      })}

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

      <CBLFooter />
    </div>
  );
};

export default CBLForm;
