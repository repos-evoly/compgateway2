
"use client";

import React, { JSX, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Formik, Form } from "formik";
import Cookies from "js-cookie";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SubmitButton from "@/app/components/FormUI/SubmitButton";
import type { DataGridColumn } from "@/types";
import {
  getSalaryCycleById,
  editSalaryCycle,
  postSalaryCycleById,
} from "../services";
import {
  ConfirmModalState,
  // CurrencyLookup,
  EmployeeRow,
  SalaryEntryAllocation,
  SalaryEntryRow,
  TSalaryTransaction,
} from "../types";
import { getAllEmployees } from "../../employees/services";
import type { EmployeeResponse } from "../../employees/types";
import { CheckAccount, type AccountInfo } from "@/app/helpers/checkAccount";
import { type InputSelectComboOption } from "@/app/components/FormUI/InputSelectCombo";
import SalaryCycleSummaryCard from "../components/SalaryCycleSummaryCard";
import { getCompannyInfoByCode } from "@/app/[locale]/profile/services";
import SalaryConfirmInfoModal from "../components/SalaryConfirmInfoModal";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";
import NotTransferredHeader from "../components/NotTransferredHeader";
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

const getCompanyCode = (): string | undefined => {
  const raw = Cookies.get("companyCode");
  if (!raw) return undefined;
  return decodeURIComponent(raw).replace(/^"|"$/g, "");
};

