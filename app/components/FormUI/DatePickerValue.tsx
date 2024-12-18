import React from "react";
import { useField, useFormikContext } from "formik";
import dayjs from "dayjs";

type Props = {
  name: string;
  label: string;
  titlePosition?: "top" | "side"; // Optional prop: 'top' or 'side'
};

export default function DatePickerValue({
  name,
  label,
  titlePosition = "top",
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
      className={`mb-4 ${
        titlePosition === "side"
          ? ` flex items-center gap-2 ${
              document.documentElement.dir === "rtl"
                ? "order-last text-right"
                : "text-left"
            }`
          : "flex flex-col"
      }`}
    >
      {/* Conditional order for RTL and LTR */}
      {titlePosition === "side" ? (
        <>
          {/* Label comes BEFORE the input in RTL */}
          <label
            htmlFor={name}
            className={`text-sm font-medium text-gray-700 whitespace-nowrap `}
          >
            {label}
          </label>
          <input
            id={name}
            type="date"
            value={value}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
          />
        </>
      ) : (
        <>
          {/* Label on Top */}
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
          <input
            id={name}
            type="date"
            value={value}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
          />
        </>
      )}
    </div>
  );
}
