// components/SpecialFieldsDisplay.tsx
"use client";

import React from "react";
import { useFormikContext } from "formik";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import { InternalFormValues, SpecialFieldsDisplayProps } from "../types";

const SpecialFieldsDisplay = ({
  field,
  displayType,
  t,
  disabled,
}: SpecialFieldsDisplayProps) => {
  const { values } = useFormikContext<InternalFormValues>();

  let content: React.ReactNode = null;

  // If it's "account" display type, we can show extra info if the value is "test"
  if (
    displayType === "account" &&
    (field.name === "from" || field.name === "to")
  ) {
    // accountName & balance example:
    let accountName = "";
    let balance = "";

    if (values[field.name] === "test") {
      accountName = field.name === "from" ? "عصمت العياش" : "نادر خداج";
      if (field.name === "from") {
        balance = `${t("balance") || "Balance"}: 1000`;
      }
    }

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
  }

  // If it's "commission" display type, we could handle it here
  // if (displayType === "commission" && values.commision !== undefined) {
  //   content =
  //     values.commision > 0 ? (
  //       <span className="text-gray-700 text-sm">
  //         {`${values.commision} ... `}
  //       </span>
  //     ) : null;
  // }

  return (
    <div className="flex items-center gap-6">
      <div className={field.width || "w-full"}>
        <FormInputIcon
          name={field.name}
          label={t(field.name)}
          startIcon={field.startIcon}
          type={field.type}
          disabled={disabled}
        />
      </div>
      {content}
    </div>
  );
};

export default SpecialFieldsDisplay;
