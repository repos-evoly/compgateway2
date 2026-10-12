"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import BackButton from "@/app/components/reusable/BackButton";
import Disclaimer from "@/app/components/reusable/Disclaimer";
import LoadingPage from "@/app/components/reusable/Loading";
import type { DataGridColumn } from "@/types";

import { getAllEmployees } from "../../employees/services";
import {
  allocationTotal,
  buildAllocationRequest,
  employeeHasDestination,
  roundSalaryAmount,
  validateEmployeeAllocations,
  type AllocationAmounts,
  type SalaryPaymentChannel,
} from "../../employees/salaryWalletHelpers";
import type { EmployeeResponse } from "../../employees/types";
import SalariesModal from "../components/SalariesModal";
import {
  getSalaryWalletCapabilities,
  submitSalaryCycle,
  type NewCycleEntry,
} from "../services";
import type { SalaryWalletCapabilities } from "../types";

type SalarySearchBy = "name" | "destination";

const EMPTY_AMOUNTS: AllocationAmounts = {
  bankAccount: 0,
  evoWallet: 0,
  bcdWallet: 0,
};

const initialAmountsForEmployee = (
  employee: EmployeeResponse,
  capabilities: SalaryWalletCapabilities
): AllocationAmounts => {
  const salary = roundSalaryAmount(employee.salary);
  const savedDefaults: AllocationAmounts = {
    bankAccount: roundSalaryAmount(employee.bankAllocationAmount),
    evoWallet: roundSalaryAmount(employee.evoAllocationAmount),
    bcdWallet: roundSalaryAmount(employee.bcdAllocationAmount),
  };
  const savedChannels = [
    "bankAccount",
    "evoWallet",
    "bcdWallet",
  ] as const;
  const hasSavedDefaults =
    salary > 0 &&
    allocationTotal(savedDefaults) === salary &&
    savedChannels.every(
      (channel) =>
        savedDefaults[channel] <= 0 || employeeHasDestination(employee, channel)
    );

  if (hasSavedDefaults) {
    return savedDefaults;
  }

  // Backward compatibility for employees created before default allocations
  // were stored: keep the existing first-available-destination behavior.
  if (employeeHasDestination(employee, "bankAccount")) {
    return { ...EMPTY_AMOUNTS, bankAccount: salary };
  }
  if (
    capabilities.evoEnabled &&
    employeeHasDestination(employee, "evoWallet")
  ) {
    return { ...EMPTY_AMOUNTS, evoWallet: salary };
  }
  if (
    capabilities.bcdEnabled &&
    employeeHasDestination(employee, "bcdWallet")
  ) {
    return { ...EMPTY_AMOUNTS, bcdWallet: salary };
  }
  return { ...EMPTY_AMOUNTS };
};

