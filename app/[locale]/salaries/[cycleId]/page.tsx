"use client";

import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import LoadingPage from "@/app/components/reusable/Loading";
import { CheckAccount, type AccountInfo } from "@/app/helpers/checkAccount";
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
import SalaryCycleSummaryCard from "../components/SalaryCycleSummaryCard";
import SalaryPostingConfirmModal, {
  type SalaryPostingTotals,
} from "../components/SalaryPostingConfirmModal";
import {
  getSalaryCycleDisplayStatus,
  getSalaryResultTone,
  getSalaryFailureMessage,
  isSalaryProcessingStatus,
  isKnownProviderFailureStatus,
  isManualReviewStatus,
  normalizeSalaryStatus,
} from "../salaryStatus";
import SalaryStatusBadge from "../components/SalaryStatusBadge";
import SalaryWalletBatchCard from "../components/SalaryWalletBatchCard";
import {
  editSalaryCycle,
  getSalaryCycleById,
  getSalaryWalletCapabilities,
  postSalaryCycleById,
  refreshSalaryWalletBatchStatus,
  retrySalaryWalletBatch,
  type NewCycleEntry,
} from "../services";
import type {
  SalaryEntryAllocation,
  SalaryWalletCapabilities,
  TSalaryTransaction,
} from "../types";

const EMPTY_AMOUNTS: AllocationAmounts = {
  bankAccount: 0,
  evoWallet: 0,
  bcdWallet: 0,
};

const getCompanyCode = (): string | undefined => {
  const value = Cookies.get("companyCode");
  return value ? decodeURIComponent(value).replace(/^"|"$/g, "") : undefined;
};

