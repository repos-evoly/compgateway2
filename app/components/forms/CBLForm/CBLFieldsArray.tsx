import { FormItemsProps } from "@/types";

export interface FieldConfig {
  type: "single" | "double"; // Field type: single row or double row
  title: string; // The title of the field
  inputItems?: FormItemsProps; // The props for the FormItems component
  extraTextKey?: string; // Optional key for extra text
}

// Define the array of fields
const CBLFieldsArray: FieldConfig[] = [
  {
    type: "single",
    title: "partyName",
    inputItems: {
      inputType: "text",
      inputID: "partyName",
      inputName: "partyName",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },
  {
    type: "double",
    title: "capital",
    inputItems: {
      inputType: "text",
      inputID: "capital",
      inputName: "capital",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },
  {
    type: "double",
    title: "foundingDate.title",
    inputItems: {
      inputType: "date",
      inputID: "foundingDate",
      inputName: "foundingDate",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "foundingDate.sub",
  },
  {
    type: "single",
    title: "legalForm",
    inputItems: {
      inputType: "text",
      inputID: "legalForm",
      inputName: "legalForm",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },
  {
    type: "single",
    title: "branchOrAgency",
    inputItems: {
      inputType: "text",
      inputID: "branchOrAgency",
      inputName: "branchOrAgency",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "currentAccount",
    inputItems: {
      inputType: "text",
      inputID: "currentAccount",
      inputName: "currentAccount",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "accountOpening",
    inputItems: {
      inputType: "date",
      inputID: "foundingDate",
      inputName: "foundingDate",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  /* ============================================== */

  {
    type: "double",
    title: "commercialLicense",
    inputItems: {
      inputType: "text",
      inputID: "commercialLicense",
      inputName: "commercialLicense",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "validatyLicense",
    inputItems: {
      inputType: "date",
      inputID: "validatyLicense",
      inputName: "validatyLicense",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  {
    type: "double",
    title: "commercialRegistration",
    inputItems: {
      inputType: "text",
      inputID: "commercialRegistration",
      inputName: "commercialRegistration",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "validatyRegister",
    inputItems: {
      inputType: "date",
      inputID: "validatyRegister",
      inputName: "validatyRegister",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  {
    type: "double",
    title: "statisticalCode",
    inputItems: {
      inputType: "text",
      inputID: "statisticalCode",
      inputName: "statisticalCode",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "validatyCode",
    inputItems: {
      inputType: "date",
      inputID: "validatyCode",
      inputName: "validatyCode",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  {
    type: "double",
    title: "chamberNumber",
    inputItems: {
      inputType: "text",
      inputID: "chamberNumber",
      inputName: "chamberNumber",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "validatyChamber",
    inputItems: {
      inputType: "date",
      inputID: "validatyChamber",
      inputName: "validatyChamber",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  // edit here
  {
    type: "double",
    title: "taxNumber",
    inputItems: {
      inputType: "text",
      inputID: "taxNumber",
      inputName: "taxNumber",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "office",
    inputItems: {
      inputType: "text",
      inputID: "office",
      inputName: "office",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "single",
    title: "legalRepresentative",
    inputItems: {
      inputType: "text",
      inputID: "legalRepresentative",
      inputName: "legalRepresentative",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "single",
    title: "representativeNumber",
    inputItems: {
      inputType: "text",
      inputID: "representativeNumber",
      inputName: "representativeNumber",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "single",
    title: "birthDate",
    inputItems: {
      inputType: "date",
      inputID: "birthDate",
      inputName: "birthDate",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  {
    type: "single",
    title: "passportNumber",
    inputItems: {
      inputType: "text",
      inputID: "passportNumber",
      inputName: "passportNumber",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },

  {
    type: "double",
    title: "passportIssuance",
    inputItems: {
      inputType: "date",
      inputID: "passportIssuance",
      inputName: "passportIssuance",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },
  {
    type: "double",
    title: "passportExpiry",
    inputItems: {
      inputType: "date",
      inputID: "passportExpiry",
      inputName: "passportExpiry",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },

  {
    type: "double",
    title: "mobile",
    inputItems: {
      inputType: "text",
      inputID: "mobile",
      inputName: "mobile",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },
  {
    type: "double",
    title: "address",
    inputItems: {
      inputType: "text",
      inputID: "address",
      inputName: "address",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },
];

export default CBLFieldsArray;

export const CBLFooterArray: FieldConfig[] = [
  {
    type: "double",
    title: "date",
    inputItems: {
      inputType: "date",
      inputID: "date",
      inputName: "date",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
    extraTextKey: "sub",
  },
  {
    type: "double",
    title: "name",
    inputItems: {
      inputType: "text",
      inputID: "name",
      inputName: "name",
      inputValue: "",
      onChange: () => {}, // Replace with actual handler
      error: [],
      required: true,
    },
  },
];
