"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import {
  salariesDataEn,
  salariesDataAr,
  salariesColumns,
  actions,
} from "./data";

const UploadFiels = () => {
  const locale = useLocale();
  const t = useTranslations("salaries"); // Translations for the page

  // Determine which data and columns to use based on locale
  const data = locale === "ar" ? salariesDataAr : salariesDataEn;
  const columns = salariesColumns(t);

  // Handlers

  const handleAddClick = () => console.log("Add button clicked");

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={data}
        columns={columns}
        showActions={true}
        actions={actions}
        showAddButton={true}
        onAddClick={handleAddClick}
      />
    </div>
  );
};

export default UploadFiels;