const permissionSet = (): ReadonlySet<string> => {
  const value = Cookies.get("permissions") ?? "";
  if (!value) return new Set();
  try {
    const parsed = JSON.parse(decodeURIComponent(value).replace(/^"|"$/g, ""));
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const channelFromAllocation = (
  allocation: SalaryEntryAllocation
): SalaryPaymentChannel | null => {
  if (
    allocation.paymentChannel === "bankAccount" ||
    allocation.paymentChannel === "evoWallet" ||
    allocation.paymentChannel === "bcdWallet"
  ) {
    return allocation.paymentChannel;
  }
  return null;
};

type AllocationRow = SalaryEntryAllocation & {
  employeeName: string;
  employeeId: number;
};

export default function SalaryCycleDetailsPage(): JSX.Element {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const { cycleId } = useParams<{ cycleId: string }>();
  const numericCycleId = Number(cycleId);
  const permissions = useMemo(permissionSet, []);
  const hasCreatePermission = permissions.has("canCreateOrEditSalaryCycle");
  const hasPostPermission = permissions.has("canPostSalaryCycle");

  const [cycle, setCycle] = useState<TSalaryTransaction | null>(null);
  const [capabilities, setCapabilities] =
    useState<SalaryWalletCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editAllocations, setEditAllocations] = useState<
    Record<number, AllocationAmounts>
  >({});
  const [debitAccount, setDebitAccount] = useState("");
  const [accountOptions, setAccountOptions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const postingRef = useRef(false);
  const [busyBatchId, setBusyBatchId] = useState<number | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultVariant, setResultVariant] = useState<"success" | "warning" | "error">("error");
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const showResult = useCallback(
    (result: boolean | "success" | "warning" | "error", title: string, message: string) => {
      setResultVariant(typeof result === "boolean" ? (result ? "success" : "error") : result);
      setResultTitle(title);
      setResultMessage(message);
      setResultOpen(true);
    },
    []
  );

  const refetchCycle = useCallback(async () => {
    if (!Number.isInteger(numericCycleId) || numericCycleId <= 0) {
      throw new Error(t("invalidCycleId"));
    }
    const fresh = await getSalaryCycleById(numericCycleId);
    setCycle(fresh);
    return fresh;
  }, [numericCycleId, t]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [freshCycle, walletCapabilities] = await Promise.all([
          getSalaryCycleById(numericCycleId),
          getSalaryWalletCapabilities(),
        ]);
        if (!active) return;
        setCycle(freshCycle);
        setCapabilities(walletCapabilities);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : t("cycleLoadFailed")
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    if (Number.isInteger(numericCycleId) && numericCycleId > 0) void load();
    else {
      setError(t("invalidCycleId"));
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [numericCycleId, t]);

  const allocationRows = useMemo<AllocationRow[]>(() => {
    if (!cycle) return [];
    return cycle.entries.flatMap((entry) => {
      const savedAllocations = entry.allocations ?? [];
      const normalizedAllocations: SalaryEntryAllocation[] =
        savedAllocations.length > 0
          ? savedAllocations
          : [
              {
                id: -entry.id,
                paymentChannel: "bankAccount",
                amount: roundSalaryAmount(entry.salary ?? entry.amount),
                destination: entry.accountNumber ?? null,
                recipientType: null,
                status: entry.isTransferred ? "completed" : "pending",
                isTransferred: entry.isTransferred,
                transferResultCode: entry.transferResultCode,
                transferResultReason: entry.transferResultReason,
                transferredAt: entry.transferredAt,
                commissionAmount: 0,
              },
            ];
      return normalizedAllocations.map((allocation) => ({
        ...allocation,
        employeeId: entry.employeeId,
        employeeName:
          allocation.recipientNameSnapshot ??
          entry.employeeName ??
          entry.name ??
          `#${entry.employeeId}`,
      }));
    });
  }, [cycle]);

  const postingTotals = useMemo<SalaryPostingTotals>(() => {
    const totals: SalaryPostingTotals = {
      bankAccount: { amount: 0, count: 0 },
      evoWallet: { amount: 0, count: 0 },
      bcdWallet: { amount: 0, count: 0 },
    };
    allocationRows.forEach((allocation) => {
      const channel = channelFromAllocation(allocation);
      if (!channel) return;
      totals[channel].amount = roundSalaryAmount(
        totals[channel].amount + allocation.amount
      );
      totals[channel].count += 1;
    });
    return totals;
  }, [allocationRows]);

  const hasUnavailableRail =
    (postingTotals.evoWallet.amount > 0 && capabilities?.evoEnabled !== true) ||
    (postingTotals.bcdWallet.amount > 0 && capabilities?.bcdEnabled !== true);

  const cycleStatus = cycle
    ? getSalaryCycleDisplayStatus(cycle)
    : "notPosted";
  const isNotPosted = (cycleStatus ?? "")
    .replace(/[\s_-]/g, "")
    .toLowerCase() === "notposted";
  const editable =
    hasCreatePermission &&
    capabilities?.canCreateOrEdit !== false &&
    (cycle?.canEdit ??
      (isNotPosted ||
        (!cycle?.postingStatus && !cycle?.postingStartedAt && !cycle?.postedAt)));
  const postable =
    hasPostPermission &&
    capabilities?.canPost !== false &&
    (cycle?.canPost ?? (isNotPosted || (!cycle?.postingStatus && !cycle?.postedAt))) &&
    !hasUnavailableRail;

  const beginEdit = async () => {
    if (!cycle || !editable) return;
    try {
      setEditLoading(true);
      const companyCode = getCompanyCode();
      if (!companyCode) throw new Error(t("companyCodeMissing"));
      const [allEmployees, accounts] = await Promise.all([
        getAllEmployees(),
        CheckAccount(companyCode),
      ]);
      const entryByEmployee = new Map(
        cycle.entries.map((entry) => [entry.employeeId, entry])
      );
      const merged = allEmployees.map((employee) => {
        const entry = entryByEmployee.get(employee.id);
        return entry
          ? { ...employee, salary: roundSalaryAmount(entry.salary ?? entry.amount) }
          : employee;
      });
      const nextAmounts: Record<number, AllocationAmounts> = {};
      cycle.entries.forEach((entry) => {
        const amounts = { ...EMPTY_AMOUNTS };
        const savedAllocations = entry.allocations ?? [];
        savedAllocations.forEach((allocation) => {
          const channel = channelFromAllocation(allocation);
          if (channel) amounts[channel] = roundSalaryAmount(allocation.amount);
        });
        if (savedAllocations.length === 0) {
          amounts.bankAccount = roundSalaryAmount(entry.salary ?? entry.amount);
        }
        nextAmounts[entry.employeeId] = amounts;
      });
      setEmployees(merged);
      setSelectedRows(cycle.entries.map((entry) => entry.employeeId));
      setEditAllocations(nextAmounts);
      setDebitAccount(cycle.debitAccount);
      setAccountOptions(
        accounts
          .filter((account: AccountInfo) => account.accountString.endsWith("001"))
          .map((account: AccountInfo) => account.accountString)
      );
      setIsEditing(true);
    } catch (editError) {
      showResult(
        false,
        t("editLoadFailedTitle"),
        editError instanceof Error ? editError.message : t("editLoadFailed")
      );
    } finally {
      setEditLoading(false);
    }
  };

  const updateEmployeeSalary = (employeeId: number, salary: number) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? { ...employee, salary: roundSalaryAmount(salary) }
          : employee
      )
    );
  };

  const updateEditAllocation = (
    employeeId: number,
    channel: SalaryPaymentChannel,
    amount: number
  ) => {
    setEditAllocations((current) => ({
      ...current,
      [employeeId]: {
        ...(current[employeeId] ?? EMPTY_AMOUNTS),
        [channel]: roundSalaryAmount(amount),
      },
    }));
  };

  const editValidation = (employee: EmployeeResponse): string | null => {
    const validation = validateEmployeeAllocations(
      employee,
      editAllocations[employee.id] ?? EMPTY_AMOUNTS,
      {
        evoEnabled: capabilities?.evoEnabled === true,
        bcdEnabled: capabilities?.bcdEnabled === true,
      }
    );
    if (validation.valid) return null;
    if (validation.reason === "bcdUnavailable") return t("bcdNotConfigured");
    if (validation.reason === "railUnavailable") return t("railNotConfigured");
    if (validation.reason === "destinationUnavailable") {
      return t("employeeDestinationMissing");
    }
    if (validation.reason === "allocationRequired") return t("allocationRequired");
    if (validation.reason === "salaryRequired") return t("salaryPositive");
    return t("allocationTotalMismatch");
  };

  const saveEdit = async () => {
    if (!cycle) return;
    const selected = employees.filter((employee) =>
      selectedRows.includes(employee.id)
    );
    if (selected.length === 0) {
      showResult(false, t("invalidAllocationsTitle"), t("noSelectionMsg"));
      return;
    }
    const invalid = selected.find((employee) => editValidation(employee));
    if (invalid) {
      showResult(
        false,
        t("invalidAllocationsTitle"),
        `${invalid.name}: ${editValidation(invalid)}`
      );
      return;
    }
    const entries: NewCycleEntry[] = selected.map((employee) => ({
      employeeId: employee.id,
      salary: roundSalaryAmount(employee.salary),
      allocations: buildAllocationRequest(
        editAllocations[employee.id] ?? EMPTY_AMOUNTS
      ),
    }));
    try {
      setEditLoading(true);
      await editSalaryCycle(
        cycle.id,
        debitAccount,
        cycle.salaryMonth,
        entries
      );
      await refetchCycle();
      setIsEditing(false);
      showResult(true, t("saveSuccessTitle"), t("cycleSaved"));
    } catch (saveError) {
      showResult(
        false,
        t("failedTitle"),
        saveError instanceof Error ? saveError.message : t("cycleSaveFailed")
      );
    } finally {
      setEditLoading(false);
    }
  };

  const confirmPost = async () => {
    if (!cycle || postingRef.current) return;
    postingRef.current = true;
    setPosting(true);
    try {
      const response = await postSalaryCycleById(cycle.id);
      const fresh = await refetchCycle();
      setConfirmOpen(false);
      const displayStatus = getSalaryCycleDisplayStatus(fresh);
      const tone = getSalaryResultTone(displayStatus);
      showResult(
        tone,
        isSalaryProcessingStatus(displayStatus)
          ? t("paymentProcessingTitle")
          : tone === "success" ? t("paymentCompletedTitle") : tone === "error" ? t("failedTitle") : t("postingOutcomeCheckTitle"),
        isSalaryProcessingStatus(displayStatus)
          ? t("paymentProcessingMessage")
          : tone === "success" ? t("paymentCompletedMessage")
            : getSalaryFailureMessage(fresh) ?? response.message ?? t("postingAccepted", { status: displayStatus })
      );
    } catch (postError) {
      const fresh = await refetchCycle().catch(() => undefined);
      setConfirmOpen(false);
      const status = fresh ? getSalaryCycleDisplayStatus(fresh) : "unknown";
      const tone = getSalaryResultTone(status);
      showResult(
        tone,
        isSalaryProcessingStatus(status) ? t("paymentProcessingTitle")
          : tone === "success" ? t("paymentCompletedTitle") : tone === "error" ? t("failedTitle") : t("postingOutcomeCheckTitle"),
        isSalaryProcessingStatus(status) ? t("paymentProcessingMessage")
          : tone === "success" ? t("paymentCompletedMessage")
            : (fresh ? getSalaryFailureMessage(fresh) : undefined) ?? (postError instanceof Error ? postError.message : t("postingOutcomeCheckMessage"))
      );
    } finally {
      postingRef.current = false;
      setPosting(false);
    }
  };

  const runBatchAction = async (batchId: number, action: "refresh" | "retry") => {
    if (!cycle) return;
    try {
      setBusyBatchId(batchId);
      if (action === "refresh") {
        await refreshSalaryWalletBatchStatus(cycle.id, batchId);
      } else {
        await retrySalaryWalletBatch(cycle.id, batchId);
      }
      const fresh = await refetchCycle();
      const freshBatch = fresh.walletBatches?.find((batch) => batch.id === batchId);
      const actionStatus =
        freshBatch?.status ??
        freshBatch?.overallStatus ??
        getSalaryCycleDisplayStatus(fresh);
      const tone = getSalaryResultTone(actionStatus, freshBatch?.requiresManualReview);
      showResult(
        tone,
        isSalaryProcessingStatus(actionStatus) ? t("paymentProcessingTitle")
          : tone === "success" ? t("paymentCompletedTitle") : tone === "error" ? t("failedTitle") : t("postingOutcomeCheckTitle"),
        isSalaryProcessingStatus(actionStatus) ? t("paymentProcessingMessage")
          : tone === "success" ? t("paymentCompletedMessage")
            : getSalaryFailureMessage(fresh, batchId) ?? t("postingAccepted", { status: actionStatus })
      );
    } catch (batchError) {
      await refetchCycle().catch(() => undefined);
      showResult(
        false,
        t("failedTitle"),
        batchError instanceof Error ? batchError.message : t("genericError")
      );
    } finally {
      setBusyBatchId(null);
    }
  };

  const channelLabel = (channel: SalaryPaymentChannel) =>
    channel === "bankAccount"
      ? t("channelBank")
      : channel === "evoWallet"
        ? t("channelEvo")
        : t("channelBcd");

  const allocationColumns: DataGridColumn[] = [
    { key: "employeeName", label: t("name") },
    {
      key: "paymentChannel",
      label: t("paymentChannel"),
      renderCell: (row: AllocationRow) => channelLabel(row.paymentChannel),
    },
    {
      key: "destination",
      label: t("destination"),
      renderCell: (row: AllocationRow) => (
        <div dir="ltr">
          <div className="font-mono">{row.destination || "-"}</div>
          {(row.recipientType || row.paymentChannel === "bankAccount") && (
            <div className="text-xs text-slate-500">
              {row.recipientType === "accountNumber" ||
              row.paymentChannel === "bankAccount"
                ? t("accountNumber")
                : row.recipientType === "phoneNumber"
                  ? t("walletPhoneNumber")
                  : t("walletId")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: t("amount"),
      renderCell: (row: AllocationRow) => `${row.amount.toLocaleString()} ${cycle?.currency ?? "LYD"}`,
    },
    {
      key: "status",
      label: t("status"),
      renderCell: (row: AllocationRow) => <SalaryStatusBadge status={row.status} />,
    },
    {
      key: "commissionAmount",
      label: t("commission"),
      renderCell: (row: AllocationRow) => `${roundSalaryAmount(row.commissionAmount).toLocaleString()} ${cycle?.currency ?? "LYD"}`,
    },
    {
      key: "providerReference",
      label: t("providerReference"),
      renderCell: (row: AllocationRow) => (
        <div className="space-y-1 font-mono text-xs" dir="ltr">
          <div>{row.providerTransactionId || "-"}</div>
          <div>{row.providerTxCode ?? row.txCode ?? "-"}</div>
        </div>
      ),
    },
    {
      key: "result",
      label: t("resultDetails"),
      renderCell: (row: AllocationRow) => (
        <div className="max-w-64 text-sm">
          <div>{row.transferResultReason || row.transferResultCode || "-"}</div>
          {row.reversalStatus && (
            <div className="mt-1 text-xs text-purple-700">
              {t("reversal")}: {row.reversalStatus} {row.reversalReference ?? ""}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "transferredAt",
      label: t("transferredAt"),
      renderCell: (row: AllocationRow) =>
        row.transferredAt ? new Date(row.transferredAt).toLocaleString(locale) : "-",
    },
  ];

  if (loading) return <LoadingPage />;
  if (error || !cycle) return <p className="p-4 text-red-600">{error ?? t("cycleLoadFailed")}</p>;

  if (isEditing) {
    const editColumns: DataGridColumn[] = [
      {
        key: "selected",
        label: "",
        renderCell: (employee: EmployeeResponse) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(employee.id)}
            onChange={() =>
              setSelectedRows((current) =>
                current.includes(employee.id)
                  ? current.filter((id) => id !== employee.id)
                  : [...current, employee.id]
              )
            }
          />
        ),
      },
      { key: "name", label: t("name") },
      {
        key: "salary",
        label: t("salary"),
        renderCell: (employee: EmployeeResponse) => (
          <input type="number" min={0} step="0.001" value={employee.salary} onChange={(event) => updateEmployeeSalary(employee.id, Number(event.target.value))} className="w-28 rounded border border-slate-300 px-2 py-1" />
        ),
      },
      ...(["bankAccount", "evoWallet", "bcdWallet"] as SalaryPaymentChannel[]).map(
        (channel): DataGridColumn => ({
          key: channel,
          label: channelLabel(channel),
          renderCell: (employee: EmployeeResponse) => {
            const enabled = channel === "bankAccount" || (channel === "evoWallet" ? capabilities?.evoEnabled : capabilities?.bcdEnabled);
            const destination = employeeHasDestination(employee, channel);
            return (
              <input
                type="number"
                min={0}
                step="0.001"
                disabled={!enabled || !destination}
                value={(editAllocations[employee.id] ?? EMPTY_AMOUNTS)[channel]}
                onChange={(event) => updateEditAllocation(employee.id, channel, Number(event.target.value))}
                className="w-28 rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 disabled:text-slate-400"
              />
            );
          },
        })
      ),
      {
        key: "total",
        label: t("allocationTotal"),
        renderCell: (employee: EmployeeResponse) => (
          <div>
            <div>{allocationTotal(editAllocations[employee.id] ?? EMPTY_AMOUNTS).toLocaleString()} / {roundSalaryAmount(employee.salary).toLocaleString()}</div>
            {selectedRows.includes(employee.id) && editValidation(employee) && (
              <div className="text-xs text-red-600">{editValidation(employee)}</div>
            )}
          </div>
        ),
      },
    ];

    return (
      <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-xl bg-info-dark p-4 text-white">
          <label className="text-sm">
            <span className="mb-1 block">{t("debitAccount")}</span>
            <select value={debitAccount} onChange={(event) => setDebitAccount(event.target.value)} className="h-10 rounded-md border border-white/30 bg-white px-3 text-slate-900">
              {!accountOptions.includes(debitAccount) && debitAccount && <option value={debitAccount}>{debitAccount}</option>}
              {accountOptions.map((account) => <option key={account} value={account}>{account}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsEditing(false)} disabled={editLoading} className="inline-flex items-center gap-2 rounded-md border border-white/40 px-4 py-2 text-sm font-medium"><FaTimes />{t("cancel")}</button>
            <button type="button" onClick={saveEdit} disabled={editLoading} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-info-dark disabled:opacity-50"><FaSave />{t("save")}</button>
          </div>
        </div>
        <CrudDataGrid data={employees} columns={editColumns} showActions={false} showSearchBar={false} showAddButton={false} noPagination currentPage={1} totalPages={1} onPageChange={() => undefined} canEdit={false} loading={editLoading} />
        <ErrorOrSuccessModal isOpen={resultOpen} isSuccess={resultVariant === "success"} variant={resultVariant} title={resultTitle} message={resultMessage} onClose={() => setResultOpen(false)} onConfirm={() => setResultOpen(false)} />
      </div>
    );
  }

  const knownProviderFailure = isKnownProviderFailureStatus(cycleStatus);
  const unknownOutcome =
    !knownProviderFailure &&
    (cycle.outcomeKnown === false || isManualReviewStatus(cycleStatus));
  const bankFeeStatus = normalizeSalaryStatus(cycle.bankFeeStatus);
  const bankFeeNeedsReview =
    bankFeeStatus === "failed" || bankFeeStatus === "unknown";
  const manualReview =
    !bankFeeNeedsReview &&
    (cycle.requiresManualReview === true || unknownOutcome);

  return (
    <div className={`space-y-4 p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      <SalaryCycleSummaryCard mode="view" cycle={cycle} locale={locale} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-info-dark px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t("status")}</span>
          <SalaryStatusBadge status={cycleStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          {editable && (
            <button type="button" onClick={beginEdit} disabled={editLoading} className="inline-flex items-center gap-2 rounded-md border border-white/40 px-4 py-2 text-sm font-medium disabled:opacity-50"><FaEdit />{t("edit")}</button>
          )}
          {postable && (
            <button type="button" onClick={() => setConfirmOpen(true)} disabled={posting} className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">{t("post")}</button>
          )}
        </div>
      </div>

      {hasUnavailableRail && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {t("cycleContainsUnavailableRail")}
        </div>
      )}
      {bankFeeNeedsReview && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            bankFeeStatus === "failed"
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-amber-300 bg-amber-50 text-amber-950"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 font-semibold">
            <span>{t("bankFeeSettlementStatus")}</span>
            <SalaryStatusBadge status={cycleStatus} />
          </div>
          <div className="mt-1">
            {cycle.bankFeeError ||
              (bankFeeStatus === "failed"
                ? t("bankFeeSettlementFailed")
                : t("bankFeeSettlementUnknown"))}
          </div>
        </div>
      )}
      {manualReview && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="font-semibold">{t("manualReviewRequired")}</div>
          <div className="mt-1">
            {unknownOutcome
              ? t("unknownOutcomeNoRetry")
              : knownProviderFailure
                ? t("knownProviderFailureManualReview")
                : t("manualReviewFollowUp")}
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">{t("salaryAllocations")}</h2>
        <CrudDataGrid data={allocationRows} columns={allocationColumns} showActions={false} showSearchBar={false} showAddButton={false} noPagination currentPage={1} totalPages={1} onPageChange={() => undefined} canEdit={false} loading={false} />
      </section>

      {(cycle.walletBatches ?? []).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">{t("walletBatches")}</h2>
          {(cycle.walletBatches ?? []).map((batch) => (
            <SalaryWalletBatchCard
              key={batch.id}
              batch={batch}
              currency={cycle.currency}
              canPost={hasPostPermission}
              busy={busyBatchId === batch.id}
              onRefresh={() => runBatchAction(batch.id, "refresh")}
              onRetry={() => runBatchAction(batch.id, "retry")}
            />
          ))}
        </section>
      )}

      <SalaryPostingConfirmModal
        isOpen={confirmOpen}
        debitAccount={cycle.debitAccount}
        currency={cycle.currency}
        totalAmount={cycle.totalAmount}
        totals={postingTotals}
        submitting={posting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmPost}
      />
      <ErrorOrSuccessModal isOpen={resultOpen} isSuccess={resultVariant === "success"} variant={resultVariant} title={resultTitle} message={resultMessage} onClose={() => setResultOpen(false)} onConfirm={() => setResultOpen(false)} okLabel={t("ok")} confirmLabel={t("confirm")} closeAriaLabel={t("close")} />
    </div>
  );
}
