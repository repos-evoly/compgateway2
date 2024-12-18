"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import StatementGenerator from "./StatementOfAccountsContainer"; // Import the StatementGenerator component
import {
  withCurrencyDataEn,
  withCurrencyDataAr,
  withCurrencyColumnsEn,
  withCurrencyColumnsAr,
} from "./data";

const Page = () => {
  const locale = useLocale();
  const [showTable, setShowTable] = useState(false); // State to toggle table visibility

  // Determine which data and columns to use based on locale
  const withCurrencyData =
    locale === "ar" ? withCurrencyDataAr : withCurrencyDataEn;
  const withCurrencyColumns =
    locale === "ar" ? withCurrencyColumnsAr : withCurrencyColumnsEn;

  // Information to display in the header
  const accountInfo =
    locale === "ar" ? "الحساب: 01-4011-0001" : "Account: 01-4011-0001";
  const fromDateInfo =
    locale === "ar" ? "من التاريخ: 01/12/2024" : "From Date: 01/12/2024";
  const toDateInfo =
    locale === "ar" ? "إلى التاريخ: 30/12/2024" : "To Date: 30/12/2024";

  // Handle the continue button click
  const handleContinue = () => {
    setShowTable(true); // Show the table below the form
  };

  const handlePrint = () => {
    console.log("Print PDF functionality triggered");
    // Implement your print logic here (e.g., generating PDF using jsPDF or other libraries)
  };

  return (
    <div className="p-8 flex flex-col items-center space-y-12">
      {/* Statement Generator */}
      <div className="bg-white p-6 rounded-md w-full ">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {locale === "ar"
            ? "توليد كشف الحساب"
            : "Generate Statement of Accounts"}
        </h2>
        <StatementGenerator onContinue={handleContinue} />
      </div>

      {/* With Currency Data Grid - Display below the form */}
      {showTable && (
        <div className="bg-white p-6 rounded-md w-full space-y-6">
          <CrudDataGrid
            data={withCurrencyData}
            columns={withCurrencyColumns}
            showSearchBar={false}
            showAddButton={false}
          >
            {/* Header Information */}
            <div className="text-sm text-white">{accountInfo}</div>
            <div className="text-sm text-white">{fromDateInfo}</div>
            <div className="text-sm text-white">{toDateInfo}</div>
          </CrudDataGrid>

          {/* Print Button */}
          <div className="flex justify-end">
            <button
              onClick={handlePrint}
              className="bg-info-dark hover:bg-warning-light text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300"
            >
              {locale === "ar" ? "طباعة PDF" : "Print PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
