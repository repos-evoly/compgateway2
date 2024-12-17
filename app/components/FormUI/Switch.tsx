"use client";

import React, { JSX } from "react";
import { useField, useFormikContext } from "formik";
import { usePathname } from "next/navigation";

type SwitchWrapperType = {
  name: string;
  label: string;
  legend?: string;
};

const SwitchWrapper = ({
  name,
  label,
  legend,
}: SwitchWrapperType): JSX.Element => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const pathname = usePathname();

  // Determine the locale based on the pathname
  const [currentLocale, setCurrentLocale] = React.useState("en");
  React.useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, event.target.checked);
  };

  return (
    <div
      className={`w-full ${
        currentLocale === "ar" ? "text-right" : "text-left"
      }`}
    >
      {/* Legend */}
      {legend && (
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          {legend}
        </legend>
      )}

      {/* Switch with Label */}
      <div className="flex items-center gap-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            {...field}
            checked={typeof field.value === "boolean" ? field.value : false}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 relative transition duration-300">
            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-5 transition-transform duration-300"></div>
          </div>
        </label>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      {/* Error Message */}
      {meta.touched && meta.error && (
        <p className="text-sm text-red-500 mt-1">{meta.error}</p>
      )}
    </div>
  );
};

export default SwitchWrapper;
