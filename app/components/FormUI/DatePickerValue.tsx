"use client";

import React, { useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";

type Props = {
  name: string;
  label: string;
  titlePosition?: "top" | "side";
  disabled?: boolean;
  width?: string; // Optional width prop, e.g. "w-full", "w-1/2"
  textColor?: string; // e.g. "text-white", "text-gray-700", etc.
};

export default function DatePickerValue({
  name,
  label,
  titlePosition = "top",
  disabled = false,
  width = "w-full",
  textColor = "text-gray-700", // default label color if none provided
}: Props) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  const pathname = usePathname();

  // Determine the locale based on the pathname
  const [currentLocale, setCurrentLocale] = useState("en");
  useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  // Ensure the value is always a valid string or empty
  const value = field.value ? dayjs(field.value).format("YYYY-MM-DD") : "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setFieldValue(name, newValue);
  };

  // Decide if the form is in RTL mode (based on document direction)
  const isRtl = document.documentElement.dir === "rtl";

  // Build container classes with the width prop included
  const containerClasses =
    `${width} mb-4 ` +
    (titlePosition === "side"
      ? isRtl
        ? "flex items-center gap-2 order-last text-right"
        : "flex items-center gap-2 text-left"
      : "flex flex-col");

  // Label classes (where we apply the textColor)
  const labelClasses = `text-sm font-medium whitespace-nowrap ${textColor}`;

  // Input classes (note: removed textColor to keep default text styling)
  const inputClasses = `w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm text-black`;

  // Get placeholder text based on locale
  const getPlaceholder = () => {
    return currentLocale === "ar" ? "يوم/شهر/سنة" : "Year/Month/Day";
  };

  return (
    <div className={containerClasses}>
      {titlePosition === "side" ? (
        <>
          <label htmlFor={name} className={labelClasses}>
            {label}
          </label>
          <input
            id={name}
            type="date"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={inputClasses}
            lang={currentLocale}
            dir={currentLocale === "ar" ? "rtl" : "ltr"}
            placeholder={getPlaceholder()}
          />
        </>
      ) : (
        <>
          <label htmlFor={name} className={`${labelClasses} mb-1`}>
            {label}
          </label>
          <input
            id={name}
            type="date"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={inputClasses}
            lang={currentLocale}
            dir={currentLocale === "ar" ? "rtl" : "ltr"}
            placeholder={getPlaceholder()}
          />
        </>
      )}
    </div>
  );
}
