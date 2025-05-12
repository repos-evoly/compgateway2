"use client";

import React, { useState } from "react";
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

  // Build columns with your translation function
  const columns = salariesColumns(t);

  // Provide minimal pagination for CrudDataGrid
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 1;

  const handlePageChange = (newPage: number) => {
    console.log("Page changed to:", newPage);
    setCurrentPage(newPage);
  };

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={data}
        columns={columns}
        showActions={true}
        actions={salariesActions}
        showSearchBar={false}
        showAddButton={false}
        // Provide these 3 props to satisfy CrudDataGrid requirements:
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SalariesPage;
