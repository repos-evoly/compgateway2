/* --------------------------------------------------------------------------
   app/[locale]/salaries/setSalaries/page.tsx
   – Select employees for a new salary cycle:
       • Editable salary column.
       • Checkbox column with select-all header.
       • “Submit” opens SalariesModal → choose debitAccount **and salaryMonth**.
       • On confirm, calls submitSalaryCycle() with live salaries.
   – Always sends currency "LYD".
   – Strict TypeScript, copy-paste ready.
   -------------------------------------------------------------------------- */
"use client";

import React, { useMemo, useState, useEffect, JSX } from "react";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";

import type { DataGridColumn } from "@/types";
import { getEmployees } from "../../employees/services";
import type { EmployeeResponse } from "../../employees/types";

import SalariesModal from "../components/SalariesModal"; // ⬅️ Modal now returns { debitAccount, salaryMonthISO }
import { submitSalaryCycle, type NewCycleEntry } from "../services";
import LoadingPage from "@/app/components/reusable/Loading";

/* ------------------------------------------------------------------ */
export default function SetSalariesPage(): JSX.Element {
  const locale = useLocale();
  const t = useTranslations("salaries");

  /* ---------- state ---------- */
  const [data, setData] = useState<EmployeeResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* ---------- fetch employees ---------- */
  useEffect(() => {
    const fetchEmployees = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await getEmployees(1, 100);
        const employees = res.data;
        setData(employees);
        setSelectedRows(employees.filter((e) => e.sendSalary).map((e) => e.id));
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch employees"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  /* ---------- handlers ---------- */
  const handleRowSelect = (id: number): void => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (): void => {
    const all = data.every((r) => selectedRows.includes(r.id));
    setSelectedRows(all ? [] : data.map((r) => r.id));
  };

  const handleSalaryChange = (id: number, newSalary: number): void => {
    setData((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, salary: newSalary } : emp))
    );
  };

  const handleSubmitSelected = (): void => setShowModal(true);

  /* ---------- totals ---------- */
  const totalSelectedSalary = useMemo(
    () =>
      data
        .filter((e) => selectedRows.includes(e.id))
        .reduce((sum, e) => sum + e.salary, 0),
    [data, selectedRows]
  );

  /* ---------- columns ---------- */
  const columns: DataGridColumn[] = [
    {
      key: "select",
      label: "",
      renderHeader: () => (
        <input
          type="checkbox"
          checked={
            data.length > 0 && data.every((r) => selectedRows.includes(r.id))
          }
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
      renderCell: (row: EmployeeResponse) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => handleRowSelect(row.id)}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    { key: "name", label: t("name"), renderCell: (r) => r.name },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    {
      key: "salary",
      label: t("salary"),
      renderCell: (r) => (
        <input
          type="number"
          value={r.salary}
          min={0}
          onChange={(e) =>
            handleSalaryChange(r.id, Number(e.target.value) || 0)
          }
          className="w-24 rounded border border-gray-300 px-1 py-0.5 text-sm text-slate-700"
        />
      ),
    },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType", { defaultValue: "Type" }) },
  ];

  /* ---------- header controls ---------- */
  const headerControls = (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <BackButton isEditing fallbackPath={`/${locale}/salaries`} />
        <Formik initialValues={{}} onSubmit={handleSubmitSelected}>
          {() => (
            <SubmitButton
              title={t("submit")}
              color="info-dark"
              fullWidth={false}
              disabled={loading}
            />
          )}
        </Formik>
      </div>
      <div className="flex items-baseline gap-2 font-semibold text-white">
        <span>{t("totalAmount")}:</span>
        <span>{totalSelectedSalary.toLocaleString()}</span>
      </div>
    </div>
  );

  /* ---------- early states ---------- */
  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  /* ---------- main render ---------- */
  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <CrudDataGrid
        data={data}
        columns={columns}
        showActions={false}
        showSearchBar={false}
        showAddButton={false}
        noPagination
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        childrens={headerControls}
        canEdit={false}
        loading={false}
      />

      {/* ---------- modal ---------- */}
      <SalariesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        /* SalariesModal must now call onConfirm(debitAccount, salaryMonthISO) */
        onConfirm={async (
          debitAccount: string,
          salaryMonthISO: string
        ): Promise<void> => {
          const entries: NewCycleEntry[] = data
            .filter((e) => selectedRows.includes(e.id))
            .map(({ id, salary }) => ({
              employeeId: id,
              salary,
            }));

          try {
            const res = await submitSalaryCycle(
              debitAccount,
              salaryMonthISO,
              entries
            );
            console.log(res);
          } catch (err: unknown) {
            alert(
              err instanceof Error
                ? err.message
                : "Failed to create salary cycle"
            );
          } finally {
            setShowModal(false);
          }
        }}
      />
    </div>
  );
}
