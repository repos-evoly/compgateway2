import React, { useState } from "react";
import Checkbox from "../../reusable/CheckBox"; // Adjust the import path based on your structure
import { footerFields } from "./RTGSFieldsArray"; // Import the footer fields
import { useTranslations } from "next-intl";

const RTGSFooter: React.FC = () => {
  const [checkboxStates, setCheckboxStates] = useState(
    footerFields.reduce((acc, field) => {
      acc[field.key] = false;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const handleCheckboxChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCheckboxStates((prev) => ({
        ...prev,
        [key]: e.target.checked,
      }));
    };

  const t = useTranslations("RTGSForm");

  return (
    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t("attachments")}
      </h2>
      <div className="flex flex-wrap gap-4">
        {footerFields.map((field) => (
          <Checkbox
            key={field.key}
            label={t(field.label)}
            checked={checkboxStates[field.key]}
            onChange={handleCheckboxChange(field.key)}
          />
        ))}
      </div>
      <h2>{t("note")}</h2>
    </div>
  );
};

export default RTGSFooter;
