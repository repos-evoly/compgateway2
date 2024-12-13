const CheckFieldsArrayNew = [
  {
    section: "Check Details",
    fields: [
      {
        title: "Name",
        name: "name",
        type: "text",
        required: true,
        helperText: "Enter the name.",
      },
      {
        title: "Address",
        name: "address",
        type: "text",
        required: true,
        helperText: "Enter the address.",
      },
      {
        title: "Account Number",
        name: "accNum",
        type: "text",
        required: true,
        helperText: "Enter the account number.",
      },
      {
        title: "Send To",
        name: "sendTo",
        type: "text",
        required: true,
        helperText: "Enter the recipient's details.",
      },
    ],
  },
  {
    section: "Additional Details",
    fields: [
      {
        title: "Branch",
        name: "branch",
        type: "text",
        required: true,
        helperText: "Enter the branch name.",
      },
      {
        title: "Date",
        name: "date",
        type: "date",
        required: true,
        helperText: "Select the date.",
      },
    ],
  },
  {
    section: "Checkbox Options",
    fields: [
      {
        title: "Options",
        name: "checkboxOptions",
        type: "checkbox",
        options: [
          { label: "24", value: "24" },
          { label: "48", value: "48" },
        ],
      },
    ],
  },
];

export default CheckFieldsArrayNew;
