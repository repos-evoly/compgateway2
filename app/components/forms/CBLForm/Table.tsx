import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useTranslations } from "use-intl";

interface TableProps {
  title: string; // Title of the table
  columns: string[]; // Column titles
}

const Table: React.FC<TableProps> = ({ title, columns }) => {
  // State to manage rows in the table
  const [rows, setRows] = useState<string[][]>([
    Array(columns.length).fill(""),
  ]);

  const t = useTranslations();
  // Handler to add a new row
  const addRow = () => {
    setRows([...rows, Array(columns.length).fill("")]);
  };

  // Handler to delete a row
  const deleteRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };

  // Handler to update cell content
  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnIndex] = value;
    setRows(updatedRows);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-300">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-center w-full">{title}</h2>
        <button
          onClick={addRow}
          className="text-gray-500 hover:text-gray-700 transition-colors ml-auto"
          aria-label="Add Row"
        >
          <FaPlus />
        </button>
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
              <th className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300">
                {t("actions")}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {row.map((cell, columnIndex) => (
                  <td key={columnIndex} className="px-4 py-2 border">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIndex, columnIndex, e.target.value)
                      }
                      className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </td>
                ))}
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Delete Row"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
