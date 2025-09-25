"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import RequestPdfDownloadButton from "@/app/components/reusable/RequestPdfDownloadButton";

import ForeignTransfersForm, {
  ForeignTransfersFormValues,
} from "./components/ForeignTransfersForm";

import { getForeignTransfers, createForeignTransfer } from "./services";

/* ---------- cookie helpers ---------- */
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
    return new Set(JSON.parse(decodeURIComponent(value)));
  } catch {
    return new Set<string>();
  }
};

/* ---------- local types ---------- */
type SearchBy = "toBank" | "beneficiary";

type GridRow = {
  id: number;
  toBank: string;
  beneficiaryName: string;
  transferAmount: number;
  status: string;
};

export default function ForeignTransfersListPage() {
  const t = useTranslations("foreignTransfers");

  // Full items for forms/details
  const [items, setItems] = useState<ForeignTransfersFormValues[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Searching (ONLY by toBank and beneficiary)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchBy, setSearchBy] = useState<SearchBy>("toBank");

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // Permissions
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const canEdit = permissionsSet.has("ForeignTransfersCanEdit");
  const canView = permissionsSet.has("ForeignTransfersCanView");
  const showAddButton = canEdit;
  const canOpenForm = canEdit || canView;
  const isReadOnly = !canEdit && canView;

  // Fetch data on page / search changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await getForeignTransfers(
          currentPage,
          limit,
          searchTerm,
          searchBy
        );
        // Map API -> form values shape (if needed); here we keep as-is
        const mapped: ForeignTransfersFormValues[] = response.data.map(
          (item) => ({
            id: item.id,
            toBank: item.toBank,
            branch: item.branch,
            residentSupplierName: item.residentSupplierName,
            residentSupplierNationality: item.residentSupplierNationality,
            nonResidentPassportNumber: item.nonResidentPassportNumber,
            placeOfIssue: item.placeOfIssue,
            dateOfIssue: item.dateOfIssue,
            nonResidentNationality: item.nonResidentNationality,
            nonResidentAddress: item.nonResidentAddress,
            transferAmount: item.transferAmount,
            toCountry: item.toCountry,
            beneficiaryName: item.beneficiaryName,
            beneficiaryAddress: item.beneficiaryAddress,
            externalBankName: item.externalBankName,
            externalBankAddress: item.externalBankAddress,
            transferToAccountNumber: item.transferToAccountNumber,
            transferToAddress: item.transferToAddress,
            accountHolderName: item.accountHolderName,
            permanentAddress: item.permanentAddress,
            purposeOfTransfer: item.purposeOfTransfer,
            status: item.status,
            reason: item.reason,
          })
        );
        setItems(mapped);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, limit, searchTerm, searchBy, t]);

  // Grid data: only the fields we show
  const gridData: GridRow[] = useMemo(
    () =>
      items.map((it) => ({
        id: it.id ?? 0,
        toBank: it.toBank ?? "",
        beneficiaryName: it.beneficiaryName ?? "",
        transferAmount: it.transferAmount ?? 0,
        status: it.status ?? "",
      })),
    [items]
  );

  // Grid columns (keys must exist in gridData)
  const columns = [
    { key: "toBank", label: t("toBank") },
    { key: "beneficiaryName", label: t("beneficiary") },
    { key: "transferAmount", label: t("transferAmount") },
    { key: "status", label: t("status") },
    {
      key: "actions",
      label: t("actions", { defaultValue: "Actions" }),
      renderCell: (row: GridRow) => (
        <RequestPdfDownloadButton
          requestId={row.id}
          requestType="foreignTransfer"
          title={t("downloadPdf", { defaultValue: "Download PDF" })}
        />
      ),
      width: 120,
    },
  ];

  // Handlers
  const handleAddClick = () => setShowForm(true);

  const handleFormSubmit = async (values: ForeignTransfersFormValues) => {
    try {
      await createForeignTransfer({
        toBank: values.toBank || "",
        branch: values.branch || "",
        residentSupplierName: values.residentSupplierName || "",
        residentSupplierNationality: values.residentSupplierNationality || "",
        nonResidentPassportNumber: String(
          values.nonResidentPassportNumber || ""
        ),
        placeOfIssue: values.placeOfIssue || "",
        dateOfIssue: values.dateOfIssue || "",
        nonResidentNationality: values.nonResidentNationality || "",
        nonResidentAddress: values.nonResidentAddress || "",
        transferAmount: values.transferAmount || 0,
        toCountry: values.toCountry || "",
        beneficiaryName: values.beneficiaryName || "",
        beneficiaryAddress: values.beneficiaryAddress || "",
        externalBankName: values.externalBankName || "",
        externalBankAddress: values.externalBankAddress || "",
        transferToAccountNumber: String(values.transferToAccountNumber || ""),
        transferToAddress: values.transferToAddress || "",
        accountHolderName: values.accountHolderName || "",
        permanentAddress: values.permanentAddress || "",
        purposeOfTransfer: values.purposeOfTransfer || "",
        status: values.status || "",
        reason: values.reason || "",
      });
      // Refresh list
      setShowForm(false);
      setCurrentPage(1);
      // Trigger fetch by updating deps
      setSearchTerm((s) => s);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  return (
    <div className="p-4">
      {showForm && canOpenForm ? (
        <ForeignTransfersForm
          onSubmit={handleFormSubmit}
          readOnly={isReadOnly}
        />
      ) : (
        <CrudDataGrid
          data={gridData}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showSearchBar
          showSearchInput
          showDropdown
          dropdownOptions={[
            { value: "toBank", label: t("toBank") },
            { value: "beneficiary", label: t("beneficiary") },
          ]}
          onDropdownSelect={(val) => {
            if (val === "toBank" || val === "beneficiary") {
              setSearchBy(val);
              // setCurrentPage(1);
            }
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            // setCurrentPage(1);
          }}
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
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
}
