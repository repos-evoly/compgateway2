// data.ts

import { FiEdit, FiTrash2 } from "react-icons/fi";

// English Data
export const salariesDataEn = [
  {
    id: 1,
    date: "2024-01-01",
    month: "January",
    total: 10000,
    submittingDate: "2024-01-05",
    accountNumber: "1234567890",
  },
  {
    id: 2,
    date: "2024-02-01",
    month: "February",
    total: 12000,
    submittingDate: "2024-02-06",
    accountNumber: "0987654321",
  },
  {
    id: 3,
    date: "2024-03-01",
    month: "March",
    total: 11000,
    submittingDate: "2024-03-07",
    accountNumber: "1122334455",
  },
];

// Arabic Data
export const salariesDataAr = [
  {
    id: 1,
    date: "2024-01-01",
    month: "يناير",
    total: 10000,
    submittingDate: "2024-01-05",
    accountNumber: "1234567890",
  },
  {
    id: 2,
    date: "2024-02-01",
    month: "فبراير",
    total: 12000,
    submittingDate: "2024-02-06",
    accountNumber: "0987654321",
  },
  {
    id: 3,
    date: "2024-03-01",
    month: "مارس",
    total: 11000,
    submittingDate: "2024-03-07",
    accountNumber: "1122334455",
  },
];

// Columns (Dynamic)
export const salariesColumns = (t: (key: string) => string) => [
  { key: "accountNumber", label: t("salariesPage.columns.accountNumber") },
  { key: "date", label: t("salariesPage.columns.date") },
  { key: "month", label: t("salariesPage.columns.month") },
  { key: "total", label: t("salariesPage.columns.total") },
  { key: "submittingDate", label: t("salariesPage.columns.submittingDate") },
];

// Actions
export const salariesActions = [
  {
    name: "edit",
    icon: <FiEdit size={18} />,
    tip: "Edit",
    onClick: (rowIndex: number) => {
      console.log(`Edit action clicked for row ${rowIndex}`);
    },
  },
  {
    name: "delete",
    icon: <FiTrash2 size={18} />,
    tip: "Delete",
    onClick: (rowIndex: number) => {
      console.log(`Delete action clicked for row ${rowIndex}`);
    },
  },
];
