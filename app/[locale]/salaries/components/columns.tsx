"use client";

import React from "react";
import type { DataGridColumn } from "@/types";

export type TFunc = (key: string, values?: Record<string, unknown>) => string;

export const buildViewColumns = (t: TFunc): DataGridColumn[] => [
  {
    key: "name",
    label: t("name"),
    renderCell: (row: unknown) => (row as { name: string }).name,
  },
  { key: "salary", label: t("salary") },
  { key: "accountNumber", label: t("accountNumber") },
  { key: "accountType", label: t("accountType") },
  {
    key: "isTransferred",
    label: t("isTransferred", { defaultValue: "Transferred" }),
    renderCell: (row: unknown) =>
      (row as { isTransferred?: boolean }).isTransferred
        ? t("yes", { defaultValue: "Yes" })
        : t("no", { defaultValue: "No" }),
  },
];

export type EditColumnsArgs = {
  t: TFunc;
  selectedRows: number[];
  employeesCount: number;
  toggleAll: () => void;
  toggleRow: (id: number) => void;
  handleSalaryChange: (id: number, value: number) => void;
};

export const buildEditColumns = ({
  t,
  selectedRows,
  employeesCount,
  toggleAll,
  toggleRow,
  handleSalaryChange,
}: EditColumnsArgs): DataGridColumn[] => [
  {
    key: "select",
    label: "",
    renderHeader: () => (
      <input
        type="checkbox"
        checked={employeesCount > 0 && selectedRows.length === employeesCount}
        onChange={toggleAll}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    ),
    renderCell: (row: unknown) => {
      const r = row as { id: number };
      return (
        <input
          type="checkbox"
          checked={selectedRows.includes(r.id)}
          onChange={() => toggleRow(r.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      );
    },
  },
  {
    key: "name",
    label: t("name"),
    renderCell: (row: unknown) => (row as { name: string }).name,
  },
  { key: "email", label: t("email") },
  { key: "phone", label: t("phone") },
  {
    key: "salary",
    label: t("salary"),
    renderCell: (row: unknown) => {
      const r = row as { id: number; salary: number };
      return (
        <input
          type="number"
          value={r.salary}
          min={0}
          onChange={(e) =>
            handleSalaryChange(r.id, Number(e.target.value) || 0)
          }
          className="w-24 rounded border border-gray-300 px-1 py-0.5 text-sm"
        />
      );
    },
  },
  { key: "accountNumber", label: t("accountNumber") },
  { key: "accountType", label: t("accountType") },
];
