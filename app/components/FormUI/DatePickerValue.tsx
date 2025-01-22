import React from "react";
import { useField, useFormikContext } from "formik";
import dayjs from "dayjs";

type Props = {
  name: string;
  label: string;
  titlePosition?: "top" | "side"; // Optional prop: 'top' or 'side'
  textColor?: string; // Additional prop to control label text color
  width?: string; // New prop to control width
};

export default function DatePickerValue({
  name,
  label,
  titlePosition = "top",
  textColor = "text-gray-700", // Default text color
  width = "w-full", // Default width
}: Props) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();

  // Ensure the value is always a valid string or empty
  const value = field.value ? dayjs(field.value).format("YYYY-MM-DD") : "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setFieldValue(name, newValue);
  };

  return (
    <div
      className={`mb-4 ${width} ${
        titlePosition === "side"
          ? `flex items-center gap-2 ${
              document.documentElement.dir === "rtl"
                ? "rtl:ml-2 text-right"
                : "ltr:mr-2 text-left"
            }`
          : "flex flex-col"
      }`}
    >
      {/* Conditional order for RTL and LTR */}
      {titlePosition === "side" ? (
        <label
          htmlFor={name}
          className={`text-sm font-medium ${textColor} whitespace-nowrap`}
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

      <input
        id={name}
        type="date"
        value={value}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
      />
    </div>
  );
}
