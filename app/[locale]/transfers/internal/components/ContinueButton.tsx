"use client";

import React from "react";
import { useFormikContext } from "formik";
import { ContinueButtonProps } from "@/types";
import { useTranslations } from "next-intl";
import { InternalFormValues } from "../types";

const ContinueButton = ({ onClick, touchedFields }: ContinueButtonProps) => {
  const { values, isValid, setTouched, validateForm } =
    useFormikContext<InternalFormValues>();
  const t = useTranslations("continueButton");

  console.log("values sent from the form are: ", values);

  const handleClick = async () => {
    // Mark fields as touched => show any errors
    setTouched(touchedFields);

    // Validate now
    const errors = await validateForm();

    if (Object.keys(errors).length === 0) {
      // If valid, log and pass values to parent's 'onClick'
      console.log("Form data values to be sent:", values);
      onClick(values);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-4 py-2 rounded ${
        isValid
          ? "bg-info-dark text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {t("continue")}
    </button>
  );
};

export default ContinueButton;
