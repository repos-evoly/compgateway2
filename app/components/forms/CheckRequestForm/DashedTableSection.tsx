"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

const FixedDashedTableSection: React.FC = () => {
  const t = useTranslations("CheckRequest");

  // Initial data for the table (fixed rows)
  const [rows, setRows] = useState<string[][]>([
    Array(2).fill(""), // Two input fields for LYD and Dirham
    Array(2).fill(""),
    Array(2).fill(""),
  ]);

  // Update a cell
  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnIndex] = value;
    setRows(updatedRows);
  };

  return (
    <div className="flex flex-col justify-start bg-gray-50 p-6 rounded-lg">
      {/* Currency Section at the Top */}
      <div className="flex justify-end mb-4 gap-4">
        <div className="border border-gray-300 p-2 w-24 text-center bg-gray-100">
          {t("curr")}
        </div>
        <div className="border border-gray-300 p-2 w-24 text-center bg-gray-100">
          {t("lyd")}
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-300">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            {/* Table Header */}
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-100 border text-gray-700">
                  {/* Empty header for the first column */}
                </th>
                <th className="px-4 py-2 bg-gray-100 border text-gray-700">
                  {t("dirham")}
                </th>
                <th className="px-4 py-2 bg-gray-100 border text-gray-700">
                  {t("lyd")}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {[
                t("amount"), // First row label
                t("expenses"), // Second row label
                t("totalAmount"), // Third row label
              ].map((label, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {/* Row Label */}
                  <td className="px-4 py-2 border text-gray-700 bg-gray-100 text-right">
                    {label}
                  </td>

                  {/* Input fields */}
                  {rows[rowIndex]?.map((cell, columnIndex) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FixedDashedTableSection;
