import React from "react";
import Checkbox from "../../reusable/CheckBox"; // Adjust the path based on your project structure
import DoubleRow from "../CBLForm/DoubleRow"; // Import the DoubleRow component

interface FormTypeProps {
  options: { label: string; checked?: boolean }[]; // Options for the checkboxes
  onChange?: (label: string, checked: boolean) => void; // Event handler for when a checkbox is toggled
  doubleRowInputs: {
    textInput: {
      title: string;
      inputType: string;
      inputID: string;
      inputName: string;
      inputValue: string;
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) => void;
    };
    dateInput: {
      title: string;
      inputType: string;
      inputID: string;
      inputName: string;
      inputValue: string;
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) => void;
    };
  };
}

const FormType: React.FC<FormTypeProps> = ({
  options,
  onChange,
  doubleRowInputs,
}) => {
  const handleChange =
    (label: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(label, e.target.checked);
      }
    };

  return (
    <div className="p-4 border-b border-gray-300 bg-gray-50 rounded space-y-4">
      {/* DoubleRow Section */}
      <DoubleRow
        rows={[
          {
            title: doubleRowInputs.textInput.title,
            inputItems: {
              inputType: doubleRowInputs.textInput.inputType,
              inputID: doubleRowInputs.textInput.inputID,
              inputName: doubleRowInputs.textInput.inputName,
              inputValue: doubleRowInputs.textInput.inputValue,
              onChange: doubleRowInputs.textInput.onChange,
              error: [],
              required: true,
            },
          },
          {
            title: doubleRowInputs.dateInput.title,
            inputItems: {
              inputType: doubleRowInputs.dateInput.inputType,
              inputID: doubleRowInputs.dateInput.inputID,
              inputName: doubleRowInputs.dateInput.inputName,
              inputValue: doubleRowInputs.dateInput.inputValue,
              onChange: doubleRowInputs.dateInput.onChange,
              error: [],
              required: true,
            },
          },
        ]}
      />

      {/* Checkbox Section */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {options.map((option) => (
            <div
              key={option.label}
              className="flex items-center rtl:space-x-reverse space-x-2"
            >
              <Checkbox
                label={option.label}
                checked={option.checked}
                onChange={handleChange(option.label)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormType;
