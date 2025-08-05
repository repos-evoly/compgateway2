/* --------------------------------------------------------------------------
   app/[locale]/salaries/setSalaries/page.tsx
   – Updated to use API /api/employees/salarycycles to fetch employees
   – Handles salary cycle submission for selected employees
   – No-pagination version: header checkbox toggles select-all across all rows.
   – Right-side controls: Back + Submit.  Total amount on the left.
   – Grid body scrolls vertically; header row is sticky (per earlier edits).
   -------------------------------------------------------------------------- */
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";

import type { DataGridColumn } from "@/types";
import type { SalaryCyclePayload } from "../services";
import { submitSalaryCycle } from "../services";
import { getEmployees } from "../../employees/services";
import type { EmployeeResponse } from "../../employees/types";

export default function SetSalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");

  const [data, setData] = useState<EmployeeResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ──────────────────────── fetch employees ───────────────────────── */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Starting to fetch employees...");
        const response = await getEmployees(1, 100); // Get up to 100 employees
        const employees = response.data;
        console.log("Successfully fetched employees:", employees);
        setData(employees);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch employees";
        setError(errorMessage);
        console.error("Error details:", {
          message: errorMessage,
          error: err,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  /* ──────────────────────── selection logic ──────────────────────── */
  const handleRowSelect = (employeeId: number) => {
    setSelectedRows((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    const allSelected = data.every((r) => selectedRows.includes(r.id));
    setSelectedRows(allSelected ? [] : data.map((r) => r.id));
  };

  /* ────────────────────── accumulated salary ─────────────────────── */
  const totalSelectedSalary = useMemo(
    () =>
      data
        .filter((r) => selectedRows.includes(r.id))
        .reduce((sum, r) => sum + r.salary, 0),
    [data, selectedRows]
  );

  /* ─────────────────────────── submit ────────────────────────────── */
  const handleSubmitSelected = async () => {
    try {
      const selectedRecords = data.filter((r) =>
        selectedRows.includes(r.id)
      );

      // Prepare salary cycle payload
      const payload: SalaryCyclePayload = {
        employeeIds: selectedRecords.map((r) => r.id),
        salaryAmounts: selectedRecords.reduce((acc, r) => {
          acc[r.id] = r.salary;
          return acc;
        }, {} as { [employeeId: number]: number }),
        cycleDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        accountNumbers: selectedRecords.reduce((acc, r) => {
          if (r.accountNumber) {
            acc[r.id] = r.accountNumber;
          }
          return acc;
        }, {} as { [employeeId: number]: string }),
        accountTypes: selectedRecords.reduce((acc, r) => {
          if (r.accountType) {
            acc[r.id] = r.accountType as "account" | "wallet";
          }
          return acc;
        }, {} as { [employeeId: number]: "account" | "wallet" }),
      };

      console.log("Submitting salary cycle payload:", payload);

      const result = await submitSalaryCycle(payload);

      if (result.success) {
        alert("Salary cycle submitted successfully!");
        // Optionally refresh the data or redirect
        setSelectedRows([]);
      } else {
        alert(`Failed to submit salary cycle: ${result.message}`);
      }
    } catch (err) {
      console.error("Failed to submit salary cycle:", err);
      alert(
        err instanceof Error ? err.message : "Failed to submit salary cycle"
      );
    }
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
            data.length > 0 &&
            data.every((r) => selectedRows.includes(r.id))
          }
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
      renderCell: (row: EmployeeResponse, rowIndex: number) => (
        <input
          id={`row-${rowIndex}`}
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => handleRowSelect(row.id)}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      key: "name",
      label: t("name"),
      renderCell: (row: EmployeeResponse) => row.name,
    },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "salary", label: t("salary") },
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
              disabled={selectedRows.length === 0 || loading}
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
  if (loading) {
    return (
      <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading employees...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={data}
        columns={columns}
        showActions={false}
        showSearchBar={false}
        showAddButton={false}
        noPagination /* ← SCROLLABLE, footer hidden */
        currentPage={1} /* dummy values satisfy TS */
        totalPages={1}
        onPageChange={() => {}}
        childrens={headerControls}
        canEdit={false}
        loading={loading}
      />
    </div>
  );
}
