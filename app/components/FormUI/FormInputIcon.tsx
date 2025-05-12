"use client";

import React, { useEffect, useRef } from "react";
import { useField } from "formik";
import IMask, { InputMask } from "imask";
import { FormInputIconProps } from "@/types";

/**
 * A Formik-driven input component with optional iMask,
 * an optional custom error, and onBlur callback logic.
 */
const FormInputIcon = ({
  name,
  label,
  type = "text",
  startIcon,
  children,
  onClick,
  onMouseDown,
  helpertext,
  width = "w-full",
  errorMessage,
  onBlurAdditional,
  titlePosition = "top",
  textColor = "text-gray-700",
  disabled = false,
  maskingFormat,
}: FormInputIconProps) => {
  const [field, meta, helpers] = useField(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<InputMask | null>(null);

  // If maskingFormat is provided, treat the <input> type as text (so iMask can format).
  const effectiveType = maskingFormat ? "text" : type;

  // 1) Setup iMask if needed
  useEffect(() => {
    if (!maskingFormat || !inputRef.current) {
      // If no mask => destroy any existing instance
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
      return;
    }

    maskRef.current = IMask(inputRef.current, { mask: maskingFormat });

    // On accept => store unmasked value in Formik
    maskRef.current.on("accept", () => {
      const newUnmasked = maskRef.current?.unmaskedValue || "";
      helpers.setValue(newUnmasked);
    });

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [maskingFormat, helpers]);

  // 2) Keep iMask in sync if Formik changes the value externally
  useEffect(() => {
    if (maskingFormat && maskRef.current) {
      const currentUnmasked = maskRef.current.unmaskedValue;
      const desiredUnmasked = String(field.value ?? "");
      if (currentUnmasked !== desiredUnmasked) {
        maskRef.current.unmaskedValue = desiredUnmasked;
      }
    }
  }, [field.value, maskingFormat]);

  // 3) Custom onBlur
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    // Mark this field as touched in Formik
    helpers.setTouched(true);

    // If we have a mask => check completeness
    if (maskingFormat && maskRef.current) {
      if (!maskRef.current.masked.isComplete) {
        helpers.setError(`Input should match format: ${maskingFormat}`);
      } else {
        helpers.setError(undefined);
      }
    }

    // If there's custom blur logic
    if (onBlurAdditional) {
      await onBlurAdditional(field.value || "", () => {
        // This is a local setter. The parent form can manage 'errorMessage' state
        // and pass it in. Or you can call `helpers.setError(...)` if you
        // want it managed by Formik.
      });
    }

    // Finally call Formik's default onBlur
    if (field.onBlur) {
      field.onBlur(e);
    }
  };

  // If no mask => normal Formik binding
  const inputValue = !maskingFormat ? field.value ?? "" : undefined;
  const handleChange = !maskingFormat ? field.onChange : undefined;

  // 4) Decide which error to display
  //    If 'errorMessage' is provided, it takes priority over Formik's error.
  //    If neither, show nothing.
  const formikError = meta.touched && meta.error ? meta.error : "";
  const showError = errorMessage || formikError;
  const hasError = !!showError;

  return (
    <div
      className={`${width} mb-4 ${
        titlePosition === "side" ? "flex items-center gap-2" : "flex flex-col"
      }`}
    >
      {/* Label */}
      {titlePosition === "side" ? (
        <label
          htmlFor={name}
          className={`text-sm font-medium ${textColor} whitespace-nowrap ${
            document.documentElement.dir === "rtl" ? "rtl:ml-2" : "ltr:mr-2"
          }`}
        >
          {label}
        </label>
      ) : (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${textColor} mb-1`}
        >
          {label}
        </label>
      )}

      {/* Input + optional icon */}
      <div className="relative flex items-center w-full">
        {/* Start Icon */}
        {startIcon && (
          <span className="absolute left-3 text-gray-500">{startIcon}</span>
        )}

        {/* The actual input field */}
        <input
          id={name}
          name={field.name}
          type={effectiveType}
          disabled={disabled}
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none ${
            disabled
              ? "bg-gray-200 cursor-not-allowed text-gray-500"
              : hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />

        {/* End Icon */}
        {children && (
          <button
            type="button"
            onClick={onClick}
            onMouseDown={onMouseDown}
            className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {children}
          </button>
        )}
      </div>

      {/* Error Message => either the API-based "errorMessage" or Formik "meta.error" */}
      {hasError && <p className="text-sm text-red-500 mt-1">{showError}</p>}

      {/* Helper Text => if you have helper text and no errors */}
      {helpertext && !hasError && (
        <p className="text-sm text-gray-500 mt-1">{helpertext}</p>
      )}
    </div>
  );
};

export default FormInputIcon;
