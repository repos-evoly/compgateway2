"use client";

import React from "react";
import { useField } from "formik";

type FormFileUploadProps = {
  name: string;
  label: string;
  multiple?: boolean;
  accept?: string; // e.g. ".pdf,.jpg,.png"
  disabled?: boolean; // if true, file input is disabled
};

export default function FormFileUpload({
  name,
  label,
  multiple = false,
  accept,
  disabled = false,
}: FormFileUploadProps) {
  // ignore the 'field' tuple element since we handle change/blur manually
  const [, meta, helpers] = useField<File[] | File | null>(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (!files) return;

    if (multiple) {
      helpers.setValue(Array.from(files));
    } else {
      helpers.setValue(files[0] ?? null);
    }
  };

  const handleBlur = () => {
    helpers.setTouched(true);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="
          block w-full text-sm text-gray-900
          file:mr-4 file:py-2 file:px-4 file:rounded-full
          file:border-0 file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      />
      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
}
