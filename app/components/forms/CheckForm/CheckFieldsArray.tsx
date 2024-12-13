import { FormItemsProps } from "@/types";

export interface CheckFieldConfig {
  section?: string; // Optional section title
  fields: {
    title: string; // Field title
    inputItems?: FormItemsProps; // Configuration for the input field (optional for checkboxes)
    checkboxItems?: {
      label: string; // Label for the checkbox
      checked: boolean; // Default checked state
      onChange: () => void; // Placeholder for handler
    }[]; // Configuration for checkbox fields
  }[];
}

const CheckFieldsArray: CheckFieldConfig[] = [
  {
    section: "checkDetails",
    fields: [
      {
        title: "name",
        inputItems: {
          inputType: "text",
          inputID: "name",
          inputName: "name",
          inputValue: "",
          onChange: () => {}, // Placeholder for handler
          error: [],
          required: true,
        },
      },
      {
        title: "address",
        inputItems: {
          inputType: "text",
          inputID: "address",
          inputName: "address",
          inputValue: "",
          onChange: () => {}, // Placeholder for handler
          error: [],
          required: true,
        },
      },
      {
        title: "accNum",
        inputItems: {
          inputType: "text",
          inputID: "accNum",
          inputName: "accNum",
          inputValue: "",
          onChange: () => {}, // Placeholder for handler
          error: [],
          required: true,
        },
      },
      {
        title: "sendTo",
        inputItems: {
          inputType: "text",
          inputID: "sendTo",
          inputName: "sendTo",
          inputValue: "",
          onChange: () => {}, // Placeholder for handler
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "checkboxSection",
    fields: [
      {
        title: "checkboxOptions",
        checkboxItems: [
          {
            label: "24",
            checked: false,
            onChange: () => {}, // Placeholder for handler
          },
          {
            label: "48",
            checked: false,
            onChange: () => {}, // Placeholder for handler
          },
        ],
      },
    ],
  },
];

export default CheckFieldsArray;
