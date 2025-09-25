/* --------------------------------------------------------------------------
   app/[locale]/salaries/[cycleId]/page.tsx
   – SalaryCycleDetailsPage
   – Uses SalaryConfirmInfoModal (name + per-employee amount shown there)
   – Shows ErrorOrSuccessModal (success/error) **from the page** after posting
   – UPDATED: send each employee's salary amount to the modal (recipients[].salary)
-------------------------------------------------------------------------- */
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
import SalaryConfirmInfoModal from "../components/SalaryConfirmInfoModal";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

/* ---------- helpers: cookies ---------- */
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

  /* --- confirm modal state --- */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmModalState | null>(
    null
  );

  /* Recipients for confirm modal (NOW INCLUDES salary) */
  const [recipients, setRecipients] = useState<
    Array<{ accountNumber: string; name?: string; salary?: number }>
  >([]);

  /* --- post button availability --- */
  const [canPost, setCanPost] = useState<boolean>(true);

  /* --- posting in progress --- */
  const [posting, setPosting] = useState<boolean>(false);

  /* --- result modal (success/error) --- */
  const [resultOpen, setResultOpen] = useState<boolean>(false);
  const [resultSuccess, setResultSuccess] = useState<boolean>(false);
  const [resultTitle, setResultTitle] = useState<string>("");
  const [resultMessage, setResultMessage] = useState<string>("");

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

  /* ───────── commission preview (build recipients + open modal) ───────── */
  const openCommissionPreview = useCallback(
    async (fromAccOverride?: string) => {
      if (!cycle) return;

      try {
        const fromAccount =
          (fromAccOverride && fromAccOverride.length > 0
            ? fromAccOverride
            : cycle.debitAccount) ?? "";

        // Build recipients with name + account + salary
        let toAccountsRaw: string[] = [];
        let detailed: Array<{
          accountNumber: string;
          name?: string;
          salary?: number;
        }> = [];

        if (isEditing) {
          const selected = employees.filter((e) => selectedRows.includes(e.id));
          toAccountsRaw = selected.map((e) => e.accountNumber);

          // Deduplicate by accountNumber while preserving the first name/salary
          const map = new Map<string, { name?: string; salary?: number }>();
          for (const e of selected) {
            const acc = (e.accountNumber || "").trim();
            if (!acc) continue;
            if (!map.has(acc)) {
              map.set(acc, { name: e.name, salary: Number(e.salary) || 0 });
            }
          }
          detailed = Array.from(map.entries()).map(([accountNumber, meta]) => ({
            accountNumber,
            name: meta.name,
            salary: meta.salary,
          }));
        } else {
          const entries = (cycle.entries as unknown as SalaryEntryRow[]) || [];
          toAccountsRaw = entries.map((e) => e.accountNumber);

          const map = new Map<string, { name?: string; salary?: number }>();
          for (const e of entries) {
            const acc = (e.accountNumber || "").trim();
            if (!acc) continue;
            if (!map.has(acc)) {
              map.set(acc, { name: e.name, salary: Number(e.salary) || 0 });
            }
          }
          detailed = Array.from(map.entries()).map(([accountNumber, meta]) => ({
            accountNumber,
            name: meta.name,
            salary: meta.salary,
          }));
        }

        const toAccounts = Array.from(
          new Set(toAccountsRaw.filter((x) => x && x.trim().length > 0))
        );

        setRecipients(detailed); // <-- includes salary for the modal table

        const totalAmount = isEditing ? computedTotalEdit : computedTotalView;

        // currency lookup (last 3 chars)
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
      setCanPost(true);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to save salary cycle."
      );
      setCanPost(false);
    }
  };

  /* ───────── confirm modal action: POST cycle then show result modal ───────── */
  const handleConfirmPost = useCallback(async () => {
    if (!cycle) return;
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
        e instanceof Error
          ? e.message
          : t("genericError", {
              defaultValue: "Something went wrong while posting the cycle.",
            });

      // Keep confirm modal open so user can retry, but also show error modal
      setResultSuccess(false);
      setResultTitle(t("failedTitle", { defaultValue: "Posting Failed" }));
      setResultMessage(msg);
      setResultOpen(true);
    } finally {
      setPosting(false);
    }
  }, [cycle, refetchCycle, t]);

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
      totalAmount: computedTotalView,
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
          <SalaryConfirmInfoModal
            isOpen={confirmOpen}
            formData={confirmState.formData}
            commissionAmount={confirmState.commissionAmount}
            commissionCurrency={confirmState.commissionCurrency}
            displayAmount={confirmState.displayAmount}
            recipients={recipients} // <-- includes salary per employee
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
              onPageChange={() => {}}
              childrens={
                <div className="flex gap-2">
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
