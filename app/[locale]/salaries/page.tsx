"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import Button from "@/app/components/reusable/Button";
import type { TSalaryTransaction } from "./types";
import salaryTransactionsDataJson from "./salaryTransactionsData.json";
import SalariesDownloadPdf from "@/app/components/reusable/SalariesDownloadPdf";

const PAGE_SIZE = 10;

const salaryTransactionsData: TSalaryTransaction[] =
  salaryTransactionsDataJson as unknown as TSalaryTransaction[];

export default function SalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");

  /* ------------------- state ---------------------------------------- */
  const [transactions] = useState<TSalaryTransaction[]>(salaryTransactionsData);
  const [currentPage, setCurrentPage] = useState(1);

  /* ------------------- paging helpers ------------------------------- */
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const handlePageChange = (p: number) => setCurrentPage(p);

  /* ------------------- columns for transactions --------------------- */
  const transactionColumns = [
    { key: "genCode", label: "GenCode" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "employeeName", label: "Employee" },
    { key: "status", label: "Status" },
    { key: "transactionType", label: "Type" },
    {
      key: "accounts",
      label: "Accounts",
      renderCell: (row: TSalaryTransaction) => (
        <span className="text-xs">
          {row.accounts.length} account{row.accounts.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (row: TSalaryTransaction) => (
       <SalariesDownloadPdf transaction={row}/>
      ),
    },
  ];

  /* ------------------- header button (Button) ----------------------- */
  const setSalariesButton = (
    <Button
      actions={{ type: "navigate", href: `/${locale}/salaries/setSalaries` }}
      isTransparent
    >
      {t("setSalaries")}
    </Button>
  );

  /* ------------------- data slice ----------------------------------- */
  const pagedData = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ------------------- render --------------------------------------- */
  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={pagedData}
        columns={transactionColumns}
        showActions={false}
        showSearchBar={false}
        showAddButton={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        childrens={setSalariesButton}
      />
    </div>
  );
}
