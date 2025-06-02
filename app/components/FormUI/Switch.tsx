"use client";

import React, { useEffect, useState, JSX } from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";

type SwitchWrapperType = {
  name: string;
  label: string;
  legend?: string;
  onToggle?: (value: boolean) => void;
};

const SwitchWrapper = ({
  name,
  label,
  legend,
  onToggle,
}: SwitchWrapperType): JSX.Element => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const pathname = usePathname();

  // Determine the locale based on the pathname
  const [currentLocale, setCurrentLocale] = useState("en");
  useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setFieldValue(name, newValue);
    if (onToggle) {
      onToggle(newValue);
    }
  };

  // Use the field value to determine the checked state
  const isChecked = field.value === true;

  return (
    <div className="w-full">
      {/* Optional Legend */}
      {legend && (
        <legend
          className={`block text-sm font-medium text-gray-700 mb-2 ${
            currentLocale === "ar" ? "text-right" : "text-left"
          }`}
        >
          {legend}
        </legend>
      )}

      {/* Switch control with proper RTL/LTR support */}
      <div
        className={`flex items-center justify-between ${
          currentLocale === "ar" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div
            className={`
            w-11 h-6 
            bg-gray-200 
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 
            rounded-full 
            peer 
            ${
              isChecked
                ? "peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
                : ""
            }
            peer-checked:after:border-white 
            after:content-[''] 
            after:absolute 
            after:top-[2px] 
            ${currentLocale === "ar" ? "after:right-[2px]" : "after:left-[2px]"}
            after:bg-white 
            after:border-gray-300 
            after:border 
            after:rounded-full 
            after:h-5 
            after:w-5 
            after:transition-all 
            peer-checked:bg-blue-600
          `}
          ></div>
        </label>
      </div>

      {/* Error Message */}
      {meta.touched && meta.error && (
        <p
          className={`text-sm text-red-500 mt-1 ${
            currentLocale === "ar" ? "text-right" : "text-left"
          }`}
        >
          {meta.error}
        </p>
      )}
    </div>
  );
};

export default SwitchWrapper;
