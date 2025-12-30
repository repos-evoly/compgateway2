
"use client";

import React, { useMemo, useState, useEffect, JSX } from "react";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";
import type { DataGridColumn } from "@/types";
import { getEmployees } from "../../employees/services";
import type { EmployeeResponse } from "../../employees/types";
import SalariesModal from "../components/SalariesModal"; // returns { debitAccount, salaryMonthArabic, additionalMonth }
import { submitSalaryCycle, type NewCycleEntry } from "../services";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import Hint from "@/app/components/reusable/Hint";

/* A safe, minimal shape of the API response without using `any` */
type PostResult = {
  success?: boolean;
  message?: string;
};

/* ------------------------------------------------------------------ */
export default function SetSalariesPage(): JSX.Element {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const router = useRouter();

  /* ---------- table state ---------- */
  const [data, setData] = useState<EmployeeResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("SetSalariesPage render, error:", error);

  /* ---------- flow modals ---------- */
  const [showPickerModal, setShowPickerModal] = useState(false); // SalariesModal
  const [resultOpen, setResultOpen] = useState(false); // ErrorOrSuccessModal
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  /* ---------- fetch employees ---------- */
  useEffect(() => {
    const fetchEmployees = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await getEmployees(1, 100);
        const employees = res.data;
        setData(employees);
        // Preselect those flagged to receive salaries
        setSelectedRows(employees.filter((e) => e.sendSalary).map((e) => e.id));
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("fetchEmployeesError", {
              defaultValue: "Failed to fetch employees",
            });
        setError(message);
        setResultSuccess(false);
        setResultTitle(
          t("fetchEmployeesErrorTitle", {
            defaultValue: "تعذر تحميل الموظفين",
          })
        );
        setResultMessage(message);
        setResultOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [t]);

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

  const handleSubmitSelected = (): void => {
    if (selectedRows.length === 0) {
      // If nothing selected, show error modal immediately
      setResultSuccess(false);
      setResultTitle(
        t("noSelectionTitle", { defaultValue: "No Employees Selected" })
      );
      setResultMessage(
        t("noSelectionMsg", {
          defaultValue:
            "Please select at least one employee to create a salary cycle.",
        })
      );
      setResultOpen(true);
      return;
    }
    setShowPickerModal(true);
  };

  /* ---------- totals ---------- */
  const totalSelectedSalary = useMemo(
    () =>
      data
        .filter((e) => selectedRows.includes(e.id))
        .reduce((sum, e) => sum + (Number(e.salary) || 0), 0),
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
    <div className="flex w-full justify-between items-center gap-6">
      <div className="flex w-full items-center justify-between gap-4">
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
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2 font-semibold text-white">
            <span>{t("totalAmount")}:</span>
            <span>{totalSelectedSalary.toLocaleString()}</span>
          </div>
          <Hint hint={t("hint")} />
        </div>
      </div>
    </div>
  );

  /* ---------- early states ---------- */
  if (loading) return <LoadingPage />;

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
        onPageChange={() => { }}
        childrens={headerControls}
        canEdit={false}
        loading={false}
      />

      {/* ---------- salary picker modal (debit account + month) ---------- */}
      <SalariesModal
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        onConfirm={async (
          debitAccount: string,
          salaryMonthArabic: string,
          additionalMonth: string | null
        ): Promise<void> => {
          const entries: NewCycleEntry[] = data
            .filter((e) => selectedRows.includes(e.id))
            .map(({ id, salary }) => ({ employeeId: id, salary }));

          try {
            const res: PostResult = await submitSalaryCycle(
              debitAccount,
              salaryMonthArabic,
              entries,
              additionalMonth
            );

            // Treat undefined `success` as success; only explicit false is failure.
            const ok: boolean = res.success !== false;

            setShowPickerModal(false);
            setResultSuccess(ok);
            setResultTitle(
              ok
                ? t("createdTitle", { defaultValue: "Salary Cycle Created" })
                : t("failedTitle", { defaultValue: "Creation Failed" })
            );

            // Prefer API message if present; fallback to friendly default
            const apiMsg: string =
              res.message ??
              (ok
                ? t("createdMsg", {
                  defaultValue: "The salary cycle was created successfully.",
                })
                : t("failedMsg", {
                  defaultValue: "Could not create the salary cycle.",
                }));

            setResultMessage(apiMsg);
            setResultOpen(true);
          } catch (err: unknown) {
            // Only thrown errors from the submit request land here
            setShowPickerModal(false);
            setResultSuccess(false);
            setResultTitle(
              t("failedTitle", { defaultValue: "Creation Failed" })
            );
            setResultMessage(
              err instanceof Error
                ? err.message
                : t("genericError", {
                  defaultValue: "Failed to create salary cycle.",
                })
            );
            setResultOpen(true);
          }
        }}
      />

      {/* ---------- result modal (success/error) ---------- */}
      <ErrorOrSuccessModal
        isOpen={resultOpen}
        isSuccess={resultSuccess}
        title={resultTitle}
        message={resultMessage}
        onClose={() => {
          setResultOpen(false);
          if (!resultSuccess) {
            setError(null);
          }
        }}
        onConfirm={() => {
          // Only shown for success; navigate back to list
          setResultOpen(false);
          if (resultSuccess) {
            router.push(`/${locale}/salaries`);
          } else {
            setError(null);
          }
        }}
        okLabel={t("ok", { defaultValue: "حسناً" })}
        confirmLabel={t("confirm", { defaultValue: "تأكيد" })}
        closeAriaLabel={t("close", { defaultValue: "إغلاق" })}
      />
    </div>
  );
}
