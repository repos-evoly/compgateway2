"use client";

import React, { useId } from "react";
import { useField } from "formik";

type FormFileUploadProps = {
  name: string;
  label: string;
  buttonLabel: string;
  placeholder?: string;
  multiple?: boolean;
  accept?: string; // e.g. ".pdf,.jpg,.png"
  disabled?: boolean; // if true, file input is disabled
};

export default function FormFileUpload({
  name,
  label,
  buttonLabel,
  placeholder,
  multiple = false,
  accept,
  disabled = false,
}: FormFileUploadProps) {
  // ignore the 'field' tuple element since we handle change/blur manually
  const [, meta, helpers] = useField<File[] | File | null>(name);
  const inputId = useId();
  const errorId = `${inputId}-error`;

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

  const files = Array.isArray(meta.value)
    ? meta.value.filter(Boolean)
    : meta.value
    ? [meta.value]
    : [];

  const description = files.length
    ? files.map((file) => file?.name).join(", ")
    : placeholder;

  return (
    <div className="flex flex-col gap-2">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center rounded-md border border-info-dark px-4 py-2 text-sm font-medium text-info-dark transition hover:bg-info-light ${
            disabled ? "cursor-not-allowed opacity-60 pointer-events-none" : ""
          }`}
        >
          {buttonLabel}
        </label>
        <span className="text-sm text-gray-500">
          {description ?? ""}
        </span>
      </div>
      <input
        id={inputId}
        name={name}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        aria-describedby={meta.error ? errorId : undefined}
        className="sr-only"
      />
      {meta.touched && meta.error ? (
        <p id={errorId} className="text-sm text-red-500">
          {meta.error as string}
        </p>
      ) : null}
    </div>
  );
}
