import { FormItemsProps } from "@/types";

export interface RTGSFieldConfig {
  section?: string; // Section title
  fields: {
    title: string; // Field title
    inputItems?: FormItemsProps; // FormItems configuration
  }[];
}

const RTGSFieldsArray: RTGSFieldConfig[] = [
  {
    section: "accInfo",
    fields: [
      {
        title: "accountNb",
        inputItems: {
          inputType: "text",
          inputID: "accountNo",
          inputName: "accountNo",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
      {
        title: "name",
        inputItems: {
          inputType: "text",
          inputID: "applicantName",
          inputName: "applicantName",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
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
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "benDetails",
    fields: [
      {
        title: "benName",
        inputItems: {
          inputType: "text",
          inputID: "beneficiaryName",
          inputName: "beneficiaryName",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
      {
        title: "benAccNum",
        inputItems: {
          inputType: "text",
          inputID: "beneficiaryAccountNo",
          inputName: "beneficiaryAccountNo",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
      {
        title: "benBank",
        inputItems: {
          inputType: "text",
          inputID: "beneficiaryBank",
          inputName: "beneficiaryBank",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
      {
        title: "branch",
        inputItems: {
          inputType: "text",
          inputID: "branchName",
          inputName: "branchName",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "payDetails",
    fields: [
      {
        title: "amount",
        inputItems: {
          inputType: "text",
          inputID: "amount",
          inputName: "amount",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
      {
        title: "reniInfo",
        inputItems: {
          inputType: "text",
          inputID: "remittanceInfo",
          inputName: "remittanceInfo",
          inputValue: "",
          onChange: () => {}, // Placeholder handler
          error: [],
          required: true,
        },
      },
    ],
  },
  {
    section: "footer", // Footer section for other rows
    fields: [],
  },
];

export default RTGSFieldsArray;

export const footerFields = [
  { label: "invoice", key: "invoice" },
  { label: "contract", key: "contract" },
  { label: "claim", key: "claim" },
  { label: "otherDoc", key: "otherDoc" },
];

export const FormTypeFields = [
  {
    title: "refNum",
    inputType: "text",
    inputID: "textInput",
    inputName: "textInput",
    inputValue: "",
    onChange: () => {}, // Placeholder handler
  },
  {
    title: "date",
    inputType: "date",
    inputID: "dateInput",
    inputName: "dateInput",
    inputValue: "",
    onChange: () => {}, // Placeholder handler
  },
];
