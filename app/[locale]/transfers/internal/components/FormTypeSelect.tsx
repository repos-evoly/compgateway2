import { FormTypeSelectProps } from "@/types";
import { useTranslations } from "next-intl";
import React from "react";

const FormTypeSelect: React.FC<FormTypeSelectProps> = ({
  selectedFormType,
  onFormTypeChange,
}) => {
  const t = useTranslations("formTypeSelect");
  return (
    <div className="flex items-center gap-4 text-white">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="formType"
          value="internal"
          checked={selectedFormType === "internal"}
          onChange={() => onFormTypeChange("internal")}
          className="form-radio"
        />
        {t("internal")}
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="formType"
          value="between"
          checked={selectedFormType === "between"}
          onChange={() => onFormTypeChange("between")}
          className="form-radio"
        />
        {t("between")}
      </label>
    </div>
  );
};

export default FormTypeSelect;
