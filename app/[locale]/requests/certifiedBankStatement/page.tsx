
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CertifiedBankStatementForm from "./components/CertifiedBankStatementForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import {
  getCertifiedBankStatements,
  createCertifiedBankStatement,
} from "./services";
import type {
  CertifiedBankStatementRequest,
  CertifiedBankStatementRequestWithID,
} from "./types";
import { printCertifiedStatement } from "./components/printCertifiedStatement";
import {
  getStatement,
  type StatementLine,
} from "@/app/[locale]/statement-of-account/services";


const getCookieValue = (key: string): string | undefined =>
  typeof document !== "undefined"
    ? document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))
      ?.split("=")[1]
    : undefined;

const decodeCookieArray = (value: string | undefined): ReadonlySet<string> => {
  if (!value) return new Set<string>();
  try {
    return new Set(JSON.parse(decodeURIComponent(value)) as string[]);
  } catch {
    return new Set<string>();
  }
};

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────── */
function withBalanceAndReference(data: StatementLine[]): StatementLine[] {
  let running = 0;
  return data.map((ln) => {
    running += ln.amount ?? 0;
    return {
      ...ln,
      balance: running,
      reference: ln.trxCode ?? ln.nr1 ?? "",
    };
  });
}

/** keep only YYYY-MM-DD (drop time/zone) */
function toDateOnlyIso(input?: string): string {
  if (!input) return "";
  const idx = input.indexOf("T");
  return idx > 0 ? input.slice(0, idx) : input;
}

/** format for display (GB dd/mm/yyyy) */
function fmtDateIsoToGB(d?: string): string {
  const s = toDateOnlyIso(d);
  if (!s) return "";
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-GB");
}

/** API expects account as string preserving leading zeros (pad to 13 if short) */
function formatAccountForApi(account: number | string | undefined): string {
  if (typeof account === "number") {
    const s = String(account);
    return s.length < 13 ? s.padStart(13, "0") : s;
  }
  if (typeof account === "string" && account.trim().length > 0) {
    return account.length < 13 ? account.padStart(13, "0") : account;
  }
  return "";
}

