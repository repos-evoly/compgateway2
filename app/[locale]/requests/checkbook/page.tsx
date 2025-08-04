"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckbookForm from "./components/CheckbookForm";
import { getCheckbookRequests } from "./services";
import type { TCheckbookFormValues } from "./types";
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

const CheckbookPage: React.FC = () => {
  const t = useTranslations("checkForm");

  /* ---------- table / pagination ---------- */
  const [data, setData] = useState<TCheckbookFormValues[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  /* ---------- search ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  /* ---------- form toggle ---------- */
  const [showForm, setShowForm] = useState(false);

  /* ---------- modal ---------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  /* ---------- permissions ---------- */
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const canEdit = permissionsSet.has("CheckbookCanEdit");
  const canView = permissionsSet.has("CheckbookCanView");
  const showAddButton = canEdit;
  const canOpenForm = canEdit || canView;
  const isReadOnly = !canEdit && canView;

  /* ---------- fetch ---------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCheckbookRequests(
          currentPage,
          limit,
          searchTerm,
          searchBy
        );
        setData(res.data);
        setTotalPages(res.totalPages);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, limit, searchTerm, searchBy, t]);

  /* ---------- grid columns ---------- */
  const columns = [
    { key: "fullName", label: t("name") },
    { key: "address", label: t("address") },
    { key: "accountNumber", label: t("accNum") },
    { key: "branch", label: t("branch") },
    { key: "date", label: t("date") },
    { key: "representativeId", label: t("sendTo") },
    { key: "status", label: t("status") },
    {
      key: "actions",
      label: t("actions", { defaultValue: "Actions" }),
      width: 120,
      renderCell: (row: TCheckbookFormValues) => (
        <RequestPdfDownloadButton
          requestType="checkbook" /* matches fetcherMap key */
          requestId={row.id!} /* only the primary key */
          title={t("downloadPdf", { defaultValue: "Download PDF" })}
        />
      ),
    },
  ];

  /* ---------- handlers ---------- */
  const handleAddClick = () => setShowForm(true);

  const handleFormSubmit = (newItem: TCheckbookFormValues) => {
    setData((prev) => [newItem, ...prev]);
    setShowForm(false);
    setModalTitle(t("successTitle"));
    setModalMessage(t("successMessage"));
    setModalSuccess(true);
    setModalOpen(true);
  };

  /* ---------- modal helpers ---------- */
  const closeModal = () => setModalOpen(false);
  const confirmModal = () => setModalOpen(false);

  /* ---------- render ---------- */
  return (
    <div className="p-4">
      {showForm && canOpenForm ? (
        <CheckbookForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          readOnly={isReadOnly}
        />
      ) : (
        <CrudDataGrid
          data={data}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showSearchInput
          showDropdown
          showSearchBar
          dropdownOptions={[
            { value: "fullName", label: t("name") },
            { value: "status", label: t("status") },
          ]}
          onDropdownSelect={(sel) => {
            if (sel) {
              setSearchBy(String(sel));
              setCurrentPage(1);
            }
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
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
        onClose={closeModal}
        onConfirm={confirmModal}
      />
    </div>
  );
};

export default CheckbookPage;
