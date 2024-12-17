import React, { useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";

type Props = {
  name: string;
  label: string;
  options: OptionType[];
};

type OptionType = { value: string | number; label: string };

export default function MultiSelect({ name, label, options }: Props) {
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext();
  const initialValues = field.value ? field.value.split(",") : [];
  const [selectedItems, setSelectedItems] = useState<string[]>(initialValues);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (value: string) => {
    let newSelectedItems;
    if (selectedItems.includes(value)) {
      newSelectedItems = selectedItems.filter((item) => item !== value);
    } else {
      newSelectedItems = [...selectedItems, value];
    }
    setSelectedItems(newSelectedItems);
    setFieldValue(name, newSelectedItems.join(","));
  };

  useEffect(() => {
    setSelectedItems(field.value ? field.value.split(",") : []);
  }, [field.value]);

  return (
    <div className="relative">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        id={name}
        className="w-full text-left border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        {selectedItems.length > 0
          ? selectedItems
              .map((item) => options.find((opt) => opt.value === item)?.label)
              .join(", ")
          : "Select..."}
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <ul className="max-h-48 overflow-auto">
            {options.map((option) => (
              <li key={option.value} className="px-4 py-2 hover:bg-gray-100">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-500"
                    checked={selectedItems.includes(option.value.toString())}
                    onChange={() => handleChange(option.value.toString())}
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
