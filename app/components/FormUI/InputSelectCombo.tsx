"use client";

import React, { useState, useEffect, useRef, useMemo, useId } from "react";
import { useField, useFormikContext } from "formik";
import { FaChevronDown } from "react-icons/fa";
import IMask, { InputMask } from "imask";

export type InputSelectComboOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
  meta?: Record<string, unknown>;
};

export type InputSelectComboProps = {
  name: string;
  label: string;
  options: InputSelectComboOption[];
  placeholder?: string;
  disabled?: boolean;
  width?: string;
  titleColor?: string;
  maskingFormat?: string;
  onDisabledOptionAttempt?: (option: InputSelectComboOption) => void;
  clearIfDisabledSelected?: boolean;
};

const InputSelectCombo: React.FC<InputSelectComboProps> = ({
  name,
  label,
  options,
  placeholder = "type or select",
  disabled = false,
  width = "w-full",
  titleColor = "text-black",
  maskingFormat,
  onDisabledOptionAttempt,
  clearIfDisabledSelected = true,
}) => {
  const listboxId = useId();

  const formik = useFormikContext<Record<string, unknown>>();
  const [field, meta, helpers] = useField(name);

  const effectivePlaceholder =
    placeholder && placeholder.trim().length > 0
      ? placeholder
      : "type or select";

  const [displayText, setDisplayText] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [openedByArrow, setOpenedByArrow] = useState(false);

  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<InputMask | null>(null);

  useEffect(() => {
    if (!maskingFormat || !inputRef.current) {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
      return;
    }

    maskRef.current = IMask(inputRef.current, { mask: maskingFormat });

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

  useEffect(() => {
    if (maskingFormat && maskRef.current) {
      const currentUnmasked = maskRef.current.unmaskedValue;
      const desiredUnmasked = String(field.value ?? "");
      if (currentUnmasked !== desiredUnmasked) {
        maskRef.current.unmaskedValue = desiredUnmasked;
        setDisplayText(maskRef.current.value);
      }
    } else if (!maskingFormat) {
      const currentValue = field.value;

      if (currentValue != null && String(currentValue).length > 0) {
        const matched = options.find(
          (opt) => String(opt.value) === String(currentValue)
        );

        if (matched) {
          if (matched.disabled && clearIfDisabledSelected) {
            helpers.setValue("", false);
            setDisplayText("");
            if (onDisabledOptionAttempt) onDisabledOptionAttempt(matched);
          } else {
            setDisplayText(matched.label);
          }
        } else {
          setDisplayText(String(currentValue));
        }
      } else {
        setDisplayText("");
      }
    }
  }, [
    field.value,
    options,
    maskingFormat,
    clearIfDisabledSelected,
    onDisabledOptionAttempt,
    helpers,
  ]);

  const filteredOptions = useMemo(() => {
    if (openedByArrow || hasSelected) return options;
    const searchText = displayText.toLowerCase().trim();
    if (!searchText) return options;

    return options.filter((opt) => {
      const lab = opt.label.toLowerCase();
      const val = String(opt.value).toLowerCase();
      return lab.includes(searchText) || val.includes(searchText);
    });
  }, [options, displayText, openedByArrow, hasSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maskingFormat) return;
    setIsDropdownVisible(true);
    setHasSelected(false);
    setOpenedByArrow(false);
    setDisplayText(e.target.value);
  };

  const handleBlur = () => {
    helpers.setTouched(true);
    if (maskingFormat && maskRef.current) {
      if (!maskRef.current.masked.isComplete) {
        helpers.setError(`Input should match format: ${maskingFormat}`);
      } else {
        helpers.setError(undefined);
      }
    }
  };

  const handleOptionClick = (option: InputSelectComboOption) => {
    if (option.disabled) {
      if (onDisabledOptionAttempt) onDisabledOptionAttempt(option);
      setHasSelected(false);
      return;
    }
    if (option.meta && "definitionId" in option.meta) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formik.setFieldValue("definitionId", (option.meta as any).definitionId);
    }
    helpers.setValue(option.value);
    setDisplayText(option.label);
    setHasSelected(true);
    setIsDropdownVisible(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsDropdownVisible((v) => !v);
      setHasSelected(false);
      setOpenedByArrow(true);
    }
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showError = meta.touched && meta.error ? meta.error : "";

  return (
    <div className={`relative ${width} mb-4`} style={{ minWidth: "180px" }}>
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
          type="text"
          placeholder={effectivePlaceholder}
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
          aria-placeholder={effectivePlaceholder}
          aria-controls={isDropdownVisible ? listboxId : undefined}
          /* removed aria-expanded from input to satisfy a11y rule */
        />

        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          aria-label="Toggle options"
          aria-controls={isDropdownVisible ? listboxId : undefined}
          aria-expanded={isDropdownVisible}
        >
          <FaChevronDown />
        </button>

        {isDropdownVisible && !disabled && (
          <ul
            id={listboxId}
            ref={dropdownRef}
            className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md max-h-64 overflow-y-auto"
            style={{ top: "100%", left: 0, minWidth: "100%" }}
            role="listbox"
            aria-label={`${label} options`}
          >
            <li className="px-4 py-2 text-gray-400 cursor-default select-none">
              {effectivePlaceholder}
            </li>

            {filteredOptions.map((option, idx) => {
              const isDisabled = Boolean(option.disabled);
              const isSelected =
                String(field.value ?? "") === String(option.value);

              return (
                <li
                  key={`${option.value}-${idx}`}
                  role="option"
                  aria-disabled={isDisabled}
                  aria-selected={isSelected}
                  className={`px-4 py-2 text-black ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isDisabled) handleOptionClick(option);
                    else if (onDisabledOptionAttempt)
                      onDisabledOptionAttempt(option);
                  }}
                  title={isDisabled ? "Unavailable" : undefined}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showError && <p className="text-sm text-red-500 mt-1">{showError}</p>}
    </div>
  );
};

export default InputSelectCombo;
