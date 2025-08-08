"use client";

import React, { JSX, useEffect, useMemo, useState, useCallback } from "react";
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
  CommissionConfig,
  ConfirmModalState,
  CurrencyLookup,
  EmployeeRow,
  SalaryEntryRow,
  TSalaryTransaction,
} from "../types";
import { getEmployees } from "../../employees/services";
import type { EmployeeResponse } from "../../employees/types";
import { CheckAccount, type AccountInfo } from "@/app/helpers/checkAccount";
import { type InputSelectComboOption } from "@/app/components/FormUI/InputSelectCombo";
import SalaryCycleSummaryCard from "../components/SalaryCycleSummaryCard";

import { getCurrencies } from "@/app/[locale]/currencies/services";
import { getCompannyInfoByCode } from "@/app/[locale]/profile/services";
import {
  checkAccount,
  getTransfersCommision,
} from "../../transfers/internal/services";
import ConfirmInfoModal from "../../transfers/group-transfer/components/ConfirmInfoModal";
import LoadingPage from "@/app/components/reusable/Loading";

/* ---------- helpers: cookies ---------- */
const getCompanyCode = (): string | undefined => {
  const raw = Cookies.get("companyCode");
  if (!raw) return undefined;
  return decodeURIComponent(raw).replace(/^"|"$/g, "");
};

