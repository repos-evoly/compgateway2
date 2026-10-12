/* --------------------------------------------------------------------------
   app/[locale]/salaries/page.tsx
   – Lists salary cycles with paging and PDF download.
   -------------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Cookies from "js-cookie";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import Button from "@/app/components/reusable/Button";
import SalariesDownloadPdf from "@/app/components/reusable/SalariesDownloadPdf";

import type { SalaryCyclesResponse, TSalaryTransaction } from "./types";
import { getEmployeeSalaryCycles } from "./services";
import LoadingPage from "@/app/components/reusable/Loading";
import SalaryStatusBadge from "./components/SalaryStatusBadge";
import {
  getSalaryCycleDisplayStatus,
  isSalaryCycleCompleted,
} from "./salaryStatus";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10;

const formatAmountWithCommas = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("en-US");
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return raw;

    const parsed = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(parsed)) {
      return parsed.toLocaleString("en-US");
    }

    return raw;
  }

  return "";
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function SalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const canCreate = (() => {
    try {
      const raw = Cookies.get("permissions") ?? "";
      const parsed = raw
        ? JSON.parse(decodeURIComponent(raw).replace(/^"|"$/g, ""))
        : [];
      return Array.isArray(parsed) && parsed.includes("canCreateOrEditSalaryCycle");
    } catch {
      return false;
    }
  })();

  /* ------------------- state -------------------------------------- */
  const [transactions, setTransactions] = useState<TSalaryTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------- fetch cycles ------------------------------- */
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    const fetchCycles = async () => {
      try {
        setLoading(true);
        setError(null);

        const res: SalaryCyclesResponse = await getEmployeeSalaryCycles(
          currentPage,
          PAGE_SIZE,
          { signal: controller.signal }
        );

        if (!isActive) return;

        setTransactions(res.data);
        setTotalPages(Math.max(1, res.totalPages || 1));
      } catch (err: unknown) {
        if (!isActive) return;

        const message =
          err instanceof DOMException && err.name === "AbortError"
            ? "Salary cycles request timed out. Please try again."
            : err instanceof Error
              ? err.message
              : "Failed to load salary cycles.";
        setError(message);
      } finally {
        if (!isActive) return;

        setLoading(false);
        window.clearTimeout(timeoutId);
      }
    };

    fetchCycles();
    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentPage]);

  /* ------------------- paging helpers ----------------------------- */
  const handlePageChange = (p: number) => setCurrentPage(p);

  /* ------------------- grid columns ------------------------------- */
  const columns = [
    { key: "id", label: t("id") },
    {
      key: "salaryMonth",
      label: t("salaryMonth"),
      renderCell: (row: TSalaryTransaction) => {
        const v = row.salaryMonth as unknown as string | null | undefined;
        return typeof v === "string" && v.trim().length > 0 ? v : "";
      },
    },
    {
      key: "additionalMonth",
      label: t("additionalMonth"),
      renderCell: (row: TSalaryTransaction) => {
        const v = row.additionalMonth;
        return v && String(v).trim().length > 0 ? String(v) : "";
      },
    },
    {
      key: "totalAmount",
      label: t("totalAmount"),
      renderCell: (row: TSalaryTransaction) =>
        formatAmountWithCommas(row.totalAmount),
    },
    { key: "currency", label: t("currency") },
    {
      key: "entries",
      label: t("employees"),
      renderCell: (row: TSalaryTransaction) => (
        <span>{row.entryCount ?? row.entries?.length ?? 0}</span>
      ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      renderCell: (row: TSalaryTransaction) =>
        new Date(row.createdAt).toLocaleDateString(locale),
    },
    { key: "createdByUserId", label: t("createdBy") },
    {
      key: "postedAt",
      label: t("postedAt"),
      renderCell: (row: TSalaryTransaction) =>
        row.postedAt ? new Date(row.postedAt).toLocaleDateString(locale) : "-",
    },
    {
      key: "postedByUserId",
      label: t("postedBy"),
      renderCell: (row: TSalaryTransaction) => row.postedByUserId ?? "-",
    },
    {
      key: "postingStatus",
      label: t("status"),
      renderCell: (row: TSalaryTransaction) => (
        <SalaryStatusBadge
          status={getSalaryCycleDisplayStatus(row)}
        />
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      renderCell: (row: TSalaryTransaction) => {
        if (!isSalaryCycleCompleted(row)) return null;

        return <SalariesDownloadPdf transaction={row} />;
      },
    },
  ];

  /* ------------------- header button ------------------------------ */
  const setSalariesButton = canCreate ? (
    <Button
      actions={{ type: "navigate", href: `/${locale}/salaries/setSalaries` }}
      isTransparent
    >
      {t("setSalaries")}
    </Button>
  ) : undefined;

  /* ------------------- data slice --------------------------------- */
  const pagedData = transactions;

  /* ------------------- render ------------------------------------- */
  if (loading && transactions.length === 0) return <LoadingPage />;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={pagedData}
        columns={columns}
        showActions={false}
        showSearchBar={false}
        showAddButton={false}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
        childrens={setSalariesButton}
      />
    </div>
  );
}
