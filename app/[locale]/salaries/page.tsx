/* --------------------------------------------------------------------------
   app/[locale]/salaries/page.tsx
   – Lists salary cycles with paging and PDF download.
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import Button from "@/app/components/reusable/Button";
import SalariesDownloadPdf from "@/app/components/reusable/SalariesDownloadPdf";

import type { SalaryCyclesResponse, TSalaryTransaction } from "./types";
import { getEmployeeSalaryCycles } from "./services";
import LoadingPage from "@/app/components/reusable/Loading";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function SalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");

  /* ------------------- state -------------------------------------- */
  const [transactions, setTransactions] = useState<TSalaryTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------- fetch cycles ------------------------------- */
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res: SalaryCyclesResponse = await getEmployeeSalaryCycles();
        setTransactions(res.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load salary cycles.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  /* ------------------- paging helpers ----------------------------- */
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const handlePageChange = (p: number) => setCurrentPage(p);

  /* ------------------- grid columns ------------------------------- */
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "salaryMonth",
      label: "Salary Month",
      renderCell: (row: TSalaryTransaction) => {
        const v = row.salaryMonth as unknown as string | null | undefined;
        return typeof v === "string" && v.trim().length > 0 ? v : "";
      },
    },
    {
      key: "additionalMonth",
      label: "Additional Month",
      renderCell: (row: TSalaryTransaction) => {
        const v = row.additionalMonth;
        return v && String(v).trim().length > 0 ? String(v) : "";
      },
    },
    { key: "totalAmount", label: "Total Amount" },
    { key: "currency", label: "Currency" },
    {
      key: "entries",
      label: "Employees",
      renderCell: (row: TSalaryTransaction) => (
        <span>{row.entries.length}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      renderCell: (row: TSalaryTransaction) =>
        new Date(row.createdAt).toLocaleDateString(locale),
    },
    { key: "createdByUserId", label: "Created By" },
    {
      key: "postedAt",
      label: "Posted At",
      renderCell: (row: TSalaryTransaction) =>
        row.postedAt ? new Date(row.postedAt).toLocaleDateString(locale) : "-",
    },
    {
      key: "postedByUserId",
      label: "Posted By",
      renderCell: (row: TSalaryTransaction) => row.postedByUserId ?? "-",
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (row: TSalaryTransaction) => (
        <SalariesDownloadPdf transaction={row} />
      ),
    },
  ];

  /* ------------------- header button ------------------------------ */
  const setSalariesButton = (
    <Button
      actions={{ type: "navigate", href: `/${locale}/salaries/setSalaries` }}
      isTransparent
    >
      {t("setSalaries")}
    </Button>
  );

  /* ------------------- data slice --------------------------------- */
  const pagedData = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ------------------- render ------------------------------------- */
  if (loading) return <LoadingPage />;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

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
        childrens={setSalariesButton}
      />
    </div>
  );
}