const getPermissionsFromCookies = (): string[] => {
  const raw =
    Cookies.get("permissions") ??
    Cookies.get("userPermissions") ??
    Cookies.get("authPermissions") ??
    "";
  if (!raw) return [];
  try {
    const decoded = decodeURIComponent(raw).replace(/^"|"$/g, "");
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

const allocationAmountFromEntry = (
  allocations: SalaryEntryAllocation[] | undefined,
  channel: SalaryPaymentChannel
): number =>
  roundAmount(
    allocations?.find((allocation) => allocation.paymentChannel === channel)
      ?.amount ?? 0
  );

const localizedApiErrorMessage = (error: unknown, locale: string): string | null => {
  if (error instanceof ApiError) {
    return locale === "ar"
      ? error.messageAr || error.messageEn || error.message
      : error.messageEn || error.message;
  }
  return error instanceof Error ? error.message : null;
};

type SalaryAllocationResultRow = {
  id: string;
  employeeGroupIndex: number;
  salaryEntryId: number;
  employeeId: number;
  employeeName: string;
  employeeSalary: number;
  channel: SalaryPaymentChannel | null;
  destination: string;
  amount: number;
  status: string;
  isTransferred: boolean;
  transferResultCode: string;
  transferResultReason: string;
  commissionAmount: number;
  providerTransactionId: string;
  clientReference: string;
  transferredAt: string | null;
};

type AllocationSearchBy = "employeeName" | "destination";
type AllocationChannelFilter = "all" | SalaryPaymentChannel;
type AllocationTransferredFilter = "all" | "yes" | "no";

/* ------------------------------------------------------------------ */
export default function SalaryCycleDetailsPage(): JSX.Element {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const { cycleId } = useParams<{ cycleId: string }>();
  const channelLabel = useCallback(
    (channel: SalaryPaymentChannel): string => {
      switch (channel) {
        case "account":
          return t("paymentChannelAccount");
        case "bcd":
          return t("paymentChannelBcd");
        case "evo":
          return t("paymentChannelEvo");
      }
    },
    [t]
  );
  const [cycle, setCycle] = useState<TSalaryTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState<string | null>(null);
  const [accountOptions, setAccountOptions] = useState<
    InputSelectComboOption[]
  >([]);
  const [accLoading, setAccLoading] = useState(false);
  const [accError, setAccError] = useState<string | null>(null);
  const [salaryMonthInput, setSalaryMonthInput] = useState<string>("");

  /* --- company config: who pays commission --- */
  const [commissionOnReceiver, setCommissionOnReceiver] =
    useState<boolean>(false);
  useEffect(() => {
    (async () => {
      try {
        const code = getCompanyCode();
        if (!code) return;
        const info = await getCompannyInfoByCode(code);
        if (typeof info?.commissionOnReceiver === "boolean") {
          setCommissionOnReceiver(info.commissionOnReceiver);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  /* --- permissions --- */
  const hasPostPermission = useMemo(() => {
    const perms = getPermissionsFromCookies();
    return perms.includes("canPostSalaryCycle");
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmModalState | null>(
    null
  );
  const [recipients, setRecipients] = useState<
    Array<{ accountNumber: string; name?: string; salary?: number }>
  >([]);
  const [canPost, setCanPost] = useState<boolean>(true);
  const [posting, setPosting] = useState<boolean>(false);
  const postingRef = useRef(false);
  const [resultOpen, setResultOpen] = useState<boolean>(false);
  const [resultSuccess, setResultSuccess] = useState<boolean>(false);
  const [resultTitle, setResultTitle] = useState<string>("");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [allocationSearchBy, setAllocationSearchBy] =
    useState<AllocationSearchBy>("employeeName");
  const [allocationSearchTerm, setAllocationSearchTerm] = useState<string>("");
  const [allocationChannelFilter, setAllocationChannelFilter] =
    useState<AllocationChannelFilter>("all");
  const [allocationStatusFilter, setAllocationStatusFilter] =
    useState<string>("all");
  const [allocationTransferredFilter, setAllocationTransferredFilter] =
    useState<AllocationTransferredFilter>("all");

  /* ───────────────── fetch salary cycle ───────────────── */
  const refetchCycle = useCallback(async (id: number) => {
    const fresh = await getSalaryCycleById(id);
    setCycle(fresh);
  }, []);

  

  useEffect(() => {
    const fetchCycle = async (): Promise<void> => {
      try {
        setLoading(true);
        const id = Number(cycleId);
        if (Number.isNaN(id)) throw new Error("Invalid salary-cycle ID.");
        await refetchCycle(id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch cycle.");
      } finally {
        setLoading(false);
      }
    };
    fetchCycle();
  }, [cycleId, refetchCycle]);

  /* ───────────────── fetch employees ───────────────── */
  const loadEmployees = useCallback(async () => {
    try {
      setEmpLoading(true);
      setEmpError(null);

      const baseEmployees = await getAllEmployees();

      let merged: EmployeeResponse[] = baseEmployees;
      if (cycle) {
        const entryMap = new Map<number, SalaryEntryRow>(
          (cycle.entries as unknown as SalaryEntryRow[]).map((entry) => [
            entry.employeeId,
            entry,
          ])
        );
        merged = baseEmployees.map((emp) =>
          entryMap.has(emp.id)
            ? {
                ...emp,
                salary: entryMap.get(emp.id)!.salary,
                accountAllocationAmount: allocationAmountFromEntry(
                  entryMap.get(emp.id)!.allocations,
                  "account"
                ),
                bcdAllocationAmount: allocationAmountFromEntry(
                  entryMap.get(emp.id)!.allocations,
                  "bcd"
                ),
                evoAllocationAmount: allocationAmountFromEntry(
                  entryMap.get(emp.id)!.allocations,
                  "evo"
                ),
              }
            : emp
        );
      }

      setEmployees(merged);
    } catch (err: unknown) {
      setEmpError(
        err instanceof Error ? err.message : "Failed to fetch employees."
      );
    } finally {
      setEmpLoading(false);
    }
  }, [cycle]);

  /* ───────────────── fetch debit accounts ───────────────── */
  const loadAccounts = useCallback(async () => {
    try {
      setAccLoading(true);
      setAccError(null);
      const companyCode = getCompanyCode();
      if (!companyCode) throw new Error("Company code not found.");
      const accounts = await CheckAccount(companyCode);
      setAccountOptions(
        accounts
          .filter((a: AccountInfo) => a.accountString.endsWith("001"))
          .map<InputSelectComboOption>((a) => ({
            label: a.accountString,
            value: a.accountString,
          }))
      );
    } catch (err: unknown) {
      setAccError(
        err instanceof Error ? err.message : "Failed to fetch accounts."
      );
    } finally {
      setAccLoading(false);
    }
  }, []);

  /* ───────── initialise edit state once we enter edit ───────── */
  useEffect(() => {
    if (!isEditing || !cycle) return;

    // salaryMonth is now a string (e.g., Arabic month). Only convert if it's a valid date.
    const raw = (cycle.salaryMonth as unknown) as string | null | undefined;
    let iso = "";
    if (typeof raw === "string" && raw.trim().length > 0) {
      const ms = Date.parse(raw);
      if (!Number.isNaN(ms)) {
        iso = new Date(ms).toISOString().split("T")[0];
      }
    }
    setSalaryMonthInput(iso);

    if (employees.length === 0 && !empLoading) loadEmployees();
    if (accountOptions.length === 0 && !accLoading) loadAccounts();
  }, [
    isEditing,
    cycle,
    employees.length,
    empLoading,
    loadEmployees,
    accountOptions.length,
    accLoading,
    loadAccounts,
  ]);

  // Refresh data after a partial repost from NotTransferredHeader
  const handleRepostApplied = useCallback(async () => {
    if (!cycle) return;
    try {
      await refetchCycle(cycle.id);
      await loadEmployees();
    } catch {
      // ignore refresh errors
    }
  }, [cycle, refetchCycle, loadEmployees]);

  /* ───────── set selectedRows once employees & cycle ready ───────── */
  useEffect(() => {
    if (!isEditing || !cycle || employees.length === 0) return;
    const idsInCycle = new Set(
      (cycle.entries as unknown as SalaryEntryRow[]).map((e) => e.employeeId)
    );
    setSelectedRows(
      employees.filter((e) => idsInCycle.has(e.id)).map((e) => e.id)
    );
  }, [isEditing, cycle, employees]);

  /* ───────── selection & salary handlers ───────── */
  const toggleRow = (id: number): void => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleAll = (): void => {
    const all = employees.every((e) => selectedRows.includes(e.id));
    setSelectedRows(all ? [] : employees.map((e) => e.id));
  };
  const handleSplitChange = (
    id: number,
    field:
      | "accountAllocationAmount"
      | "bcdAllocationAmount"
      | "evoAllocationAmount",
    val: number
  ): void => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: roundAmount(val) } : e))
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

  /* ───────── totals & rows ───────── */
  const computedTotalView: number = useMemo(() => {
    if (!cycle) return 0;
    const entries = cycle.entries as unknown as { salary: number }[];
    return entries.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  }, [cycle]);

  const computedTotalEdit: number = useMemo(() => {
    return employees
      .filter((e) => selectedRows.includes(e.id))
      .reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  }, [employees, selectedRows]);

  const viewRows: SalaryEntryRow[] = useMemo(
    () => (cycle ? (cycle.entries as unknown as SalaryEntryRow[]) : []),
    [cycle]
  );

  const allocationRows: SalaryAllocationResultRow[] = useMemo(
    () =>
      viewRows.flatMap<SalaryAllocationResultRow>((entry, employeeGroupIndex) => {
        const employeeName = entry.name ?? entry.employeeName ?? "";
        const allocations = entry.allocations ?? [];

        if (allocations.length === 0) {
          return [
            {
              id: `${entry.id}-entry`,
              employeeGroupIndex,
              salaryEntryId: entry.id,
              employeeId: entry.employeeId,
              employeeName,
              employeeSalary: roundAmount(toAmount(entry.salary)),
              channel: null,
              destination: entry.accountNumber ?? "",
              amount: roundAmount(toAmount(entry.salary)),
              status:
                entry.transferResultCode ??
                (entry.isTransferred ? "success" : "pending"),
              isTransferred: entry.isTransferred,
              transferResultCode: entry.transferResultCode ?? "",
              transferResultReason: entry.transferResultReason ?? "",
              commissionAmount: 0,
              providerTransactionId: "",
              clientReference: "",
              transferredAt: null,
            },
          ];
        }

        return allocations.map((allocation, allocationIndex) => ({
          id: `${entry.id}-${allocation.id ?? allocationIndex}`,
          employeeGroupIndex,
          salaryEntryId: entry.id,
          employeeId: entry.employeeId,
          employeeName,
          employeeSalary: roundAmount(toAmount(entry.salary)),
          channel: allocation.paymentChannel,
          destination: allocation.destination,
          amount: roundAmount(toAmount(allocation.amount)),
          status: allocation.status,
          isTransferred: allocation.isTransferred,
          transferResultCode: allocation.transferResultCode ?? "",
          transferResultReason: allocation.transferResultReason ?? "",
          commissionAmount: roundAmount(toAmount(allocation.commissionAmount)),
          providerTransactionId: allocation.providerTransactionId ?? "",
          clientReference: allocation.clientReference,
          transferredAt: allocation.transferredAt ?? null,
        }));
      }),
    [viewRows]
  );

  const allocationStatusOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allocationRows
            .map((row) => row.status)
            .filter((status) => status.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [allocationRows]
  );

  const statusLabel = useCallback(
    (status: string): string => {
      switch (status.toLowerCase()) {
        case "success":
          return t("statusSuccess");
        case "failed":
          return t("statusFailed");
        case "pending":
          return t("statusPending");
        default:
          return status;
      }
    },
    [t]
  );

  const filteredAllocationRows = useMemo(() => {
    const search = allocationSearchTerm.trim().toLowerCase();

    return allocationRows.filter((row) => {
      const matchesSearch =
        search.length === 0 ||
        (allocationSearchBy === "employeeName"
          ? row.employeeName.toLowerCase().includes(search)
          : row.destination.toLowerCase().includes(search));

      const matchesChannel =
        allocationChannelFilter === "all" ||
        row.channel === allocationChannelFilter;

      const matchesStatus =
        allocationStatusFilter === "all" ||
        row.status === allocationStatusFilter;

      const matchesTransferred =
        allocationTransferredFilter === "all" ||
        (allocationTransferredFilter === "yes"
          ? row.isTransferred
          : !row.isTransferred);

      return (
        matchesSearch &&
        matchesChannel &&
        matchesStatus &&
        matchesTransferred
      );
    });
  }, [
    allocationRows,
    allocationSearchBy,
    allocationSearchTerm,
    allocationChannelFilter,
    allocationStatusFilter,
    allocationTransferredFilter,
  ]);

  const notTransferred = useMemo(
    () => viewRows.filter((r) => !r.isTransferred),
    [viewRows]
  );

  const showNotTransferredHeader = useMemo(() => {
    if (!cycle) return false;
    const bothNull = (cycle.postedAt == null) && (cycle.postedByUserId == null);
    return !bothNull;
  }, [cycle]);

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

  /* ───────── columns ───────── */
  const columnsView: DataGridColumn[] = [
    {
      key: "employeeName",
      label: t("employee"),
      renderCell: (r: SalaryAllocationResultRow) => r.employeeName,
    },
    {
      key: "channel",
      label: t("channel"),
      renderCell: (r: SalaryAllocationResultRow) =>
        r.channel ? channelLabel(r.channel) : "",
    },
    {
      key: "destination",
      label: t("destination"),
      renderCell: (r: SalaryAllocationResultRow) => r.destination,
    },
    {
      key: "amount",
      label: t("amount"),
      renderCell: (r: SalaryAllocationResultRow) =>
        r.amount.toLocaleString(),
    },
    {
      key: "status",
      label: t("status"),
      renderCell: (r: SalaryAllocationResultRow) => r.status,
    },
    {
      key: "transferResultCode",
      label: t("resultCode"),
      renderCell: (r: SalaryAllocationResultRow) => r.transferResultCode,
    },
    {
      key: "transferResultReason",
      label: t("reason"),
      renderCell: (r: SalaryAllocationResultRow) => r.transferResultReason,
    },
    {
      key: "isTransferred",
      label: t("isTransferred", { defaultValue: "Transferred" }),
      renderCell: (r: SalaryAllocationResultRow) =>
        r.isTransferred
          ? t("yes", { defaultValue: "Yes" })
          : t("no", { defaultValue: "No" }),
    },
    {
      key: "commissionAmount",
      label: t("commission"),
      renderCell: (r: SalaryAllocationResultRow) =>
        r.commissionAmount.toLocaleString(),
    },
    {
      key: "transferredAt",
      label: t("transferredAt"),
      renderCell: (r: SalaryAllocationResultRow) =>
        r.transferredAt ? new Date(r.transferredAt).toLocaleString(locale) : "",
    },
  ];

  const columnsEdit: DataGridColumn[] = [
    {
      key: "select",
      label: "",
      renderHeader: () => (
        <input
          type="checkbox"
          checked={
            employees.length > 0 &&
            employees.every((e) => selectedRows.includes(e.id))
          }
          onChange={toggleAll}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      renderCell: (row: EmployeeRow) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleRow(row.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

  /* ───────── commission preview (build recipients + open modal) ───────── */
  const openCommissionPreview = useCallback(
    async (fromAccOverride?: string) => {
      if (!cycle) return;

      try {
        const fromAccount =
          (fromAccOverride && fromAccOverride.length > 0
            ? fromAccOverride
            : cycle.debitAccount) ?? "";

        const detailed: Array<{
          accountNumber: string;
          name?: string;
          salary?: number;
        }> = isEditing
          ? employees
              .filter((employee) => selectedRows.includes(employee.id))
              .flatMap((employee) =>
                buildAllocationInputs(employee).map((allocation) => ({
                  accountNumber: allocation.destination,
                  name: `${employee.name} (${channelLabel(allocation.paymentChannel)})`,
                  salary: allocation.amount,
                }))
              )
          : ((cycle.entries as unknown as SalaryEntryRow[]) || []).flatMap(
              (entry) =>
                (entry.allocations ?? []).map((allocation) => ({
                  accountNumber: allocation.destination,
                  name: `${entry.name ?? entry.employeeName ?? ""} (${channelLabel(allocation.paymentChannel)})`,
                  salary: allocation.amount,
                }))
            );

        const toAccounts = Array.from(
          new Set(
            detailed
              .map((recipient) => recipient.accountNumber)
              .filter((account) => account && account.trim().length > 0)
          )
        );

        setRecipients(detailed);

        const totalAmount = isEditing ? computedTotalEdit : computedTotalView;
        const commissionCurrency = cycle.currency;
        const displayAmount = totalAmount;

        const desc = `${t("cycle")} #${cycle.id} – ${cycle.salaryMonth}`;

        setConfirmState({
          formData: {
            from: fromAccount,
            to: toAccounts,
            value: totalAmount,
            description: desc,
            commissionOnRecipient: commissionOnReceiver,
          },
          commissionAmount: 0,
          commissionCurrency,
          displayAmount,
        });
        setConfirmOpen(true);
      } catch (e: unknown) {
        alert(
          e instanceof Error
            ? e.message
            : "Failed to prepare commission preview."
        );
      }
    },
    [cycle, isEditing, employees, selectedRows, computedTotalEdit, computedTotalView, commissionOnReceiver, channelLabel, t]
  );

  /* ───────── save handler ───────── */
  const handleSave = async (debitAccount: string): Promise<void> => {
    if (!cycle) return;

    const invalidRow = employees
      .filter((row) => selectedRows.includes(row.id))
      .map((row) => ({ row, validation: validateAllocations(row) }))
      .find(({ validation }) => !validation.valid);

    if (invalidRow) {
      alert(allocationErrorMessage(invalidRow.row, invalidRow.validation.reason));
      setCanPost(false);
      return;
    }

    const entries = employees
      .filter((e) => selectedRows.includes(e.id))
      .map((employee) => ({
        employeeId: employee.id,
        salary: roundAmount(toAmount(employee.salary)),
        allocations: buildAllocationInputs(employee),
      }));

    try {
      await editSalaryCycle(
        cycle.id,
        debitAccount,
        salaryMonthInput,
        entries
      );
      await refetchCycle(cycle.id);
      setIsEditing(false);
      setCanPost(true);
    } catch (err: unknown) {
      alert(
        localizedApiErrorMessage(err, locale) ?? "Failed to save salary cycle."
      );
      setCanPost(false);
    }
  };

  /* ───────── confirm modal action: POST cycle then show result modal ───────── */
  const handleConfirmPost = useCallback(async () => {
    if (!cycle || postingRef.current) return;
    postingRef.current = true;
    try {
      setPosting(true);
      await postSalaryCycleById(cycle.id);
      await refetchCycle(cycle.id);

      // Close confirm modal
      setConfirmOpen(false);

      // Show success modal
      setResultSuccess(true);
      setResultTitle(t("postedTitle", { defaultValue: "Cycle Posted" }));
      setResultMessage(
        t("postedMsg", {
          defaultValue: "Salaries were submitted successfully.",
        })
      );
      setResultOpen(true);
    } catch (e: unknown) {
      const msg =
        localizedApiErrorMessage(e, locale) ??
        t("genericError", {
          defaultValue: "Something went wrong while posting the cycle.",
        });

      // Keep confirm modal open so user can retry, but also show error modal
      setResultSuccess(false);
      setResultTitle(t("failedTitle", { defaultValue: "Posting Failed" }));
      setResultMessage(msg);
      setResultOpen(true);
    } finally {
      postingRef.current = false;
      setPosting(false);
    }
  }, [cycle, locale, refetchCycle, t]);

  /* ───────── early states ───────── */
  if (loading) return <LoadingPage />;

  if (error || !cycle) {
    return (
      <p className="p-4 text-red-600">
        {error ?? "Unknown error while loading cycle"}
      </p>
    );
  }

  if (isEditing && (empError || accError)) {
    return (
      <p className="p-4 text-red-600">
        {empError ?? accError ?? "Unknown error in edit mode"}
      </p>
    );
  }

  const isPosted: boolean = Boolean(cycle.postedAt);
  const showPostButton: boolean = !isPosted && hasPostPermission;

  /* ───────── view mode ───────── */
  if (!isEditing) {
    const cycleForSummary: TSalaryTransaction = {
      ...cycle,
    };

    const selectClassName =
      "h-10 rounded border border-white/30 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-warning-light focus:outline-none focus:ring-2 focus:ring-warning-light/40";

    const allocationGridControls = (
      <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={allocationChannelFilter}
            onChange={(event) =>
              setAllocationChannelFilter(
                event.target.value as AllocationChannelFilter
              )
            }
            className={selectClassName}
            aria-label={t("channel")}
          >
            <option value="all">{t("allChannels")}</option>
            <option value="account">{t("paymentChannelAccount")}</option>
            <option value="bcd">{t("paymentChannelBcd")}</option>
            <option value="evo">{t("paymentChannelEvo")}</option>
          </select>

          <select
            value={allocationStatusFilter}
            onChange={(event) => setAllocationStatusFilter(event.target.value)}
            className={selectClassName}
            aria-label={t("status")}
          >
            <option value="all">{t("allStatuses")}</option>
            {allocationStatusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>

          <select
            value={allocationTransferredFilter}
            onChange={(event) =>
              setAllocationTransferredFilter(
                event.target.value as AllocationTransferredFilter
              )
            }
            className={selectClassName}
            aria-label={t("isTransferred")}
          >
            <option value="all">{t("allTransferStates")}</option>
            <option value="yes">{t("yes")}</option>
            <option value="no">{t("no")}</option>
          </select>

          <div className="flex items-baseline gap-2 text-sm font-medium text-white">
            <span>{t("filteredEmployees")}:</span>
            <span>
              {filteredAllocationRows.length.toLocaleString()} /{" "}
              {allocationRows.length.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isPosted ? (
            <Formik
              initialValues={{}}
              onSubmit={() => {
                setIsEditing(true);
                setCanPost(false);
              }}
            >
              {() => (
                <div className="flex flex-wrap items-center gap-2">
                  <SubmitButton
                    title={t("edit")}
                    color="info-dark"
                    fullWidth={false}
                  />
                  {showPostButton && (
                    <button
                      type="button"
                      onClick={() => openCommissionPreview(cycle.debitAccount)}
                      disabled={!canPost || posting}
                      className={`rounded px-4 py-2 border ${
                        !canPost || posting
                          ? "bg-slate-300 text-slate-600 cursor-not-allowed border-slate-300"
                          : "bg-info-dark text-white hover:opacity-90 border-white hover:border-transparent hover:bg-warning-light hover:text-info-dark"
                      }`}
                      title={
                        canPost
                          ? undefined
                          : t("saveToEnablePost", {
                              defaultValue:
                                "You must save your changes before posting.",
                            })
                      }
                    >
                      {posting
                        ? t("posting", { defaultValue: "Posting..." })
                        : t("post", { defaultValue: "Post" })}
                    </button>
                  )}
                  {showNotTransferredHeader && cycle && (
                    <NotTransferredHeader
                      entries={notTransferred}
                      cycleId={cycle.id}
                      onApply={handleRepostApplied}
                    />
                  )}
                </div>
              )}
            </Formik>
          ) : (
            showNotTransferredHeader &&
            cycle && (
              <NotTransferredHeader
                entries={notTransferred}
                cycleId={cycle.id}
                onApply={handleRepostApplied}
              />
            )
          )}
        </div>
      </div>
    );

    return (
      <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
        <SalaryCycleSummaryCard
          mode="view"
          cycle={cycleForSummary}
          locale={locale}
        />
        <CrudDataGrid
          data={filteredAllocationRows}
          columns={columnsView}
          showActions={false}
          showSearchBar
          showSearchInput
          showDropdown
          dropdownOptions={[
            { value: "employeeName", label: t("searchByName") },
            { value: "destination", label: t("searchByAccountNumber") },
          ]}
          onSearch={setAllocationSearchTerm}
          onDropdownSelect={(value) =>
            setAllocationSearchBy(value as AllocationSearchBy)
          }
          showAddButton={false}
          noPagination
          currentPage={1}
          totalPages={1}
          onPageChange={() => { }}
          childrens={allocationGridControls}
          canEdit={false}
          loading={false}
          getRowClassName={(row) =>
            Number(row.employeeGroupIndex) % 2 === 0 ? "bg-white" : "bg-slate-50"
          }
        />

        {confirmState && (
          <SalaryConfirmInfoModal
            isOpen={confirmOpen}
            formData={confirmState.formData}
            commissionAmount={confirmState.commissionAmount}
            commissionCurrency={confirmState.commissionCurrency}
            displayAmount={confirmState.displayAmount}
            recipients={recipients} // <-- includes salary per employee
            isSubmitting={posting}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleConfirmPost}
          />
        )}

        {/* Result modal */}
        <ErrorOrSuccessModal
          isOpen={resultOpen}
          isSuccess={resultSuccess}
          title={resultTitle}
          message={resultMessage}
          onClose={() => setResultOpen(false)}
          onConfirm={() => setResultOpen(false)}
          okLabel={t("ok", { defaultValue: "حسناً" })}
          confirmLabel={t("confirm", { defaultValue: "تأكيد" })}
          closeAriaLabel={t("close", { defaultValue: "إغلاق" })}
        />
      </div>
    );
  }

  /* ───────── edit mode ───────── */
  const cycleForEditSummary: TSalaryTransaction = {
    ...cycle,
    totalAmount: computedTotalEdit,
  };

  return (
    <Formik
      initialValues={{ debitAccount: cycle.debitAccount }}
      enableReinitialize
      onSubmit={async (vals, { setSubmitting }) => {
        await handleSave(vals.debitAccount);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
            <SalaryCycleSummaryCard
              mode="edit"
              cycle={cycleForEditSummary}
              locale={locale}
              salaryMonthInput={salaryMonthInput}
              onSalaryMonthChange={setSalaryMonthInput}
              accountOptions={accountOptions}
              accLoading={accLoading}
            />

            <CrudDataGrid
              data={employees}
              columns={columnsEdit}
              showActions={false}
              showSearchBar={false}
              showAddButton={false}
              noPagination
              currentPage={1}
              totalPages={1}
              onPageChange={() => { }}
              childrens={
                <div className="flex items-center gap-2">
                  <SubmitButton
                    title={t("save")}
                    color="info-dark"
                    disabled={isSubmitting}
                    fullWidth={false}
                  />
                  {showPostButton && (
                    <button
                      type="button"
                      disabled
                      className="rounded px-4 py-2 bg-slate-300 text-slate-600 cursor-not-allowed"
                      title={t("saveToEnablePost", {
                        defaultValue: "Save changes to enable posting.",
                      })}
                    >
                      {t("post", { defaultValue: "Post" })}
                    </button>
                  )}
                  {showNotTransferredHeader && cycle && (
                    <NotTransferredHeader
                      entries={notTransferred}
                      cycleId={cycle.id}
                      onApply={handleRepostApplied}
                    />
                  )}
                </div>
              }
              canEdit={false}
              loading={empLoading || accLoading}
            />

            {confirmState && (
              <SalaryConfirmInfoModal
                isOpen={confirmOpen}
                formData={confirmState.formData}
                commissionAmount={confirmState.commissionAmount}
                commissionCurrency={confirmState.commissionCurrency}
                displayAmount={confirmState.displayAmount}
                recipients={recipients} // <-- includes salary per employee
                isSubmitting={posting}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmPost}
              />
            )}

            {/* Result modal */}
            <ErrorOrSuccessModal
              isOpen={resultOpen}
              isSuccess={resultSuccess}
              title={resultTitle}
              message={resultMessage}
              onClose={() => setResultOpen(false)}
              onConfirm={() => setResultOpen(false)}
              okLabel={t("ok", { defaultValue: "حسناً" })}
              confirmLabel={t("confirm", { defaultValue: "تأكيد" })}
              closeAriaLabel={t("close", { defaultValue: "إغلاق" })}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}
