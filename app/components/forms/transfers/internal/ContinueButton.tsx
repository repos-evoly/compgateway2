// components/ContinueButton.tsx

import React from "react";
import { useFormikContext } from "formik";
import { ContinueButtonProps, InternalFormValues } from "@/types";
import { useTranslations } from "next-intl";

const ContinueButton = ({ onClick, touchedFields }: ContinueButtonProps) => {
  const { values, isValid, setTouched, validateForm } =
    useFormikContext<InternalFormValues>();

  const t = useTranslations("continueButton");

  console.log("values sent from the form are: ", values);

  const handleClick = async () => {
    // Mark specified fields as touched to trigger validation error display
    setTouched(touchedFields);

    // Trigger form validation
    const errors = await validateForm();

    if (Object.keys(errors).length === 0) {
      // Log the actual form values (user input data)
      console.log("Form data values to be sent:", values);

      // If the form is valid, proceed with the action
      onClick(values); // Pass the data to modal via onClick
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
