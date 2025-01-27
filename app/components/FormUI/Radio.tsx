"use client";

import React, { JSX } from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";
import { DropdownType } from "@/types";

type Props = {
  name: string;
  label: string;
  options: DropdownType[];
  flexDir?: string[];
  t: (key: string) => string; // Properly typed translation function
  textColor?: string; // New prop for setting label text color
  disabled?: boolean; // Add a disabled prop
};

// Define the form values interface
interface FormValues {
  [key: string]: string | number; // Allows dynamic field names with string/number values
}

const RadiobuttonWrapper = ({
  name,
  label,
  options,
  flexDir = ["row", "row"],
  t,
  textColor = "text-gray-700", // Default text color
  disabled = false, // Default value for disabled is false
}: Props): JSX.Element => {
  const pathname = usePathname();

  React.useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    if (locale !== "ar" && locale !== "en") {
      console.warn("Unsupported locale detected:", locale);
    }
  }, [pathname]);

  // Always call hooks at the top level
  const formik = useFormikContext<FormValues>(); // Use the exact form values type
  const [field, meta] = useField(name);

  // Conditional rendering, but hooks are called first
  if (!formik) {
    console.error(
      "RadiobuttonWrapper must be used within a Formik context. Ensure it's inside a Formik component."
    );
    return <p className="text-red-500">Formik context not found</p>;
  }

  const handleChange = (value: string | number) => {
    if (!disabled) {
      formik.setFieldValue(name, value);
    }
  };

  return (
    <div
      className={`flex ${
        flexDir[0] === "row" ? "flex-row" : "flex-col"
      } gap-4 items-start`}
    >
      {/* Label */}
      <legend className="font-bold text-gray-700">{label}</legend>

      {/* Radio Group */}
      <div
        className={`flex space-x-2 rtl:space-x-reverse ${
          flexDir[1] === "row" ? "flex-row" : "flex-col"
        } gap-2`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center space-x-2 rtl:space-x-reverse cursor-pointer ${
              disabled ? "cursor-not-allowed" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={field.value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled} // Pass the disabled prop to the input
              className={`form-radio h-4 w-4 text-green-500 focus:ring ${
                disabled
                  ? "bg-gray-200 cursor-not-allowed"
                  : "focus:ring-green-300"
              }`}
            />
            <span className={`${textColor} ${disabled ? "text-gray-400" : ""}`}>
              {t(option.label)}
            </span>
          </label>
        ))}
      </div>

      {/* Error Message */}
      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default RadiobuttonWrapper;
