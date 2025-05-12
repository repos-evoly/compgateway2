"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { useTranslations } from "next-intl";

const Banks = () => {
  const t = useTranslations("customizations");

  // Example local data
  const bankData = [
    { description: "Bank A", swiftcode: "BKA123", bankNumber: "123456" },
    { description: "Bank B", swiftcode: "BKB456", bankNumber: "654321" },
    { description: "Bank C", swiftcode: "BKC789", bankNumber: "789012" },
  ];

  // Example columns
  const bankColumns = [
    { key: "description", label: t("banks.description") },
    { key: "swiftcode", label: t("banks.swiftcode") },
    { key: "bankNumber", label: t("banks.bankNumber") },
  ];

  // For demonstration, we'll keep pagination at a single page
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  // Handlers
  const handleBankAddClick = () => {
    console.log("Add button clicked for Banks table");
  };

  const handleBankSearch = (value: string) => {
    console.log("Search value for Banks table:", value);
  };

  const handleBankDropdownSelect = (value: string) => {
    console.log("Dropdown value selected for Banks table:", value);
  };

  const handlePageChange = (newPage: number) => {
    // For now, do nothing special
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6">
      <CrudDataGrid
        data={bankData}
        columns={bankColumns}
        showSearchBar={true}
        onSearch={handleBankSearch}
        onDropdownSelect={handleBankDropdownSelect}
        dropdownOptions={["Option 1", "Option 2"]}
        showAddButton={true}
        onAddClick={handleBankAddClick}
        // Provide required pagination props
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Banks;
