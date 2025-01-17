"use client";

import React from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { useTranslations } from "next-intl";

const Customizations = () => {
  const t = useTranslations("customizations");

  // Data for the Banks table
  const bankData = [
    { description: "Bank A", swiftcode: "BKA123", bankNumber: "123456" },
    { description: "Bank B", swiftcode: "BKB456", bankNumber: "654321" },
    { description: "Bank C", swiftcode: "BKC789", bankNumber: "789012" },
  ];

  const bankColumns = [
    { key: "description", label: t("banks.description") },
    { key: "swiftcode", label: t("banks.swiftcode") },
    { key: "bankNumber", label: t("banks.bankNumber") },
  ];

  const handleBankAddClick = () => {
    console.log("Add button clicked for Banks table");
  };

  const handleBankSearch = (value: string) => {
    console.log("Search value for Banks table:", value);
  };

  const handleBankDropdownSelect = (value: string) => {
    console.log("Dropdown value selected for Banks table:", value);
  };

  // Data for the Commissions table
  const commissionData = [
    {
      TC: "001",
      from: "Bank A",
      to: "Bank B",
      per: "per001",
      value: 1000,
      bearer: "Bank A",
    },
    {
      TC: "002",
      from: "Bank B",
      to: "Bank C",
      per: "per002",
      value: 2000,
      bearer: "Bank B",
    },
    {
      TC: "003",
      from: "Bank C",
      to: "Bank A",
      per: "per003",
      value: 1500,
      bearer: "Bank C",
    },
  ];

  const commissionColumns = [
    { key: "TC", label: t("commissions.tc") },
    { key: "from", label: t("commissions.from") },
    { key: "to", label: t("commissions.to") },
    { key: "per", label: t("commissions.per") },
    { key: "value", label: t("commissions.value") },
    { key: "bearer", label: t("commissions.bearer") },
  ];

  const handleCommissionAddClick = () => {
    console.log("Add button clicked for Commissions table");
  };

  const handleCommissionSearch = (value: string) => {
    console.log("Search value for Commissions table:", value);
  };

  const handleCommissionDropdownSelect = (value: string) => {
    console.log("Dropdown value selected for Commissions table:", value);
  };

  // Data for the Limits table
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
      <h1 className="text-2xl font-bold mb-4">{t("banks.title")}</h1>
      <CrudDataGrid
        data={bankData}
        columns={bankColumns}
        showSearchBar={true}
        onSearch={handleBankSearch}
        onDropdownSelect={handleBankDropdownSelect}
        dropdownOptions={["Option 1", "Option 2"]}
        showAddButton={true}
        onAddClick={handleBankAddClick}
      />

      <h1 className="text-2xl font-bold mt-8 mb-4">{t("commissions.title")}</h1>
      <CrudDataGrid
        data={commissionData}
        columns={commissionColumns}
        showSearchBar={true}
        onSearch={handleCommissionSearch}
        onDropdownSelect={handleCommissionDropdownSelect}
        dropdownOptions={["Option 1", "Option 2"]}
        showAddButton={true}
        onAddClick={handleCommissionAddClick}
      />

      <h1 className="text-2xl font-bold mt-8 mb-4">{t("limits.title")}</h1>
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

export default Customizations;
