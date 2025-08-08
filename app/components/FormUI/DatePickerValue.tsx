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
  width?: string;
  textColor?: string;
};

export default function DatePickerValue({
  name,
  label,
  titlePosition = "top",
  disabled = false,
  width = "w-full",
  textColor = "text-gray-700",
}: Props) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);

  // Determine locale based on pathname
  const [currentLocale, setCurrentLocale] = useState("en");
  useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  // Sync formik value with input value
  useEffect(() => {
    if (!isManualInput) {
      setInputValue(field.value ? dayjs(field.value).format("YYYY-MM-DD") : "");
    }
  }, [field.value, isManualInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = event.target.value;

    // Remove non-digit characters except hyphens
    rawValue = rawValue.replace(/[^\d-]/g, "");

    // Split into components and enforce max lengths
    const parts = rawValue.split("-");
    if (parts.length > 0) parts[0] = parts[0].substring(0, 4); // Year: max 4 digits
    if (parts.length > 1) parts[1] = parts[1].substring(0, 2); // Month: max 2 digits
    if (parts.length > 2) parts[2] = parts[2].substring(0, 2); // Day: max 2 digits

    // Rejoin components
    const formattedValue = parts.join("-");

    setInputValue(formattedValue);
    setIsManualInput(true);
  };

  const handleBlur = () => {
    setIsManualInput(false);

    if (inputValue) {
      let formattedDate = "";
      let parsedDate = null;

      // Try ISO format first (YYYY-MM-DD)
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(inputValue)) {
        parsedDate = dayjs(inputValue, "YYYY-MM-DD", true);
      }
      // Try day-month-year format (DD-MM-YYYY)
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(inputValue)) {
        parsedDate = dayjs(inputValue, "DD-MM-YYYY", true);
      }

      if (parsedDate?.isValid()) {
        formattedDate = parsedDate.format("YYYY-MM-DD");
        setFieldValue(name, formattedDate);
        setInputValue(formattedDate);
        return;
      }

      // Revert to previous valid value if invalid
      setInputValue(field.value ? dayjs(field.value).format("YYYY-MM-DD") : "");
    } else {
      setFieldValue(name, "");
    }
  };

  // Get placeholder text based on locale
  const getPlaceholder = () => {
    return currentLocale === "ar"
      ? "سنة-شهر-يوم (مثال: 2023-05-15)"
      : "year-month-day (e.g. 2023-05-15)";
  };

  const isRtl = currentLocale === "ar";
  const containerClasses = `${width} mb-4 ${
    titlePosition === "side"
      ? `flex items-center gap-2 ${
          isRtl ? "order-last text-right" : "text-left"
        }`
      : "flex flex-col"
  }`;

  const labelClasses = `text-sm font-medium whitespace-nowrap ${textColor}`;
  const inputClasses = `w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm text-black`;

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
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={inputClasses}
            lang={currentLocale}
            dir={isRtl ? "rtl" : "ltr"}
            placeholder={getPlaceholder()}
            title={
              currentLocale === "ar"
                ? "أدخل التاريخ بصيغة سنة-شهر-يوم (مثال: 2023-05-15)"
                : "Enter date as year-month-day (e.g. 2023-05-15)"
            }
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
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={inputClasses}
            lang={currentLocale}
            dir={isRtl ? "rtl" : "ltr"}
            placeholder={getPlaceholder()}
            title={
              currentLocale === "ar"
                ? "أدخل التاريخ بصيغة سنة-شهر-يوم (مثال: 2023-05-15)"
                : "Enter date as year-month-day (e.g. 2023-05-15)"
            }
          />
        </>
      )}
    </div>
  );
}
