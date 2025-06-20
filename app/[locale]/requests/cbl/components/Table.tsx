"use client";

import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useTranslations } from "use-intl";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";

interface TableProps {
  title: string; // Title of the table
  columns: string[]; // Column titles
  /** If true => disable inputs, hide row-add/row-delete */
  readOnly?: boolean;
}

const Table: React.FC<TableProps> = ({ title, columns, readOnly = false }) => {
  // State to manage rows in the table
  const [rows, setRows] = useState<number[]>([0]);

  const t = useTranslations();

  // Handler to add a new row => hide if readOnly
  const addRow = () => {
    setRows((prev) => [...prev, prev.length]);
  };

  // Handler to delete a row => hide if readOnly
  const deleteRow = (rowIndex: number) => {
    setRows((prev) => prev.filter((_, index) => index !== rowIndex));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-300">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-center w-full">{title}</h2>
        {/* Hide the + if readOnly */}
        {!readOnly && (
          <button
            onClick={addRow}
            className="text-gray-500 hover:text-gray-700 transition-colors ml-auto"
            aria-label="Add Row"
          >
            <FaPlus />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          {/* Table Header */}
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300"
                >
                  {col}
                </th>
              ))}
              {/* Hide actions if readOnly */}
              {!readOnly && (
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {rows.map((rowId, rowIndex) => (
              <tr key={rowId} className="border-b">
                {columns.map((_, columnIndex) => (
                  <td key={columnIndex} className="px-4 py-2 border">
                    <FormInputIcon
                      name={`rows.${rowIndex}.${columnIndex}`}
                      label=""
                      textColor="text-gray-700"
                      type="text"
                      disabled={readOnly} // disable if readOnly
                    />
                  </td>
                ))}

                {!readOnly && (
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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
