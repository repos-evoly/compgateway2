// app/[locale]/internalTransfer/components/ContinueButton.tsx
"use client";

import React from "react";
import { useFormikContext } from "formik";
import { ContinueButtonProps } from "@/types";
import { useTranslations } from "next-intl";
import type { InternalFormValues } from "../types";

/* ------------------------------------------------------------------ */
/* Extend the shared props with an optional `disabled` flag            */
/* ------------------------------------------------------------------ */
type Props = ContinueButtonProps & {
  /** Disable the button regardless of Formik validity */
  disabled?: boolean;
};

/**
 * A “Continue” button that:
 * 1. Marks specified fields as touched
 * 2. Triggers validation
 * 3. Calls the parent onClick with current Formik values if valid
 * 4. Can be force-disabled via prop (e.g. account-not-found)
 */
const ContinueButton = ({
  onClick,
  touchedFields,
  disabled = false,
}: Props) => {
  const { values, setTouched, validateForm, isValid } =
    useFormikContext<InternalFormValues>();
  const t = useTranslations("continueButton");

  /* ---------------------- click handler ---------------------- */
  const handleClick = async () => {
    if (disabled) return; // hard stop

    // Mark all relevant fields as touched so their errors show
    setTouched(touchedFields, true);

    // Validate entire form
    const errors = await validateForm();

    // If no errors => propagate form values to parent
    if (Object.keys(errors).length === 0) {
      onClick(values);
    }
  };

  /* ---------------------- render ----------------------------- */
  const inactive = disabled || !isValid;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={inactive}
      className={`px-4 py-2 rounded transition-colors ${
        inactive
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-info-dark text-white hover:bg-info-light"
      }`}
    >
      {t("continue")}
    </button>
  );
};

export default ContinueButton;
