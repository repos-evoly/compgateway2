import { FaMoneyBillWave, FaFileAlt, FaExchangeAlt } from "react-icons/fa";

export const formFields = [
  {
    name: "from",
    label: "From Account",
    startIcon: <FaExchangeAlt />,
    type: "text",
    width: "w-1/2", // Custom width
  },
  {
    name: "to",
    label: "To Account",
    startIcon: <FaExchangeAlt />,
    type: "text",
    width: "w-1/2", // Custom width
  },
  {
    name: "value",
    label: "Value",
    startIcon: <FaMoneyBillWave />,
    type: "number",
    width: "w-1/2", // Custom width
  },
  {
    name: "receiverOrSender",
    label: "bearer", // Add a label for the radio buttons
    type: "radio",
    options: [
      { value: "receiver", label: "receiver" },
      { value: "sender", label: "sender" },
    ], // Radio button options
    width: "w-full", // Full width for flex alignment
  },
  {
    name: "commision",
    label: "commision",
    startIcon: <FaMoneyBillWave />,
    type: "number",
    width: "w-1/2", // Custom width
  },
  {
    name: "description",
    label: "Description",
    startIcon: <FaFileAlt />,
    type: "text",
    width: "w-full", // Full width
  },
];


export const commissionValue = 1.5; 
