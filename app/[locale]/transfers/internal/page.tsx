"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FaFilePdf } from "react-icons/fa";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { checkAccount, getTransfers } from "./services";
import { generateTransferPdf } from "@/app/lib/generateTransferPdf";

/* ---------- API shapes (exact) ---------- */
type ApiTransferRow = {
  id: number;
  userId: number;
  categoryName: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currencyCode: string;
  packageName: string;
  status: string;
  description: string;
  requestedAt: string;
};

type ApiTransfersResponse = {
  data: ApiTransferRow[];
  totalPages: number;
};

/* ---------- UI row rendered here ---------- */
export type TransfersApiRow = {
  id: number;
  categoryName: string;
  fromAccount: string;
  toAccount: string | string[];
  amount: number;
  status: string;
  requestedAt: string;
  currencyId: string | null;
  description: string;
  economicSectorId: string | null;
  logoData?: string;
};

export type CheckAccountResponse = {
  accountString: string;
  availableBalance: number;
  debitBalance: number;
  transferType: string;
  companyName: string;
  branchCode: string;
  branchName: string;
};

type TransfersApiResponse = {
  data: TransfersApiRow[];
  totalPages: number;
};

const mapApiRowToUi = (row: ApiTransferRow): TransfersApiRow => ({
  id: row.id,
  categoryName: row.categoryName,
  fromAccount: row.fromAccount,
  toAccount: row.toAccount,
  amount: row.amount,
  status: row.status,
  requestedAt: row.requestedAt,
  currencyId: row.currencyCode ?? null,
  description: row.description ?? "",
  economicSectorId: null,
});

const Page = () => {
  const t = useTranslations("internalTransferForm");
  const router = useRouter();

  const [data, setData] = useState<TransfersApiRow[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const apiResult = (await getTransfers(
        currentPage,
        limit,
        searchTerm
      )) as ApiTransfersResponse;

      const uiRows = apiResult.data.map(mapApiRowToUi);
      const uiResult: TransfersApiResponse = {
        data: uiRows,
        totalPages: apiResult.totalPages,
      };

      setData(uiResult.data);
      setTotalPages(uiResult.totalPages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("fetchErrorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, t]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    router.push("/transfers/internal/add");
  };

  const handleDownload = async (row: TransfersApiRow) => {
    try {
      const toAcc: string =
        typeof row.toAccount === "string"
          ? row.toAccount
          : row.toAccount?.[0] ?? "";

      const [fromInfoList, toInfoList] = await Promise.all([
        checkAccount(row.fromAccount),
        toAcc
          ? checkAccount(toAcc)
          : Promise.resolve([] as CheckAccountResponse[]),
      ]);

      const fromInfo = fromInfoList?.[0] ?? null;
      const toInfo = toInfoList?.[0] ?? null;

      await generateTransferPdf(row, { from: fromInfo, to: toInfo });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("printErrorTitle", { defaultValue: "Print Error" }));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const columns = [
    { key: "id", label: t("id") },
    { key: "categoryName", label: t("category") },
    { key: "fromAccount", label: t("from") },
    { key: "toAccount", label: t("to") },
    { key: "amount", label: t("amount") },
    { key: "status", label: t("status") },
    { key: "requestedAt", label: t("requestedAt") },
    {
      key: "actions",
      label: t("actions"),
      renderCell: (row: TransfersApiRow) => (
        <button
          type="button"
          onClick={() => handleDownload(row)}
          aria-label={t("downloadPdf", { defaultValue: "Download PDF" })}
          title={t("downloadPdf", { defaultValue: "Download PDF" })}
          className="p-1 text-black"
        >
          <FaFilePdf size={18} />
        </button>
      ),
      width: 40,
    },
  ];

  return (
    <div className="p-1">
      <div id="main-app-content">
        <CrudDataGrid
          data={data}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          showSearchBar
          showSearchInput
          onSearch={handleSearch}
          showDropdown
          dropdownOptions={[{ label: "Category", value: "categoryName" }]}
          onDropdownSelect={() => {}}
          showAddButton
          onAddClick={handleAddClick}
          loading={loading}
        />
        <ErrorOrSuccessModal
          isOpen={modalOpen}
          isSuccess={modalSuccess}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
          onConfirm={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Page;
