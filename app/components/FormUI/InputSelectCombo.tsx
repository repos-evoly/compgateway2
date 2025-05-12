"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useField, useFormikContext } from "formik";
import { FaChevronDown } from "react-icons/fa";

/**
 * InputSelectComboOption:
 *   - label: user-facing text
 *   - value: string | number
 *   - meta?: optional extra data
 */
export type InputSelectComboOption = {
  label: string;
  value: string | number;
  meta?: Record<string, unknown>;
};

export type InputSelectComboProps = {
  name: string; // Formik field name
  label: string; // Label text
  options: InputSelectComboOption[];
  placeholder?: string;
  disabled?: boolean;
  /**
   * If you want to keep the old behavior of filtering only by label or value,
   * you could do so with an additional prop. But here we're always searching "both".
   */
  width?: string;
  titleColor?: string;
};

/**
 * A Formik-driven text+dropdown combo:
 *   - The user sees option.label in the text input.
 *   - Submits option.value when an option is selected.
 *   - The partial filter includes BOTH label & value with "includes".
 */
const InputSelectCombo: React.FC<InputSelectComboProps> = ({
  name,
  label,
  options,
  placeholder = "Please select or type...",
  disabled = false,
  width = "w-full",
  titleColor = "text-black", // Default to black text
}) => {
  const formik = useFormikContext();
  const [field, meta, helpers] = useField(name);

  const [displayText, setDisplayText] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [openedByArrow, setOpenedByArrow] = useState(false);

  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Sync display text from Formik’s field.value on mount and whenever field.value changes
  useEffect(() => {
    const currentValue = field.value;
    if (currentValue !== null && currentValue !== undefined) {
      const matched = options.find(
        (opt) => String(opt.value) === String(currentValue)
      );
      if (matched) {
        setDisplayText(matched.label);
      } else {
        setDisplayText("");
      }
    } else {
      setDisplayText("");
    }
  }, [field.value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDropdownVisible(true);
    setHasSelected(false);
    setOpenedByArrow(false);
    setDisplayText(e.target.value);
  };

  const handleBlur = () => {
    helpers.setTouched(true);
  };

  const handleOptionClick = (option: InputSelectComboOption) => {
    // If there's meta to store in other fields, do so:
    if (option.meta?.definitionId) {
      formik.setFieldValue("definitionId", option.meta.definitionId);
    }

    helpers.setValue(option.value); // The actual submitted value
    setDisplayText(option.label); // The text shown to the user
    setHasSelected(true);
    setIsDropdownVisible(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsDropdownVisible(!isDropdownVisible);
      setHasSelected(false);
      setOpenedByArrow(true);
    }
  };

  // Filter logic: includes check on BOTH label + value
  const filteredOptions = useMemo(() => {
    // If user clicked arrow to open or just selected,
    // skip filtering. Show all options:
    if (openedByArrow || hasSelected) return options;

    const searchText = displayText.toLowerCase().trim();
    if (!searchText) {
      return options;
    }

    return options.filter((opt) => {
      // Convert label and value to lower-case strings
      const lab = opt.label.toLowerCase();
      const val = String(opt.value).toLowerCase();
      // Return true if the search text is found in EITHER
      return lab.includes(searchText) || val.includes(searchText);
    });
  }, [options, displayText, openedByArrow, hasSelected]);

  // Close the dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showError = meta.touched && meta.error ? meta.error : "";

  return (
    <div className={`relative ${width} mb-4`} ref={inputRef}>
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${titleColor} mb-1`}
      >
        {label}
      </label>

      <div className="relative">
        <input
          autoComplete="off"
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          value={displayText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`w-full p-2 border text-black rounded-md focus:outline-none focus:ring pr-10 ${
            disabled
              ? "bg-gray-200 cursor-not-allowed"
              : showError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />

        {/* Arrow icon */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none ${
            disabled ? "cursor-not-allowed" : ""
          }`}
        >
          <FaChevronDown />
        </button>

        {isDropdownVisible && !disabled && (
          <ul
            ref={dropdownRef}
            className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md max-h-64 overflow-y-auto"
            style={{ top: "100%", left: 0, minWidth: "100%" }}
          >
            <li className="px-4 py-2 text-gray-400 cursor-default">
              {placeholder}
            </li>
            {filteredOptions.map((option, idx) => (
              <li
                key={`${option.value}-${idx}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showError && <p className="text-sm text-red-500 mt-1">{showError}</p>}
    </div>
  );
};

export default InputSelectCombo;
