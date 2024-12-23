// components/SpecialFieldsDisplay.tsx

import React from "react";
import { useFormikContext } from "formik";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import { InternalFormValues, SpecialFieldsDisplayProps } from "@/types"; // Import types as necessary

const SpecialFieldsDisplay = ({
  field,
  displayType,
  t,
}: SpecialFieldsDisplayProps) => {
  const { values } = useFormikContext<InternalFormValues>();
  let content = null;

  if (
    displayType === "account" &&
    (field.name === "from" || field.name === "to")
  ) {
    const accountName =
      values[field.name] === "test"
        ? field.name === "from"
          ? "عصمت العياش"
          : "نادر خداج"
        : "";
    const balance =
      field.name === "from" && values[field.name] === "test"
        ? `${t("balance") || "Balance"}: 1000`
        : "";

    content = (
      <div className="flex gap-4 items-center text-gray-800">
        {accountName && (
          <span className="text-lg font-semibold">{accountName}</span>
        )}
        {balance && (
          <span className="text-lg font-medium text-green-600">{balance}</span>
        )}
      </div>
    );
  } else if (displayType === "commission") {
    content =
      values.commision > 0 ? (
        <span className="text-gray-700 text-sm">
          {`${values.commision} ${
            values.receiverOrSender === "sender"
              ? t("commisionSender")
              : t("commisionReceiver")
          }`}
        </span>
      ) : null;
  }

  return (
    <div className="flex items-center gap-6">
      <div className={`${field.width || "w-full"}`}>
        <FormInputIcon
          name={field.name}
          label={t(field.name)}
          startIcon={field.startIcon}
          type={field.type}
        />
      </div>
      {content}
    </div>
  );
};

export default SpecialFieldsDisplay;
