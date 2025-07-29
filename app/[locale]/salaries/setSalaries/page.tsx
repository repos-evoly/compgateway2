/* --------------------------------------------------------------------------
   app/[locale]/salaries/setSalaries/page.tsx
   – First-column header checkbox toggles select-all / deselect-all.
   – Right-side buttons: Back + Submit.  Total amount on the left.
   – `columns` is a mutable `DataGridColumn[]`; no ESLint “unused vars” error.
   -------------------------------------------------------------------------- */
"use client";

import React, { useMemo, useState } from "react";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";

import type { DataGridColumn } from "@/types";
import type { TSalaryRecord } from "../types";
import salariesDataJson from "../salariesData.json";

const PAGE_SIZE = 10;

/* Parse JSON and ensure `accountType` keeps its literal union */
const salariesData: TSalaryRecord[] = (
  salariesDataJson as unknown as TSalaryRecord[]
).map((r) => ({
  ...r,
  accountType: r.accountType as "account" | "wallet",
}));

export default function SetSalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");

  /* -------------------------------- state --------------------------- */
  const [data] = useState<TSalaryRecord[]>(salariesData);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  /* ------------------------------ paging ---------------------------- */
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const handlePageChange = (p: number) => setCurrentPage(p);

  /* ------------------------------ slice ----------------------------- */
  const pagedData = data.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ------------------------- selection logic ------------------------ */
  const handleRowSelect = (email: string) => {
    setSelectedRows((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    const visible = pagedData.map((r) => r.email);
    const allSelected = visible.every((e) => selectedRows.includes(e));

    setSelectedRows(
      (prev) =>
        allSelected
          ? prev.filter((e) => !visible.includes(e)) // deselect visible
          : [...new Set([...prev, ...visible])] // select visible
    );
  };

  /* ----------------------- accumulated salary ----------------------- */
  const totalSelectedSalary = useMemo(
    () =>
      data
        .filter((r) => selectedRows.includes(r.email))
        .reduce((sum, r) => sum + r.salary, 0),
    [data, selectedRows]
  );

  /* -------------------------- submit ------------------------------- */
  const handleSubmitSelected = () => {
    const selectedRecords = data.filter((r) => selectedRows.includes(r.email));
    console.log("Selected salary rows:", selectedRecords);
  };

  /* --------------------------- columns ------------------------------ */
  const columns: DataGridColumn[] = [
    {
      key: "select",
      label: "",
      renderHeader: () => (
        <input
          type="checkbox"
          checked={
            pagedData.length > 0 &&
            pagedData.every((r) => selectedRows.includes(r.email))
          }
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
      // Reference rowIndex so ESLint doesn’t flag it as unused
      renderCell: (row: TSalaryRecord, rowIndex: number) => (
        <input
          id={`row-${rowIndex}`}
          type="checkbox"
          checked={selectedRows.includes(row.email)}
          onChange={() => handleRowSelect(row.email)}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "salary", label: t("salary") },
    { key: "date", label: t("date") },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType", { defaultValue: "Type" }) },
  ];

  /* ----------------------- header controls -------------------------- */
  const headerControls = (
    <div className="flex w-full items-center justify-between">
      {/* Right: Back + Submit */}
      <div className="flex items-center gap-2">
        <BackButton isEditing fallbackPath={`/${locale}/salaries`} />

        <Formik initialValues={{}} onSubmit={handleSubmitSelected}>
          {() => (
            <SubmitButton
              title={t("submit", { defaultValue: "Submit" })}
              color="info-dark"
              fullWidth={false}
              disabled={selectedRows.length === 0}
            />
          )}
        </Formik>
      </div>
      {/* Left: total amount */}
      <div className="flex items-baseline gap-2 text-white font-semibold">
        <span>{t("totalAmount", { defaultValue: "Total Amount:" })}</span>
        <span>{totalSelectedSalary.toLocaleString()}</span>
      </div>
    </div>
  );

  /* ---------------------------- render ------------------------------ */
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
        childrens={headerControls}
        canEdit={false}
      />
    </div>
  );
}
