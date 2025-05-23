"use client";

import React, { JSX } from "react";
import { useField, useFormikContext } from "formik";

type CheckboxWrapperType = {
  name: string;
  label: string;
  legend?: string;
  disabled?: boolean; // optional disabled prop
  textColor?: string; // optional prop for label text color
};

const CheckboxWrapper = ({
  name,
  label,
  legend,
  disabled = false,
  textColor,
}: CheckboxWrapperType): JSX.Element => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evt.target;
    setFieldValue(name, checked);
  };

  return (
    <div className="mb-4">
      {legend && <p className="text-sm font-semibold mb-2">{legend}</p>}

      <div className="flex items-center gap-2">
        <label
          htmlFor={name}
          className={`text-sm font-medium ${
            textColor ? textColor : "text-gray-700"
          } rtl:order-first ltr:order-last`}
        >
          {label}
        </label>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={typeof field.value === "boolean" ? field.value : false}
          onChange={handleChange}
          disabled={disabled} // apply disabled prop
          className="h-5 w-5 text-main border-gray-300 rounded focus:ring focus:ring-main focus:ring-opacity-50"
        />
      </div>

      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default CheckboxWrapper;
