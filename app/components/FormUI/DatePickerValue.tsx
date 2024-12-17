import React from "react";
import { useField, useFormikContext } from "formik";
import dayjs from "dayjs";

type Props = {
  name: string;
  label: string;
};

export default function DatePickerValue({ name, label }: Props) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();

  // Ensure the value is always a valid string or empty
  const value = field.value ? dayjs(field.value).format("YYYY-MM-DD") : "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setFieldValue(name, newValue);
  };

  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Date Input */}
      <input
        id={name}
        type="date"
        value={value} // Always provide a defined value
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
      />
    </div>
  );
}
