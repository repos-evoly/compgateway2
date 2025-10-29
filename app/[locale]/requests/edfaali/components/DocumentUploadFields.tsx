"use client";

import React from "react";
import { useTranslations } from "use-intl";

import FormFileUpload from "@/app/components/FormUI/FormFileUpload";

import { documentUploadDefinitions } from "../data";

type DocumentUploadFieldsProps = {
  readOnly?: boolean;
};

const DocumentUploadFields: React.FC<DocumentUploadFieldsProps> = ({ readOnly }) => {
  const t = useTranslations("edfaaliForm");
  const buttonLabel = t("documents.uploadButton");
  const placeholder = t("documents.noFile");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">{t("documents.helper")}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {documentUploadDefinitions.map((definition, index) => (
          <FormFileUpload
            key={definition.type}
            name={`documents[${index}].file`}
            label={t(definition.labelKey)}
            accept={definition.accept}
            buttonLabel={buttonLabel}
            placeholder={placeholder}
            disabled={readOnly}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentUploadFields;
