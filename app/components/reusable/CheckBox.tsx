import React from "react";

interface CheckboxProps {
  label: string; // The title to display beside the checkbox
  checked?: boolean; // Optional to control the checked state
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Event handler for the checkbox
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
}) => {
  return (
    <div className="flex">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          className="rtl:ml-2 ltr:mr-2"
          checked={checked}
          onChange={onChange}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
