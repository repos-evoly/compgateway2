"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckRequestForm from "./components/CheckRequestForm";

import { TCheckRequestValues } from "./types";
import { getCheckRequests, createCheckRequest } from "./services";
import { TCheckRequestFormValues } from "./types";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW
import RequestPdfDownloadButton from "@/app/components/reusable/RequestPdfDownloadButton";

// Permission helpers (copied from other pages)
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

const CheckRequestPage: React.FC = () => {
  const t = useTranslations("CheckRequest");

  /* ─── Table state ─────────────────────────────────────────── */
  const [data, setData] = useState<TCheckRequestValues[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  /* ─── Search state ────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  /* ─── Form toggle ─────────────────────────────────────────── */
  const [showForm, setShowForm] = useState(false);

  /* ─── Modal state (NEW) ───────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  /* ─── Permissions ─────────────────────────────────────────── */
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const canEdit = permissionsSet.has("CheckRequestCanEdit");
  const canView = permissionsSet.has("CheckRequestCanView");
  const showAddButton = canEdit;
  const canOpenForm = canEdit || canView;
  const isReadOnly = !canEdit && canView;

  /* ─── Fetch data ──────────────────────────────────────────── */
  useEffect(() => {
    async function fetchData() {
      setLoading(true); // Set loading state
      try {
        const response = await getCheckRequests(
          currentPage,
          limit,
          searchTerm,
          searchBy
        );
        setData(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error("Failed to fetch check requests:", err);
        const msg = err instanceof Error ? err.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false); // Reset loading state
      }
    }
    fetchData();
  }, [currentPage, limit, searchTerm, searchBy, t]);

  /* ─── Columns ─────────────────────────────────────────────── */
  const columns = [
    { key: "branch", label: t("branch") },
    { key: "date", label: t("date") },
    { key: "customerName", label: t("customerName") },
    { key: "cardNum", label: t("cardNum") },
    { key: "accountNum", label: t("accountNum") },
    { key: "beneficiary", label: t("beneficiary") },
    { 
      key: "representativeId", 
      label: t("delegate"),
      renderCell: (row: Record<string, unknown>) => {
        // Debug: Log the row data to see what we're getting
        console.log('Representative row data:', {
          representativeId: row.representativeId,
          representativeName: row.representativeName,
          representative: row.representative
        });
        // Show representative name from the representativeName field or fallback to ID
        return row.representativeName || (row.representativeId ? `ID: ${row.representativeId}` : '-');
      }
    },
    { key: "status", label: t("status") },
    {
      key: "actions",
      label: t("actions", { defaultValue: "Actions" }),
      renderCell: (row: TCheckRequestValues) => (
        <RequestPdfDownloadButton
          request={row}
          requestType="Certified Check Request"
          title={t("downloadPdf", { defaultValue: "Download PDF" })}
        />
      ),
      width: 120,
    },
  ];

  /* ─── Handlers ────────────────────────────────────────────── */
  const handleAddClick = () => setShowForm(true);

  const handleFormSubmit = async (formVals: TCheckRequestFormValues) => {
    try {
      const newItem = await createCheckRequest(formVals);
      setData((prev) => [newItem, ...prev]);
      setShowForm(false);

      /* success modal */
      setModalTitle(t("successTitle"));
      setModalMessage(t("successMessage"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to create check request:", error);
      const msg = error instanceof Error ? error.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleFormCancel = () => setShowForm(false);

  /* ─── Search helpers ──────────────────────────────────────── */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  const handleDropdownSelect = (field: string) => {
    setSearchBy(field);
    setCurrentPage(1);
  };

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="p-4">
      {showForm && canOpenForm ? (
        <CheckRequestForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          readOnly={isReadOnly}
        />
      ) : (
        <CrudDataGrid
          data={data}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showSearchBar
          showSearchInput
          showDropdown
          onSearch={handleSearch}
          onDropdownSelect={handleDropdownSelect}
          showAddButton={showAddButton}
          onAddClick={handleAddClick}
          loading={loading}
          canEdit={canEdit}
        />
      )}

      {/* Error / Success modal (NEW) */}
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
};

export default CheckRequestPage;
