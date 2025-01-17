// data.ts

import { FaEdit, FaTrash } from "react-icons/fa";

export const salariesDataEn = [
  { id: 1, name: "Nader Khaddaj", salary: 5000, deduction: 200 },
  { id: 2, name: "Ismat Al Ayach", salary: 6000, deduction: 300 },
  { id: 3, name: "Mohammad Taha", salary: 5500, deduction: 150 },
];

export const salariesDataAr = [
  { id: 1, name: "نادر خداج", salary: 5000, deduction: 200 },
  { id: 2, name: "عصمت العياش", salary: 6000, deduction: 300 },
  { id: 3, name: "محمد طه", salary: 5500, deduction: 150 },
];

export const salariesColumns = (t: (key: string) => string) => [
  { key: "id", label: t("columns.id") },
  { key: "name", label: t("columns.name") },
  { key: "salary", label: t("columns.salary") },
  { key: "deduction", label: t("columns.deduction") },
];

export const actions = [
  { name: "edit", icon: <FaEdit />, tip: "edit" },
  { name: "delete", icon: <FaTrash />, tip: "delete" },
];
