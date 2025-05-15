"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useField, useFormikContext } from "formik";
import { FaChevronDown } from "react-icons/fa";
import IMask, { InputMask } from "imask";

/** Your existing type definitions */
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
  width?: string;
  titleColor?: string;

  /**
   * If provided, we treat the input as text and apply IMask with the given format.
   * Example: "0000-0000" for phone-like formatting.
   * The unmasked value is stored in Formik, while the user sees the masked text.
   */
  maskingFormat?: string;
};

/**
 * A Formik-driven text+dropdown combo:
 *   - The user sees either typed or selected option in the text input.
 *   - If maskingFormat is provided, iMask is applied (unmasked stored in Formik).
 *   - The partial filter includes the displayed (masked) text or typed text.
 */
const InputSelectCombo: React.FC<InputSelectComboProps> = ({
  name,
  label,
  options,
  placeholder = "Please select or type...",
  disabled = false,
  width = "w-full",
  titleColor = "text-black",
  maskingFormat,
}) => {
  const formik = useFormikContext();
  const [field, meta, helpers] = useField(name);

  /**
   * We store the user-facing text in displayText.
   * If maskingFormat is used, we set it from iMask (the masked text).
   */
  const [displayText, setDisplayText] = useState("");

  // Controls the dropdown
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [openedByArrow, setOpenedByArrow] = useState(false);

  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // iMask reference
  const maskRef = useRef<InputMask | null>(null);

  /**
   * 1) Setup/destroy iMask if maskingFormat is given
   */
  useEffect(() => {
    if (!maskingFormat || !inputRef.current) {
      // No mask => destroy any existing instance
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
      return;
    }

    // iMask setup
    maskRef.current = IMask(inputRef.current, { mask: maskingFormat });

    // On accept => store unmasked in Formik, masked in displayText
    maskRef.current.on("accept", () => {
      const unmasked = maskRef.current?.unmaskedValue || "";
      const masked = maskRef.current?.value || "";
      helpers.setValue(unmasked);
      setDisplayText(masked);
    });

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, [maskingFormat, helpers]);

  /**
   * 2) Keep iMask in sync if Formik changes the value externally
   */
  useEffect(() => {
    // If we have a mask, we rely on iMask to do the formatting
    if (maskingFormat && maskRef.current) {
      const currentUnmasked = maskRef.current.unmaskedValue;
      const desiredUnmasked = String(field.value ?? "");

      if (currentUnmasked !== desiredUnmasked) {
        maskRef.current.unmaskedValue = desiredUnmasked;
        setDisplayText(maskRef.current.value); // masked
      }
    }
    // If NO mask => normal approach
    else if (!maskingFormat) {
      const currentValue = field.value;
      if (currentValue != null) {
        // See if matches an option
        const matched = options.find(
          (opt) => String(opt.value) === String(currentValue)
        );
        if (matched) {
          setDisplayText(matched.label);
        } else {
          // If no match => it's typed text? Then we show raw
          setDisplayText(String(currentValue));
        }
      } else {
        setDisplayText("");
      }
    }
  }, [field.value, options, maskingFormat]);

  /**
   * Filter logic: uses the displayed text
   * If user clicked arrow or just selected, we skip filtering and show all.
   */
  const filteredOptions = useMemo(() => {
    if (openedByArrow || hasSelected) {
      return options;
    }
    const searchText = displayText.toLowerCase().trim();
    if (!searchText) {
      return options;
    }
    return options.filter((opt) => {
      const lab = opt.label.toLowerCase();
      const val = String(opt.value).toLowerCase();
      // Return true if search text is in label or value
      return lab.includes(searchText) || val.includes(searchText);
    });
  }, [options, displayText, openedByArrow, hasSelected]);

  /**
   * Normal onChange => if no mask, we update displayText
   * If we do have a mask, iMask handles user input events for us
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maskingFormat) {
      // do nothing, iMask is in charge
      return;
    }
    setIsDropdownVisible(true);
    setHasSelected(false);
    setOpenedByArrow(false);
    setDisplayText(e.target.value);
  };

  /**
   * Close on blur
   */
  const handleBlur = () => {
    helpers.setTouched(true);

    // If mask => check completeness
    if (maskingFormat && maskRef.current) {
      if (!maskRef.current.masked.isComplete) {
        helpers.setError(`Input should match format: ${maskingFormat}`);
      } else {
        helpers.setError(undefined);
      }
    }
  };

  /**
   * Option click => store the option's .value in Formik, show .label
   */
  const handleOptionClick = (option: InputSelectComboOption) => {
    if (option.meta?.definitionId) {
      formik.setFieldValue("definitionId", option.meta.definitionId);
    }
    // If we have a mask, do we forcibly remove it? We'll skip that logic here,
    // because typically picking an option means you want that exact value.
    // We'll set Formik to the raw string, display the label as typed
    helpers.setValue(option.value);
    setDisplayText(option.label);
    setHasSelected(true);
    setIsDropdownVisible(false);
  };

  /**
   * Toggle the dropdown when user clicks the arrow button
   */
  const toggleDropdown = () => {
    if (!disabled) {
      setIsDropdownVisible(!isDropdownVisible);
      setHasSelected(false);
      setOpenedByArrow(true);
    }
  };

  /**
   * Close dropdown if user clicks outside
   */
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

  // Decide which error to display
  const showError = meta.touched && meta.error ? meta.error : "";

  return (
    <div className={`relative ${width} mb-4`} style={{ minWidth: "180px" }}>
      {/* Label */}
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
          ref={inputRef}
          type={maskingFormat ? "text" : "text"}
          // we do "text" if there's a mask or not (the mask won't function as "number" input)
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

      {/* Error */}
      {showError && <p className="text-sm text-red-500 mt-1">{showError}</p>}
    </div>
  );
};

export default InputSelectCombo;
