/* --------------------------------------------------------------------------
   components/Table.tsx
   -------------------------------------------------------------------------- */
"use client";

import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useTranslations } from "use-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";

interface TableProps {
  title: string;
  columns: string[];
  readOnly?: boolean;
  /** All Formik field paths will be prefixed with this string. */
  fieldNamePrefix?: string;
}

const Table: React.FC<TableProps> = ({
  title,
  columns,
  readOnly = false,
  fieldNamePrefix = "rows", // ← NEW (default)
}) => {
  const [rows, setRows] = useState<number[]>([0]);
  const t = useTranslations();

  const addRow = () => setRows((prev) => [...prev, prev.length]);
  const deleteRow = (idx: number) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-md">
      {/* Title + “add row” */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="w-full text-center text-lg font-semibold">{title}</h2>
        {!readOnly && (
          <button
            onClick={addRow}
            className="ml-auto text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Add Row"
          >
            <FaPlus />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  {col}
                </th>
              ))}
              {!readOnly && (
                <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((rowId, rowIdx) => (
              <tr key={rowId} className="border-b">
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="border px-4 py-2">
                    <FormInputIcon
                      name={`${fieldNamePrefix}.${rowIdx}.${colIdx}`}
                      label=""
                      type="text"
                      textColor="text-gray-700"
                      disabled={readOnly}
                    />
                  </td>
                ))}

                {!readOnly && (
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      className="text-red-500 transition-colors hover:text-red-700"
                      aria-label="Delete Row"
                    >
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