export default function CertifiedBankStatementPage() {
  const t = useTranslations("bankStatement");

  /*──────────────────────────── Grid & form state ───────────────────────*/
  const [data, setData] = useState<CertifiedBankStatementRequestWithID[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const limit = 10;

  /*──────────────────────────── Modal state ─────────────────────────────*/
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  /* per-row print loading */
  const [printingId, setPrintingId] = useState<number | null>(null);

  /*──────────────────────────── Fetch paginated data ────────────────────*/
  useEffect(() => {
    async function fetchData(): Promise<void> {
      setLoading(true);
      try {
        const res = await getCertifiedBankStatements({
          page: currentPage,
          limit,
        });
        setData(res.data);
        setTotalPages(res.totalPages);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("unknownError");
        setModalTitle(t("fetchError"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, [currentPage, t]);

  /*──────────────────────────── Handlers ───────────────────────────────*/
  const handleAddClick = (): void => setShowForm(true);

  async function handleFormSubmit(
    values: CertifiedBankStatementRequestWithID
  ): Promise<void> {
    try {
      const { id: _unused, ...rest } = values;
      void _unused;

      const payload = rest as CertifiedBankStatementRequest;

      const created = await createCertifiedBankStatement(payload);
      setData((prev) => [created, ...prev]);

      setModalTitle(t("createSuccessTitle"));
      setModalMessage(t("createSuccessMsg"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("createErrorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  }

  const closeModal = (): void => setModalOpen(false);
  const confirmModal = (): void => {
    if (modalSuccess) setShowForm(false);
    setModalOpen(false);
  };

  /* Use the SAME print function used in the form — pass API-friendly dates & account */
  const handlePrintRow = async (
    row: CertifiedBankStatementRequestWithID
  ): Promise<void> => {
    try {
      setPrintingId(row.id);

      const account = formatAccountForApi(row.accountNumber);
      const fromDate = toDateOnlyIso(
        row.fromDate ?? row.statementRequest?.fromDate
      );
      const toDate = toDateOnlyIso(row.toDate ?? row.statementRequest?.toDate);

      // Fetch statement lines and compute balances
      const linesRaw = await getStatement({ account, fromDate, toDate });
      const linesProcessed = withBalanceAndReference(linesRaw);

      if (linesProcessed.length === 0) {
        setModalTitle(t("noDataTitle", { defaultValue: "No data" }));
        setModalMessage(
          t("noDataMsg", {
            defaultValue: "No statement lines found for this request.",
          })
        );
        setModalSuccess(false);
        setModalOpen(true);
        return;
      }

      const accountInfo = {
        accountNumber: account,
        customerName:
          typeof row.accountHolderName === "string" &&
            row.accountHolderName.trim() !== ""
            ? row.accountHolderName
            : linesProcessed[0]?.nr1 ?? "Customer Name",
        accountType: "جاري",
        currency: "دينار",
        branchAgency: "0015",
        timePeriod: `${fmtDateIsoToGB(fromDate)} - ${fmtDateIsoToGB(toDate)}`,
      };

      await printCertifiedStatement(linesProcessed, accountInfo);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("printErrorTitle", { defaultValue: "Print error" }));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setPrintingId(null);
    }
  };

  /*──────────────────────────── Columns ─────────────────────────────────*/
  const columns = [
    { key: "accountHolderName", label: t("accountHolderName") },
    { key: "accountNumber", label: t("accountNumber") },
    {
      key: "authorizedOnTheAccountName",
      label: t("authorizedOnTheAccountName"),
    },
    {
      key: "totalAmountLyd",
      label: t("totalAmountLyd"),
      renderCell: (row: CertifiedBankStatementRequestWithID) =>
        typeof row.totalAmountLyd === "number"
          ? row.totalAmountLyd.toLocaleString("en-LY", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          })
          : "",
    },
    {
      key: "fromDate",
      label: t("fromDate"),
      renderCell: (row: CertifiedBankStatementRequestWithID) =>
        fmtDateIsoToGB(row.fromDate ?? row.statementRequest?.fromDate),
    },
    {
      key: "toDate",
      label: t("toDate"),
      renderCell: (row: CertifiedBankStatementRequestWithID) =>
        fmtDateIsoToGB(row.toDate ?? row.statementRequest?.toDate),
    },
    { key: "status", label: t("status") },
    {
      key: "actions",
      label: t("actions", { defaultValue: "Actions" }),
      width: 140,
      renderCell: (row: CertifiedBankStatementRequestWithID) => (
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50"
          onClick={() => void handlePrintRow(row)}
          disabled={printingId === row.id}
          aria-label={t("downloadPdf", { defaultValue: "Download PDF" })}
          title={t("downloadPdf", { defaultValue: "Download PDF" })}
        >
          {printingId === row.id
            ? t("printing", { defaultValue: "Printing..." })
            : t("downloadPdf", { defaultValue: "Download PDF" })}
        </button>
      ),
    },
  ];

  /*──────────────────────────── Permissions ─────────────────────────────*/
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const canEdit = permissionsSet.has("CertifiedBankStatementCanEdit");
  const canView = permissionsSet.has("CertifiedBankStatementCanView");
  const showAddButton = canEdit;
  const canOpenForm = canEdit || canView;
  const isReadOnly = !canEdit && canView;

  /*──────────────────────────── Render ──────────────────────────────────*/
  return (
    <div className="p-6">
      {showForm && canOpenForm ? (
        <CertifiedBankStatementForm
          onSubmit={handleFormSubmit}
          readOnly={isReadOnly}
        />
      ) : (
        <CrudDataGrid
          data={data}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showAddButton={showAddButton}
          onAddClick={handleAddClick}
          loading={loading}
          canEdit={canEdit}
        />
      )}

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={closeModal}
        onConfirm={confirmModal}
      />
    </div>
  );
}
