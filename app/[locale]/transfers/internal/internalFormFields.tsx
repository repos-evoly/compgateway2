import {
  FaMoneyBillWave,
  FaFileAlt,
  FaExchangeAlt,
  FaCalendar,
} from "react-icons/fa";

export const formFields = [
  {
    name: "from",
    label: "From Account",
    startIcon: <FaExchangeAlt />,
    type: "text",
  },
  {
    name: "to",
    label: "To Account",
    startIcon: <FaExchangeAlt />,
    type: "text",
  },
  {
    name: "value",
    label: "Value",
    startIcon: <FaMoneyBillWave />,
    type: "number",
  },
  {
    name: "curr",
    label: "Currency",
    startIcon: <FaMoneyBillWave />,
    type: "text",
  },
  {
    name: "description",
    label: "Description",
    startIcon: <FaFileAlt />,
    type: "text",
  },
  {
    name: "ends",
    label: "Transaction Date",
    startIcon: <FaCalendar />, // Icon for Date Picker
    type: "date", // Add a new type 'date'
  },
];
