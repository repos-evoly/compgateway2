
"use client";

import React, { useMemo, useState, useEffect, JSX } from "react";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";
import type { DataGridColumn } from "@/types";
import { getAllEmployees } from "../../employees/services";
import type { EmployeeResponse } from "../../employees/types";
import SalariesModal from "../components/SalariesModal"; // returns { debitAccount, salaryMonthArabic, additionalMonth }
import { submitSalaryCycle, type NewCycleEntry } from "../services";
import LoadingPage from "@/app/components/reusable/Loading";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import Disclaimer from "@/app/components/reusable/Disclaimer";
import { ApiError } from "@/app/helpers/apiResponse";
import {
  allocationTotal,
  buildAllocationInputs,
  channelHasDestination,
  hasBankDestination,
  roundAmount,
  toAmount,
  validateAllocations,
  type SalaryPaymentChannel,
} from "../../employees/salaryAllocationHelpers";

/* A safe, minimal shape of the API response without using `any` */
type PostResult = {
  success?: boolean;
  message?: string;
};

type SalarySearchBy = "name" | "accountNumber";

const localizedApiErrorMessage = (error: unknown, locale: string): string | null => {
  if (error instanceof ApiError) {
    return locale === "ar"
      ? error.messageAr || error.messageEn || error.message
      : error.messageEn || error.message;
  }
  return error instanceof Error ? error.message : null;
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
  const [searchBy, setSearchBy] = useState<SalarySearchBy>("name");
  const [searchTerm, setSearchTerm] = useState("");
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
        const employees = await getAllEmployees();
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

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data;

    return data.filter((employee) => {
      const value =
        searchBy === "name" ? employee.name : employee.accountNumber;
      return String(value ?? "").toLowerCase().includes(term);
    });
  }, [data, searchBy, searchTerm]);

  /* ---------- handlers ---------- */
  const handleRowSelect = (id: number): void => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (): void => {
    const visibleIds = filteredData.map((r) => r.id);
    if (visibleIds.length === 0) return;

    const allVisibleSelected = visibleIds.every((id) =>
      selectedRows.includes(id)
    );

    setSelectedRows((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const handleSplitChange = (
    id: number,
    field:
      | "accountAllocationAmount"
      | "bcdAllocationAmount"
      | "evoAllocationAmount",
    value: number
  ): void => {
    setData((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, [field]: roundAmount(value) } : emp
      )
    );
  };

  const allocationErrorMessage = (
    row: EmployeeResponse,
    reason?: ReturnType<typeof validateAllocations>["reason"]
  ): string => {
    const name = row.name || t("employee", { defaultValue: "Employee" });
    switch (reason) {
      case "missing_destination":
        return `${name}: ${t("salaryDestinationRequired", {
          defaultValue:
            "enter at least one salary destination: bank account, Evo wallet, or BCD wallet.",
        })}`;
      case "missing_allocation":
        return `${name}: ${t("salaryAllocationRequired", {
          defaultValue: "enter at least one salary allocation amount.",
        })}`;
      case "disabled_channel_amount":
        return `${name}: ${t("salaryAllocationDestinationMissing", {
          defaultValue:
            "allocation amount cannot be entered for a missing destination.",
        })}`;
      default:
        return `${name}: ${t("salaryAllocationTotalMismatch", {
          defaultValue: "allocation total must equal the employee salary.",
        })}`;
    }
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

    const invalidRow = data
      .filter((row) => selectedRows.includes(row.id))
      .map((row) => ({ row, validation: validateAllocations(row) }))
      .find(({ validation }) => !validation.valid);

    if (invalidRow) {
      setResultSuccess(false);
      setResultTitle(
        t("invalidAllocationsTitle", {
          defaultValue: "Invalid salary allocations",
        })
      );
      setResultMessage(
        allocationErrorMessage(invalidRow.row, invalidRow.validation.reason)
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

  const splitInput = (
    row: EmployeeResponse,
    field:
      | "accountAllocationAmount"
      | "bcdAllocationAmount"
      | "evoAllocationAmount",
    channel: SalaryPaymentChannel
  ) => {
    const selected = selectedRows.includes(row.id);
    const enabled = channelHasDestination(row, channel);
    const invalid = selected && !validateAllocations(row).valid;
    return (
      <input
        type="number"
        value={toAmount(row[field])}
        min={0}
        disabled={!enabled}
        title={
          enabled
            ? undefined
            : t("splitDestinationMissing", {
                defaultValue: "This employee does not have this destination.",
              })
        }
        onChange={(event) =>
          handleSplitChange(row.id, field, Number(event.target.value) || 0)
        }
        className={`w-24 rounded border px-2 py-1 text-sm text-slate-700 ${
          !enabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : invalid
            ? "border-red-500 bg-red-50"
            : "border-gray-300"
        }`}
      />
    );
  };

  /* ---------- columns ---------- */
  const columns: DataGridColumn[] = [
    {
      key: "select",
      label: "",
      renderHeader: () => (
        <input
          type="checkbox"
          checked={
            filteredData.length > 0 &&
            filteredData.every((r) => selectedRows.includes(r.id))
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
      renderCell: (r: EmployeeResponse) => (
        <span className="font-medium text-slate-800">
          {toAmount(r.salary).toLocaleString()}
        </span>
      ),
    },
    {
      key: "accountAllocationAmount",
      label: t("bankSplit", { defaultValue: "Bank Split" }),
      renderCell: (r: EmployeeResponse) =>
        splitInput(r, "accountAllocationAmount", "account"),
    },
    {
      key: "bcdAllocationAmount",
      label: t("bcdSplit", { defaultValue: "BCD Split" }),
      renderCell: (r: EmployeeResponse) =>
        splitInput(r, "bcdAllocationAmount", "bcd"),
    },
    {
      key: "evoAllocationAmount",
      label: t("evoSplit", { defaultValue: "Evo Split" }),
      renderCell: (r: EmployeeResponse) =>
        splitInput(r, "evoAllocationAmount", "evo"),
    },
    {
      key: "allocationTotal",
      label: t("allocationTotal", { defaultValue: "Split Total" }),
      renderCell: (r: EmployeeResponse) => {
        const total = allocationTotal(r);
        const salary = roundAmount(toAmount(r.salary));
        const selected = selectedRows.includes(r.id);
        const invalid = selected && total !== salary;
        return (
          <span className={invalid ? "font-semibold text-red-600" : ""}>
            {total.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "accountNumber",
      label: t("accountNumber"),
      renderCell: (r: EmployeeResponse) =>
        hasBankDestination(r) ? r.accountNumber : "",
    },
  ];

  /* ---------- header controls ---------- */
  const headerControls = (
    <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="salary-search-by">
            {t("searchBy", { defaultValue: "Search by" })}
          </label>
          <select
            id="salary-search-by"
            value={searchBy}
            onChange={(event) =>
              setSearchBy(event.target.value as SalarySearchBy)
            }
            className="h-10 rounded border border-white/30 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-warning-light focus:outline-none focus:ring-2 focus:ring-warning-light/40"
          >
            <option value="name">
              {t("searchByName", { defaultValue: "Name" })}
            </option>
            <option value="accountNumber">
              {t("searchByAccountNumber", {
                defaultValue: "Account Number",
              })}
            </option>
          </select>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("searchEmployeesPlaceholder", {
              defaultValue: "Search employees",
            })}
            className="h-10 w-full rounded border border-white/30 bg-white px-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-warning-light focus:outline-none focus:ring-2 focus:ring-warning-light/40 sm:w-72"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-white">
        <div className="flex items-baseline gap-2 text-sm font-medium">
          <span>{t("filteredEmployees", { defaultValue: "Shown" })}:</span>
          <span>
            {filteredData.length.toLocaleString()} / {data.length.toLocaleString()}
          </span>
        </div>
        <div className="flex items-baseline gap-2 font-semibold">
          <span>{t("totalAmount")}:</span>
          <span>{totalSelectedSalary.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  /* ---------- early states ---------- */
  if (loading) return <LoadingPage />;

  /* ---------- main render ---------- */
  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <Disclaimer message={t("hint")} className="mb-4" />

      <CrudDataGrid
        data={filteredData}
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
            .map((employee) => ({
              employeeId: employee.id,
              salary: roundAmount(toAmount(employee.salary)),
              allocations: buildAllocationInputs(employee),
            }));

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
              localizedApiErrorMessage(err, locale) ??
                t("genericError", {
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
