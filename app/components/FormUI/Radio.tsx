"use client";

import React, { JSX } from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";

type Props = {
  name: string;
  label: string;
  options: DropdownType[];
  flexDir?: string[];
};

type DropdownType = { value: string | number; label: string };

const RadiobuttonWrapper = ({
  name,
  label,
  options,
  flexDir = ["row", "row"],
}: Props): JSX.Element => {
  const pathname = usePathname(); // Get the current pathname

  React.useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1]; // Assuming the locale is the first segment after "/"
    if (locale !== "ar" && locale !== "en") {
      console.warn("Unsupported locale detected:", locale);
    }
  }, [pathname]);

  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = (value: string | number) => {
    setFieldValue(name, value);
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
        className={`flex ${
          flexDir[1] === "row" ? "flex-row" : "flex-col"
        } gap-2`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={field.value === option.value}
              onChange={() => handleChange(option.value)}
              className="form-radio h-4 w-4 text-green-500 focus:ring focus:ring-green-300"
            />
            <span className="text-gray-700">{option.label}</span>
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
