"use client";

import React, { JSX, useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";

type OptionType = { value: string | number; label: string };

type SelectWrapperType = {
  name: string;
  label: string;
  options: OptionType[];
};

export default function SelectWrapper({
  name,
  label,
  options,
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

  // Default value for the dropdown
  const defaultValue =
    options.find((x) => x.label === "ليبيا" || x.label === "Libya") ||
    options[0];
  const [selectedValue, setSelectedValue] = useState(
    field.value || defaultValue?.value
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    setFieldValue(name, value);
  };

  // Sort options alphabetically by label
  const sortedOptions = [...options].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <div className="w-full">
      {/* Label */}
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${
          currentLocale === "ar" ? "text-right" : "text-left"
        } text-gray-700 mb-2`}
      >
        {label}
      </label>

      {/* Select Dropdown */}
      <select
        id={name}
        name={name}
        value={selectedValue}
        onChange={handleChange}
        className={`block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring ${
          meta.touched && meta.error
            ? "border-red-500 focus:ring-red-500"
            : "focus:ring-blue-500"
        }`}
        dir={currentLocale === "ar" ? "rtl" : "ltr"}
      >
        <option value={defaultValue?.value} className="text-gray-500">
          {defaultValue?.label}
        </option>
        {sortedOptions.map((option: OptionType) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
}
