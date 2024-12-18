import React from "react";
import { useField } from "formik";
import { FormInputIconProps } from "@/types";

const FormInputIcon = ({
  name,
  label,
  type = "text",
  startIcon,
  children,
  onClick,
  onMouseDown,
  helpertext,
}: FormInputIconProps) => {
  const [field, meta] = useField(name);

  return (
    <div className="w-full mb-4">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {/* Start Icon */}
        {startIcon && (
          <span className="absolute left-3 text-gray-500">{startIcon}</span>
        )}

        {/* Input Field */}
        <input
          id={name}
          {...field}
          type={type}
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring ${
            meta.touched && meta.error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />

        {/* End Icon */}
        {children && (
          <button
            type="button"
            onClick={onClick}
            onMouseDown={onMouseDown}
            className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {children}
          </button>
        )}
      </div>

      {/* Error Message */}
      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}

      {/* Helper Text */}
      {helpertext && <p className="text-sm text-gray-500 mt-1">{helpertext}</p>}
    </div>
  );
};

export default FormInputIcon;
