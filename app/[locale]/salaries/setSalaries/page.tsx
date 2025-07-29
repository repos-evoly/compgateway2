"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { TSalaryRecord } from "../types";
import salariesData from "../salariesData.json";

const PAGE_SIZE = 10;

const SetSalariesPage = () => {
  const locale = useLocale();
  const t = useTranslations("salaries");

  // Data state
  const [data] = useState<TSalaryRecord[]>(salariesData);
  // Store selected row IDs (using email as unique identifier)
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Slice data for current page
  const pagedData = data.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Selection logic
  const handleRowSelect = (email: string) => {
    setSelectedRows((prev) => {
      const isSelected = prev.includes(email);
      if (isSelected) {
        return prev.filter((id) => id !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSelectAll = () => {
    const visibleEmails = pagedData.map((row) => row.email);
    const allSelected = visibleEmails.every((email) =>
      selectedRows.includes(email)
    );

    if (allSelected) {
      // Deselect all visible rows
      setSelectedRows((prev) =>
        prev.filter((email) => !visibleEmails.includes(email))
      );
    } else {
      // Select all visible rows that aren't already selected
      setSelectedRows((prev) => {
        const newSelection = [...prev];
        visibleEmails.forEach((email) => {
          if (!newSelection.includes(email)) {
            newSelection.push(email);
          }
        });
        return newSelection;
      });
    }
  };

  // Columns with checkbox
  const columns = [
    {
      key: "select",
      label: "",
      renderCell: (row: TSalaryRecord) => {
        const isSelected = selectedRows.includes(row.email);
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleRowSelect(row.email)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      },
      width: 40,
    },
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "salary", label: t("salary") },
    { key: "date", label: t("date") },
    { key: "accountNumber", label: t("accountNumber") },
  ];

  // Select All button for header
  const selectAllButton = (
    <button
      className="rounded bg-info-dark px-4 py-2 text-white hover:bg-info ml-2"
      onClick={handleSelectAll}
    >
      {pagedData.length > 0 &&
      pagedData.every((row) => selectedRows.includes(row.email))
        ? t("deselectAll", { defaultValue: "Deselect All" })
        : t("selectAll", { defaultValue: "Select All" })}
    </button>
  );

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={pagedData}
        columns={columns}
        showActions={false}
        showSearchBar={false}
        showAddButton={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        childrens={selectAllButton}
      />
    </div>
  );
};

export default SetSalariesPage;
