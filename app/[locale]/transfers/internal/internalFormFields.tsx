import {
  FaMoneyBillWave,
  FaFileAlt,
  FaExchangeAlt,
} from "react-icons/fa";

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
    name: "curr",
    label: "Currency",
    startIcon: <FaMoneyBillWave />,
    type: "text",
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
