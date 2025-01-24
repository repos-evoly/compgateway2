"use client";

import React from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { useTranslations } from "next-intl";

const Commissions = () => {
  const t = useTranslations("customizations");

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

  return (
    <div className="p-6">
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
    </div>
  );
};

export default Commissions;
