"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import {
  salariesDataEn,
  salariesDataAr,
  salariesColumns,
  salariesActions,
} from "./data";

const SalariesPage = () => {
  const locale = useLocale();
  const t = useTranslations("salaries");

  // Select data based on locale
  const data = locale === "ar" ? salariesDataAr : salariesDataEn;

  // Columns
  const columns = salariesColumns(t);

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={data}
        columns={columns}
        showActions={true} // Enable actions column
        actions={salariesActions} // Pass actions
        showSearchBar={false} // Disable search bar
        showAddButton={false} // Disable add button
      />
    </div>
  );
};

export default SalariesPage;