export default function SetSalariesPage(): JSX.Element {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const router = useRouter();
  const [data, setData] = useState<EmployeeResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allocations, setAllocations] = useState<
    Record<number, AllocationAmounts>
  >({});
  const [capabilities, setCapabilities] =
    useState<SalaryWalletCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchBy, setSearchBy] = useState<SalarySearchBy>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, title: string, message: string) => {
    setResultSuccess(success);
    setResultTitle(title);
    setResultMessage(message);
    setResultOpen(true);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [employees, walletCapabilities] = await Promise.all([
          getAllEmployees(),
          getSalaryWalletCapabilities(),
        ]);
        if (!active) return;

        const nextAllocations = Object.fromEntries(
          employees.map((employee) => [
            employee.id,
            initialAmountsForEmployee(employee, walletCapabilities),
          ])
        );
        setData(employees);
        setCapabilities(walletCapabilities);
        setAllocations(nextAllocations);
        setSelectedRows(
          employees
            .filter((employee) => employee.sendSalary)
            .map((employee) => employee.id)
        );
      } catch (error) {
        if (!active) return;
        showResult(
          false,
          t("fetchEmployeesErrorTitle"),
          error instanceof Error ? error.message : t("fetchEmployeesError")
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [t]);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data;
    return data.filter((employee) => {
      if (searchBy === "name") {
        return employee.name.toLowerCase().includes(term);
      }
      return [employee.accountNumber, employee.evoWallet, employee.bcdWallet]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [data, searchBy, searchTerm]);

  const bcdEnabled = capabilities?.bcdEnabled === true;
  const evoEnabled = capabilities?.evoEnabled === true;

  const updateAllocation = (
    employeeId: number,
    channel: SalaryPaymentChannel,
    value: number
  ) => {
    setAllocations((current) => ({
      ...current,
      [employeeId]: {
        ...(current[employeeId] ?? EMPTY_AMOUNTS),
        [channel]: roundSalaryAmount(value),
      },
    }));
  };

  const updateSalary = (employeeId: number, salary: number) => {
    setData((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? { ...employee, salary: roundSalaryAmount(salary) }
          : employee
      )
    );
  };

  const toggleRow = (employeeId: number) => {
    setSelectedRows((current) =>
      current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId]
    );
  };

  const toggleVisibleRows = () => {
    const visibleIds = filteredData.map((employee) => employee.id);
    const allSelected = visibleIds.every((id) => selectedRows.includes(id));
    setSelectedRows((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  };

  const channelLabel = (channel: SalaryPaymentChannel) =>
    channel === "bankAccount"
      ? t("channelBank")
      : channel === "evoWallet"
        ? t("channelEvo")
        : t("channelBcd");

  const allocationError = (employee: EmployeeResponse): string | null => {
    const validation = validateEmployeeAllocations(
      employee,
      allocations[employee.id] ?? EMPTY_AMOUNTS,
      { evoEnabled, bcdEnabled }
    );
    if (validation.valid) return null;
    if (validation.reason === "salaryRequired") return t("salaryPositive");
    if (validation.reason === "allocationRequired") {
      return t("allocationRequired");
    }
    if (validation.reason === "bcdUnavailable") return t("bcdNotConfigured");
    if (validation.reason === "railUnavailable") return t("railNotConfigured");
    if (validation.reason === "destinationUnavailable") {
      return t("allocationDestinationMissing", {
        channel: channelLabel(validation.channel ?? "bankAccount"),
      });
    }
    return t("allocationTotalMismatch");
  };

  const openCreateModal = () => {
    if (selectedRows.length === 0) {
      showResult(false, t("noSelectionTitle"), t("noSelectionMsg"));
      return;
    }
    const invalidEmployee = data
      .filter((employee) => selectedRows.includes(employee.id))
      .find((employee) => allocationError(employee));
    if (invalidEmployee) {
      showResult(
        false,
        t("invalidAllocationsTitle"),
        `${invalidEmployee.name}: ${allocationError(invalidEmployee)}`
      );
      return;
    }
    setShowPickerModal(true);
  };

  const allocationInput = (
    employee: EmployeeResponse,
    channel: SalaryPaymentChannel
  ) => {
    const railEnabled =
      channel === "bankAccount" ||
      (channel === "evoWallet" ? evoEnabled : bcdEnabled);
    const destinationExists = employeeHasDestination(employee, channel);
    const disabled = !railEnabled || !destinationExists;
    const selected = selectedRows.includes(employee.id);
    const invalid = selected && Boolean(allocationError(employee));
    return (
      <div className="space-y-1">
        <input
          type="number"
          min={0}
          step="0.001"
          value={(allocations[employee.id] ?? EMPTY_AMOUNTS)[channel]}
          disabled={disabled}
          onChange={(event) =>
            updateAllocation(employee.id, channel, Number(event.target.value))
          }
          title={
            !railEnabled
              ? t("railNotConfigured")
              : !destinationExists
                ? t("employeeDestinationMissing")
                : undefined
          }
          className={`w-28 rounded border px-2 py-1 text-sm outline-none ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              : invalid
                ? "border-red-400 bg-red-50 text-slate-800"
                : "border-slate-300 bg-white text-slate-800 focus:border-blue-500"
          }`}
        />
        <div className="max-w-36 truncate text-xs text-slate-500" dir="ltr">
          {destinationExists
            ? channel === "bankAccount"
              ? employee.accountNumber
              : channel === "evoWallet"
                ? employee.evoWallet
                : employee.bcdWallet
            : t("notAvailable")}
        </div>
      </div>
    );
  };

  const columns: DataGridColumn[] = [
    {
      key: "select",
      label: "",
      renderHeader: () => (
        <input
          type="checkbox"
          checked={
            filteredData.length > 0 &&
            filteredData.every((employee) =>
              selectedRows.includes(employee.id)
            )
          }
          onChange={toggleVisibleRows}
          aria-label={t("selectAll")}
        />
      ),
      renderCell: (employee: EmployeeResponse) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(employee.id)}
          onChange={() => toggleRow(employee.id)}
          aria-label={`${t("selectEmployee")} ${employee.name}`}
        />
      ),
    },
    { key: "name", label: t("name") },
    {
      key: "salary",
      label: t("salary"),
      renderCell: (employee: EmployeeResponse) => (
        <input
          type="number"
          min={0}
          step="0.001"
          value={employee.salary}
          onChange={(event) =>
            updateSalary(employee.id, Number(event.target.value))
          }
          className="w-28 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none focus:border-blue-500"
        />
      ),
    },
    {
      key: "bankAllocation",
      label: t("channelBank"),
      renderCell: (employee: EmployeeResponse) =>
        allocationInput(employee, "bankAccount"),
    },
    {
      key: "evoAllocation",
      label: t("channelEvo"),
      renderCell: (employee: EmployeeResponse) =>
        allocationInput(employee, "evoWallet"),
    },
    {
      key: "bcdAllocation",
      label: t("channelBcd"),
      renderHeader: () => (
        <div className="flex items-center gap-2">
          <span>{t("channelBcd")}</span>
          {!bcdEnabled && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
              {t("notConfigured")}
            </span>
          )}
        </div>
      ),
      renderCell: (employee: EmployeeResponse) =>
        allocationInput(employee, "bcdWallet"),
    },
    {
      key: "allocationTotal",
      label: t("allocationTotal"),
      renderCell: (employee: EmployeeResponse) => {
        const total = allocationTotal(
          allocations[employee.id] ?? EMPTY_AMOUNTS
        );
        const valid = !selectedRows.includes(employee.id) || !allocationError(employee);
        return (
          <div>
            <span className={valid ? "font-medium" : "font-semibold text-red-600"}>
              {total.toLocaleString()} / {roundSalaryAmount(employee.salary).toLocaleString()}
            </span>
            {!valid && (
              <p className="mt-1 max-w-48 text-xs text-red-600">
                {allocationError(employee)}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  const totalSelectedSalary = data
    .filter((employee) => selectedRows.includes(employee.id))
    .reduce((sum, employee) => sum + roundSalaryAmount(employee.salary), 0);

  if (loading) return <LoadingPage />;

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <Disclaimer message={t("hint")} className="mb-4" />
      {!bcdEnabled && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>{t("channelBcd")}:</strong> {t("bcdNotConfigured")}
        </div>
      )}
      <CrudDataGrid
        data={filteredData}
        columns={columns}
        showActions={false}
        showSearchBar={false}
        showAddButton={false}
        noPagination
        currentPage={1}
        totalPages={1}
        onPageChange={() => undefined}
        canEdit={false}
        loading={false}
        childrens={
          <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <BackButton isEditing fallbackPath={`/${locale}/salaries`} />
              <Formik initialValues={{}} onSubmit={openCreateModal}>
                <SubmitButton
                  title={t("createSalaryCycle")}
                  color="info-dark"
                  fullWidth={false}
                  disabled={capabilities?.canCreateOrEdit === false}
                />
              </Formik>
              <select
                value={searchBy}
                onChange={(event) =>
                  setSearchBy(event.target.value as SalarySearchBy)
                }
                className="h-10 rounded border border-white/30 bg-white/10 px-3 text-sm text-white outline-none"
                aria-label={t("searchBy")}
              >
                <option className="text-slate-900" value="name">{t("searchByName")}</option>
                <option className="text-slate-900" value="destination">{t("searchByDestination")}</option>
              </select>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("searchEmployeesPlaceholder")}
                className="h-10 w-64 rounded border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/70"
              />
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-white">
              <span>{t("selectedEmployees")}: {selectedRows.length.toLocaleString()}</span>
              <span>{t("totalAmount")}: {roundSalaryAmount(totalSelectedSalary).toLocaleString()} LYD</span>
            </div>
          </div>
        }
      />

      <SalariesModal
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        onConfirm={async (debitAccount, salaryMonth, additionalMonth) => {
          const entries: NewCycleEntry[] = data
            .filter((employee) => selectedRows.includes(employee.id))
            .map((employee) => ({
              employeeId: employee.id,
              salary: roundSalaryAmount(employee.salary),
              allocations: buildAllocationRequest(
                allocations[employee.id] ?? EMPTY_AMOUNTS
              ),
            }));
          try {
            const response = await submitSalaryCycle(
              debitAccount,
              salaryMonth,
              entries,
              additionalMonth
            );
            setShowPickerModal(false);
            showResult(
              response.success !== false,
              response.success === false ? t("failedTitle") : t("createdTitle"),
              response.message ??
                (response.success === false ? t("failedMsg") : t("createdMsg"))
            );
          } catch (error) {
            setShowPickerModal(false);
            showResult(
              false,
              t("failedTitle"),
              error instanceof Error ? error.message : t("genericError")
            );
          }
        }}
      />

      <ErrorOrSuccessModal
        isOpen={resultOpen}
        isSuccess={resultSuccess}
        title={resultTitle}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
        onConfirm={() => {
          setResultOpen(false);
          if (resultSuccess) router.push(`/${locale}/salaries`);
        }}
        okLabel={t("ok")}
        confirmLabel={t("confirm")}
        closeAriaLabel={t("close")}
      />
    </div>
  );
}
