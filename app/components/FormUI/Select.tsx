"use client";

import React, { JSX, useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";

/**
 * Option type for the <select> options
 */
type OptionType = {
  value: string | number;
  label: string;
};

/**
 * Props for SelectWrapper, now including optional width/height
 */
type SelectWrapperType = {
  name: string;
  label: string;
  options: OptionType[];
  disabled?: boolean;
  width?: string; // e.g. "200px" or "100%"
  height?: string; // e.g. "2rem" or "40px"
};

export default function SelectWrapper({
  name,
  label,
  options,
  disabled = false,
  width,
  height,
}: SelectWrapperType): JSX.Element {
  const pathname = usePathname();
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  // Detect locale from the URL
  const [currentLocale, setCurrentLocale] = useState("en");
  useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  // Placeholder text based on locale
  const placeholder =
    currentLocale === "ar" ? "الرجاء الاختيار" : "Please select";

  // Initialize selected value from Formik field
  const [selectedValue, setSelectedValue] = useState(field.value || "");

  // Handle changes
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    setFieldValue(name, value);
  };

  // Sort options alphabetically by label
  const sortedOptions = [...options].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  // If the user sets a custom height, we reduce default padding & font size,
  // so text won't be cropped inside the select.
  const selectBaseClasses = [
    "border border-gray-300 rounded-md focus:outline-none focus:ring",
    meta.touched && meta.error
      ? "border-red-500 focus:ring-red-500"
      : "focus:ring-blue-500",
    "disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed",
  ].join(" ");

  // If height is explicitly given, use smaller padding/font to avoid cropping
  const selectCustomClasses = height ? "p-1 text-sm leading-tight" : "p-2";

  return (
    <div>
      {/* If we have a non-empty label, show it. Otherwise omit. */}
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium mb-2 ${
            currentLocale === "ar" ? "text-right" : "text-left"
          } text-gray-700`}
        >
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        style={{
          width: width || "100%", // If none given, default is 100%
          height: height || "auto", // If none given, default is auto
        }}
        className={`${selectBaseClasses} ${selectCustomClasses}`}
        dir={currentLocale === "ar" ? "rtl" : "ltr"}
      >
        {/* Placeholder (unselectable) */}
        <option value="" disabled>
          {placeholder}
        </option>
        {sortedOptions.map((option: OptionType) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error message */}
      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
}
