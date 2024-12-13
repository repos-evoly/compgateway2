import React from "react";
import { FormItemsProps } from "../../../types";

const FormItems = ({
  label,
  inputType,
  inputID,
  inputName,
  inputValue,
  disable,
  readOnly,
  onChange,
  error,
  selectOptions,
  isDatalist,
  datalistOptions,
  required = false,
  className = "",
  onBlur,
  onKeyDown, // Add the onKeyDown prop
}: FormItemsProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && ( // Only render the label if it exists
        <label
          htmlFor={inputID}
          className="block text-sm font-medium text-main mb-1"
        >
          {label}
        </label>
      )}

      {inputType === "select" && selectOptions ? (
        <select
          id={inputID}
          name={inputName}
          value={inputValue}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown} // Pass the onKeyDown prop to select
          disabled={disable}
          required={required}
          autoComplete="off"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main rtl:text-right ltr:text-left"
        >
          <option value="" disabled>
            Select...
          </option>
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : isDatalist && datalistOptions ? (
        <>
          <input
            type={inputType}
            id={inputID}
            name={inputName}
            value={inputValue}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown} // Pass the onKeyDown prop to select
            list={`${inputID}-datalist`} // Link input with datalist
            required={required}
            autoComplete="off"
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main rtl:text-right ltr:text-left"
            disabled={disable}
            readOnly={readOnly} // Set readOnly when passed
          />
          <datalist id={`${inputID}-datalist`}>
            {datalistOptions.map((option, index) => (
              <option key={index} value={option.value} />
            ))}
          </datalist>
        </>
      ) : (
        <input
          type={inputType}
          id={inputID}
          name={inputName}
          value={inputValue}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown} // Pass the onKeyDown prop to select
          required={required}
          autoComplete="off"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main rtl:text-right ltr:text-left"
          disabled={disable}
          readOnly={readOnly} // Set readOnly when passed
        />
      )}

      {error &&
        error.map((err, index) => (
          <div key={index} className="text-red-500 text-sm mt-1">
            {err}
          </div>
        ))}
    </div>
  );
};

export default FormItems;
