import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export const data = [
  { id: 1, name: "جون دو", email: "john@example.com" },
  { id: 2, name: "جين سميث", email: "jane@example.com" },
  { id: 3, name: "جون دو", email: "john@example.com" },
  { id: 4, name: "جين سميث", email: "jane@example.com" },
  { id: 5, name: "جون دو", email: "john@example.com" },
  { id: 6, name: "جين سميث", email: "jane@example.com" },
  { id: 7, name: "جون دو", email: "john@example.com" },
  { id: 8, name: "جين سميث", email: "jane@example.com" },
  { id: 9, name: "جون دو", email: "john@example.com" },
];

export const columns = [
  { key: "id", label: "المعرف" },
  { key: "name", label: "الاسم" },
  { key: "email", label: "البريد الإلكتروني" },
];

export const actions = [
  { name: "edit", icon: <FiEdit size={18} />, tip: "التعديل" },
  { name: "delete", icon: <FiTrash2 size={18} />, tip: "حذف" },
];

export const dropdownOptions = ["Option 1", "Option 2"];
