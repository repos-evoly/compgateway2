"use client";

import React, { JSX, useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";

type CheckboxWrapperType = {
  name: string;
  label: string;
  legend?: string;
};

const CheckboxWrapper = ({
  name,
  label,
  legend,
}: CheckboxWrapperType): JSX.Element => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [currentLocale, setCurrentLocale] = useState("en"); // Default to "en"

  // Handle locale updates
  useEffect(() => {
    // Fetch the current locale from the URL or use a fallback
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(en|ar)/); // Match "en" or "ar" at the start of the path
    const locale = localeMatch ? localeMatch[1] : "en";
    setCurrentLocale(locale);
  }, []);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evt.target;
    setFieldValue(name, checked);
  };

  return (
    <div className={`mb-4 ${currentLocale === "ar" ? "rtl" : "ltr"}`}>
      {legend && <p className="text-sm font-semibold mb-2">{legend}</p>}

      <div className="flex items-center">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={typeof field.value === "boolean" ? field.value : false}
          onChange={handleChange}
          className="h-5 w-5 text-main border-gray-300 rounded focus:ring focus:ring-main focus:ring-opacity-50"
        />
        <label
          htmlFor={name}
          className="ml-2 text-sm font-medium text-gray-700 px-2"
        >
          {label}
        </label>
      </div>

      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default CheckboxWrapper;
