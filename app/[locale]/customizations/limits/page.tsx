"use client";

import React from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { useTranslations } from "next-intl";

const Limits = () => {
  const t = useTranslations("customizations");

  const limitData = [
    {
      FT: "FT001",
      "M/C": "M001",
      from: "User A",
      to: "User B",
      checker: "Admin A",
    },
    {
      FT: "FT002",
      "M/C": "M002",
      from: "User C",
      to: "User D",
      checker: "Admin B",
    },
    {
      FT: "FT003",
      "M/C": "M003",
      from: "User E",
      to: "User F",
      checker: "Admin C",
    },
  ];

  const limitColumns = [
    { key: "FT", label: t("limits.ft") },
    { key: "M/C", label: t("limits.mc") },
    { key: "from", label: t("limits.from") },
    { key: "to", label: t("limits.to") },
    { key: "checker", label: t("limits.checker") },
  ];

  const handleLimitAddClick = () => {
    console.log("Add button clicked for Limits table");
  };

  const handleLimitSearch = (value: string) => {
    console.log("Search value for Limits table:", value);
  };

  const handleLimitDropdownSelect = (value: string) => {
    console.log("Dropdown value selected for Limits table:", value);
  };

  return (
    <div className="p-6">
      <CrudDataGrid
        data={limitData}
        columns={limitColumns}
        showSearchBar={true}
        onSearch={handleLimitSearch}
        onDropdownSelect={handleLimitDropdownSelect}
        dropdownOptions={["Option 1", "Option 2"]}
        showAddButton={true}
        onAddClick={handleLimitAddClick}
      />
    </div>
  );
};

export default Limits;
