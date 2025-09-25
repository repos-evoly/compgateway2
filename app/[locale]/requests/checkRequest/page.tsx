// app/[locale]/requests/checkRequest/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckRequestForm from "./components/CheckRequestForm";
import type { TCheckRequestValues, TCheckRequestFormValues } from "./types";
import {
  getCheckRequests,
  createCheckRequest,
  type CheckRequestSearchBy,
} from "./services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import RequestPdfDownloadButton from "@/app/components/reusable/RequestPdfDownloadButton";

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

const CheckRequestPage: React.FC = () => {
  const t = useTranslations("CheckRequest");

  /* ─── Table / pagination ──────────────────────────────────── */
  const [data, setData] = useState<TCheckRequestValues[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  /* ─── Search ──────────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"" | CheckRequestSearchBy>("");

  /* ─── Form toggle ─────────────────────────────────────────── */
  const [showForm, setShowForm] = useState(false);

  /* ─── Modal ───────────────────────────────────────────────── */
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

  /* ─── Fetch ───────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
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
        const msg = err instanceof Error ? err.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
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
      renderCell: (row: TCheckRequestValues) =>
        row.representativeName ??
        (row.representativeId ? `ID: ${row.representativeId}` : "-"),
    },
    { key: "status", label: t("status") },
    {
      key: "actions",
      label: t("actions", { defaultValue: "Actions" }),
      renderCell: (row: TCheckRequestValues) => (
        <RequestPdfDownloadButton
          requestType="checkrequest"
          requestId={row.id ?? 0}
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
      const created = await createCheckRequest(formVals);
      setData((prev) => [created, ...prev]);
      setShowForm(false);

      setModalTitle(t("successTitle"));
      setModalMessage(t("successMessage"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleFormCancel = () => setShowForm(false);

  // search + dropdown
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // setCurrentPage(1);
  };
  const handleDropdownSelect = (field: string) => {
    if (
      field === "customer" ||
      field === "status" ||
      field === "rep" ||
      field === ""
    ) {
      setSearchBy(field as "" | CheckRequestSearchBy);
      // setCurrentPage(1);
    }
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
          dropdownOptions={[
            { value: "customer", label: t("customerName") }, // submit "customer"
            { value: "status", label: t("status") }, // submit "status"
            { value: "rep", label: t("delegate") }, // submit "rep"
          ]}
          onDropdownSelect={handleDropdownSelect}
          onSearch={handleSearch}
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
};

export default CheckRequestPage;
