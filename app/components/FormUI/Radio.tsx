"use client";

import React from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";

type RadioOption = { value: string | number | boolean; label: string };

type RadioButtonWrapperProps = {
  name: string;
  label: string;
  options: RadioOption[];
  flexDir?: string[]; // ["row" | "col", "row" | "col"]
  /** Optional translation function */
  t?: (key: string) => string;
  disabled?: boolean;
};

export default function RadiobuttonWrapper({
  name,
  label,
  options,
  flexDir = ["row", "row"],
  t,
  disabled = false,
}: RadioButtonWrapperProps) {
  const pathname = usePathname();

  React.useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    if (locale !== "ar" && locale !== "en") {
      console.warn("Unsupported locale detected:", locale);
    }
  }, [pathname]);

  const formik = useFormikContext<Record<string, unknown>>();
  const [field, meta] = useField(name);

  if (!formik) {
    console.error(
      "RadiobuttonWrapper must be used within a Formik context. Ensure it's inside a Formik component."
    );
    return <p className="text-red-500">Formik context not found</p>;
  }

  const castValue = (
    raw: string | number | boolean
  ): string | number | boolean => {
    if (typeof field.value === "boolean") {
      return raw === 1 || raw === "1" || raw === true || raw === "true";
    }
    return raw;
  };

  const handleChange = (raw: string | number | boolean) => {
    if (!disabled) {
      formik.setFieldValue(name, castValue(raw));
    }
  };

  const isChecked = (raw: string | number | boolean) =>
    field.value === castValue(raw);

  return (
    <fieldset
      className={`flex ${
        flexDir[0] === "row" ? "flex-row" : "flex-col"
      } gap-4 items-start`}
    >
      <legend className="font-bold text-gray-700">{label}</legend>

      <div
        className={`flex space-x-2 rtl:space-x-reverse ${
          flexDir[1] === "row" ? "flex-row" : "flex-col"
        } gap-2`}
      >
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={`flex items-center space-x-2 rtl:space-x-reverse cursor-pointer ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={isChecked(option.value)}
              onChange={() => handleChange(option.value)}
              className="form-radio h-4 w-4 text-green-500 focus:ring focus:ring-green-300"
              disabled={disabled}
            />
            <span className="text-gray-700">
              {t ? t(option.label) : option.label}
            </span>
          </label>
        ))}
      </div>

      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error as string}</p>
      )}
    </fieldset>
  );
}
