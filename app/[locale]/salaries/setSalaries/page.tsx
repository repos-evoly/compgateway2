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
  // Store selected absolute indices
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Slice data for current page
  const pagedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Selection logic
  const handleRowSelect = (absoluteIndex: number) => {
    setSelectedRows((prev) =>
      prev.includes(absoluteIndex)
        ? prev.filter((i) => i !== absoluteIndex)
        : [...prev, absoluteIndex]
    );
  };

  const handleSelectAll = () => {
    const visibleIndices = pagedData.map((_row, idx) => (currentPage - 1) * PAGE_SIZE + idx);
    const allSelected = visibleIndices.every(idx => selectedRows.includes(idx));
    if (allSelected) {
      setSelectedRows(selectedRows.filter(idx => !visibleIndices.includes(idx)));
    } else {
      setSelectedRows(Array.from(new Set([...selectedRows, ...visibleIndices])));
    }
  };

  // Columns with checkbox
  const columns = [
    {
      key: "select",
      label: "",
      renderCell: (_row: TSalaryRecord, rowIndex: number) => {
        const absoluteIndex = (currentPage - 1) * PAGE_SIZE + rowIndex;
        return (
          <input
            type="checkbox"
            checked={selectedRows.includes(absoluteIndex)}
            onChange={() => handleRowSelect(absoluteIndex)}
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
      {pagedData.length > 0 && pagedData.every((_row, idx) => selectedRows.includes((currentPage - 1) * PAGE_SIZE + idx))
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
