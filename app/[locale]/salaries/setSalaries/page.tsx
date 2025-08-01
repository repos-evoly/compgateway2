/* --------------------------------------------------------------------------
   app/[locale]/salaries/setSalaries/page.tsx
   – No-pagination version: header checkbox toggles select-all across all rows.
   – Right-side controls: Back + Submit.  Total amount on the left.
   – Grid body scrolls vertically; header row is sticky (per earlier edits).
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

/* ───────────────────────────── data ─────────────────────────────── */
const salariesData: TSalaryRecord[] = (
  salariesDataJson as unknown as TSalaryRecord[]
).map((r) => ({
  ...r,
  accountType: r.accountType as "account" | "wallet",
}));

export default function SetSalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");

  const [data] = useState<TSalaryRecord[]>(salariesData);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  /* ──────────────────────── selection logic ──────────────────────── */
  const handleRowSelect = (email: string) => {
    setSelectedRows((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    const allSelected = data.every((r) => selectedRows.includes(r.email));
    setSelectedRows(allSelected ? [] : data.map((r) => r.email));
  };

  /* ────────────────────── accumulated salary ─────────────────────── */
  const totalSelectedSalary = useMemo(
    () =>
      data
        .filter((r) => selectedRows.includes(r.email))
        .reduce((sum, r) => sum + r.salary, 0),
    [data, selectedRows]
  );

  /* ─────────────────────────── submit ────────────────────────────── */
  const handleSubmitSelected = () => {
    const selectedRecords = data.filter((r) => selectedRows.includes(r.email));
    console.log("Selected salary rows:", selectedRecords);
  };

  /* ───────────────────────── columns ─────────────────────────────── */
  const columns: DataGridColumn[] = [
    {
      key: "select",
      label: "",
      renderHeader: () => (
        <input
          type="checkbox"
          checked={
            data.length > 0 && data.every((r) => selectedRows.includes(r.email))
          }
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
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

  /* ─────────────────────── header controls ───────────────────────── */
  const headerControls = (
    <div className="flex w-full items-center justify-between">
      {/* right: back + submit */}
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

      {/* left: total amount */}
      <div className="flex items-baseline gap-2 text-white font-semibold">
        <span>{t("totalAmount", { defaultValue: "Total Amount:" })}</span>
        <span>{totalSelectedSalary.toLocaleString()}</span>
      </div>
    </div>
  );

  /* ────────────────────────── render ─────────────────────────────── */
  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={data}
        columns={columns}
        showActions={false}
        showSearchBar={false}
        showAddButton={true}
        noPagination /* ← SCROLLABLE, footer hidden */
        currentPage={1} /* dummy values satisfy TS */
        totalPages={1}
        onPageChange={() => {}}
        childrens={headerControls}
        canEdit={false}
      />
    </div>
  );
}
