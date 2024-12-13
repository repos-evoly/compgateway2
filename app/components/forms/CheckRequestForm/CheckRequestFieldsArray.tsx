import { FormItemsProps } from "@/types";

export interface CheckRequestFieldConfig {
  section?: string; // Optional section title
  fields: {
    title: string; // Field title
    type: "single" | "double"; // Specify whether this is a single or double row
    inputItems?: FormItemsProps; // Configuration for the input field
    extraTextKey?: string; // Add optional extraTextKey property
    useSignaturePad?: boolean; // Flag for signature pad
  }[];
}

const CheckRequestFieldsArray: CheckRequestFieldConfig[] = [
  {
    section: "branchInfo",
    fields: [
      {
        title: "branch",
        type: "single",
        inputItems: {
          inputType: "text",
          inputID: "branch",
          inputName: "branch",
          inputValue: "",
          onChange: () => {}, // Placeholder for the onChange handler
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "otherInfo",
    fields: [
      {
        title: "branchNum",
        type: "double",
        inputItems: {
          inputType: "number",
          inputID: "branchNum",
          inputName: "branchNum",
          inputValue: "",
          onChange: () => {},
          error: [],
          required: true,
        },
      },
      {
        title: "date",
        type: "double",
        inputItems: {
          inputType: "date",
          inputID: "date",
          inputName: "date",
          inputValue: "",
          onChange: () => {},
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "customerInfo",
    fields: [
      {
        title: "customerName",
        type: "double",
        inputItems: {
          inputType: "text",
          inputID: "customerName",
          inputName: "customerName",
          inputValue: "",
          onChange: () => {},
          error: [],
          required: true,
        },
      },
      {
        title: "cardNum",
        type: "double",
        inputItems: {
          inputType: "number",
          inputID: "cardNum",
          inputName: "cardNum",
          inputValue: "",
          onChange: () => {},
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "accountInfo",
    fields: [
      {
        title: "accountNum",
        type: "single",
        inputItems: {
          inputType: "number",
          inputID: "accountNum",
          inputName: "accountNum",
          inputValue: "",
          onChange: () => {},
          error: [],
          required: true,
        },
      },
      {
        title: "beneficiary",
        type: "single",
        inputItems: {
          inputType: "text",
          inputID: "beneficiary",
          inputName: "beneficiary",
          inputValue: "",
          onChange: () => {},
          error: [],
          required: false,
        },
      },
    ],
  },
];

export default CheckRequestFieldsArray;