const getPermissionsFromCookies = (): string[] => {
  // Expecting a URL-encoded JSON array, e.g. [%22A%22%2C%22B%22]
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

/* ------------------------------------------------------------------ */
export default function SalaryCycleDetailsPage(): JSX.Element {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const { cycleId } = useParams<{ cycleId: string }>();

  /* ---------- view state ---------- */
  const [cycle, setCycle] = useState<TSalaryTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- edit state ---------- */
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

  /* --- company config: who pays commission (for modal’s displayAmount) --- */
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
        // ignore, default false
      }
    })();
  }, []);

  /* --- permissions: show Post button only if allowed --- */
  const hasPostPermission = useMemo(() => {
    const perms = getPermissionsFromCookies();
    return perms.includes("canPostSalaryCycle");
  }, []);

  /* --- confirm modal state --- */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmModalState | null>(
    null
  );

  /* --- post button availability ---
     Starts enabled. Pressing Edit disables it.
     Successful Save (edit API) re-enables it. */
  const [canPost, setCanPost] = useState<boolean>(true);

  /* --- posting in progress (disable confirm and buttons) --- */
  const [posting, setPosting] = useState<boolean>(false);

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

      const res = await getEmployees(1, 100);
      const baseEmployees = res.data;

      let merged: EmployeeResponse[] = baseEmployees;
      if (cycle) {
        const salaryMap = new Map<number, number>(
          (
            cycle.entries as unknown as { employeeId: number; salary: number }[]
          ).map((e) => [e.employeeId, e.salary])
        );
        merged = baseEmployees.map((emp) =>
          salaryMap.has(emp.id)
            ? { ...emp, salary: salaryMap.get(emp.id)! }
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

    setSalaryMonthInput(
      new Date(cycle.salaryMonth).toISOString().split("T")[0]
    );

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
  const handleSalaryChange = (id: number, val: number): void => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, salary: val } : e))
    );
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

  /* ───────── columns ───────── */
  // View (initial page): no email/phone; add isTransferred at the end
  const columnsView: DataGridColumn[] = [
    { key: "name", label: t("name"), renderCell: (r) => r.name },
    { key: "salary", label: t("salary") },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType") },
    {
      key: "isTransferred",
      label: t("isTransferred", { defaultValue: "Transferred" }),
      renderCell: (r) =>
        r.isTransferred
          ? t("yes", { defaultValue: "Yes" })
          : t("no", { defaultValue: "No" }),
    },
  ];

  // Edit: keep full details for operators
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
      renderCell: (r) => (
        <input
          type="number"
          value={r.salary}
          min={0}
          onChange={(e) =>
            handleSalaryChange(r.id, Number(e.target.value) || 0)
          }
          className="w-24 rounded border border-gray-300 px-1 py-0.5 text-sm"
        />
      ),
    },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType") },
  ];

  /* ───────── commission preview (ConfirmInfoModal) prep ───────── */
  const openCommissionPreview = useCallback(
    async (fromAccOverride?: string) => {
      if (!cycle) return;

      try {
        const fromAccount =
          (fromAccOverride && fromAccOverride.length > 0
            ? fromAccOverride
            : cycle.debitAccount) ?? "";

        const toAccountsRaw: string[] = isEditing
          ? employees
              .filter((e) => selectedRows.includes(e.id))
              .map((e) => e.accountNumber)
          : (cycle.entries as unknown as SalaryEntryRow[]).map(
              (e) => e.accountNumber
            );

        const toAccounts = Array.from(
          new Set(toAccountsRaw.filter((x) => x && x.trim().length > 0))
        );

        const totalAmount = isEditing ? computedTotalEdit : computedTotalView;

        // currency lookup (same method as Internal Form: last 3 chars)
        const currencyCode = fromAccount.slice(-3);
        const currencyResp = (await getCurrencies(
          1,
          1,
          currencyCode,
          "code"
        )) as CurrencyLookup;
        const commissionCurrency =
          currencyResp.data?.[0]?.description ?? currencyCode;

        // transfer type via checkAccount(to)
        let transferType: "B2B" | "B2C" = "B2C";
        if (toAccounts.length > 0) {
          try {
            const res = (await checkAccount(toAccounts[0])) as Array<{
              transferType?: string;
            }>;
            const tt = res?.[0]?.transferType;
            transferType = tt === "B2B" ? "B2B" : "B2C";
          } catch {
            transferType = "B2C";
          }
        }

        // commission config
        const servicePackageId = Number(Cookies.get("servicePackageId") ?? 0);
        const comm = (await getTransfersCommision(
          servicePackageId,
          2
        )) as CommissionConfig;

        const pct =
          transferType === "B2B"
            ? comm.b2BCommissionPct
            : comm.b2CCommissionPct;
        const fixed =
          transferType === "B2B" ? comm.b2BFixedFee : comm.b2CFixedFee;

        const commissionAmount =
          totalAmount > 0 ? Math.max((pct * totalAmount) / 100, fixed) : 0;

        const displayAmount = commissionOnReceiver
          ? totalAmount
          : totalAmount + commissionAmount;

        const desc = `${t("cycle")} #${cycle.id} – ${new Date(
          cycle.salaryMonth
        ).toLocaleDateString(locale)}`;

        setConfirmState({
          formData: {
            from: fromAccount,
            to: toAccounts,
            value: totalAmount,
            description: desc,
            commissionOnRecipient: commissionOnReceiver,
          },
          commissionAmount,
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
    [
      cycle,
      isEditing,
      employees,
      selectedRows,
      computedTotalEdit,
      computedTotalView,
      commissionOnReceiver,
      t,
      locale,
    ]
  );

  /* ───────── save handler ───────── */
  const handleSave = async (debitAccount: string): Promise<void> => {
    if (!cycle) return;

    const entries = employees
      .filter((e) => selectedRows.includes(e.id))
      .map(({ id, salary }) => ({ employeeId: id, salary }));

    try {
      await editSalaryCycle(
        cycle.id,
        debitAccount,
        new Date(salaryMonthInput).toISOString(),
        entries
      );

      await refetchCycle(cycle.id);
      setIsEditing(false);

      // ✅ Successful save -> allow posting again
      setCanPost(true);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to save salary cycle."
      );
      // ❌ Keep posting disabled on error
      setCanPost(false);
    }
  };

  /* ───────── confirm modal action: POST cycle then refetch ───────── */
  const handleConfirmPost = useCallback(async () => {
    if (!cycle) return;
    try {
      setPosting(true);
      await postSalaryCycleById(cycle.id);
      await refetchCycle(cycle.id);
      setConfirmOpen(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to post salary cycle.");
    } finally {
      setPosting(false);
    }
  }, [cycle, refetchCycle]);

  /* ───────── early states ───────── */
  if (loading) {
    return <LoadingPage />;
  }
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
      totalAmount: computedTotalView, // show computed sum in summary
    };

    return (
      <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
        <SalaryCycleSummaryCard
          mode="view"
          cycle={cycleForSummary}
          locale={locale}
        />
        <CrudDataGrid
          data={viewRows}
          columns={columnsView}
          showActions={false}
          showSearchBar={false}
          showAddButton={false}
          noPagination
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          childrens={
            // If posted => hide both Edit & Post
            !isPosted ? (
              <Formik
                initialValues={{}}
                onSubmit={() => {
                  setIsEditing(true);
                  setCanPost(false);
                }}
              >
                {() => (
                  <div className="flex gap-2">
                    <SubmitButton
                      title={t("edit")}
                      color="info-dark"
                      fullWidth={false}
                    />
                    {showPostButton && (
                      <button
                        type="button"
                        onClick={() =>
                          openCommissionPreview(cycle.debitAccount)
                        }
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
                  </div>
                )}
              </Formik>
            ) : undefined
          }
          canEdit={false}
          loading={false}
        />

        {confirmState && (
          <ConfirmInfoModal
            isOpen={confirmOpen}
            formData={confirmState.formData}
            commissionAmount={confirmState.commissionAmount}
            commissionCurrency={confirmState.commissionCurrency}
            displayAmount={confirmState.displayAmount}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleConfirmPost}
          />
        )}
      </div>
    );
  }

  /* ───────── edit mode ───────── */
  const cycleForEditSummary: TSalaryTransaction = {
    ...cycle,
    totalAmount: computedTotalEdit, // live sum of selected employees
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
              onPageChange={() => {}}
              childrens={
                <div className="flex gap-2">
                  <SubmitButton
                    title={t("save")}
                    color="info-dark"
                    disabled={isSubmitting}
                    fullWidth={false}
                  />
                  {/* In edit mode, still hide the Post button unless user has permission AND cycle not posted (it will be disabled anyway until save). */}
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
                </div>
              }
              canEdit={false}
              loading={empLoading || accLoading}
            />

            {confirmState && (
              <ConfirmInfoModal
                isOpen={confirmOpen}
                formData={confirmState.formData}
                commissionAmount={confirmState.commissionAmount}
                commissionCurrency={confirmState.commissionCurrency}
                displayAmount={confirmState.displayAmount}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmPost}
              />
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}
