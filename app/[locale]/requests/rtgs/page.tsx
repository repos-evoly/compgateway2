"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import RTGSForm from "./components/RTGSForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import RequestPdfDownloadButton from "@/app/components/reusable/RequestPdfDownloadButton";

import type { TRTGSValues, TRTGSFormValues } from "./types";
import { getRtgsRequests, createRtgsRequest } from "./services";

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

const RTGSListPage: React.FC = () => {
  const t = useTranslations("RTGSForm");
  const pathname = usePathname();

  // Determine the locale based on the pathname
  const [currentLocale, setCurrentLocale] = useState("en");
  useEffect(() => {
    const segments = pathname?.split("/") || [];
    const locale = segments[1];
    setCurrentLocale(locale === "ar" ? "ar" : "en");
  }, [pathname]);

  /* ─────────────────────────── Grid / form state ────────────────────────── */
  const [data, setData] = useState<TRTGSValues[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const limit = 10;

  /* ─────────────────────────── Modal state ──────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  /* ─────────────────────────── Fetch paginated data ─────────────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getRtgsRequests(currentPage, limit);
        setData(res.data);
        setTotalPages(res.totalPages);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("unknownError");
        setModalTitle(t("fetchError"));
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, limit, t]);

  /* ─────────────────────────── Column defs ─────────────────────────────── */
  const columns = [
    { key: "refNum", label: t("refNum") },
    { key: "date", label: t("date") },
    { key: "paymentType", label: t("payType") },
    { key: "applicantName", label: t("name") },
    { key: "beneficiaryName", label: t("benName") },
    { key: "amount", label: t("amount") },
    { key: "status", label: t("status") },
    {
      key: "actions",
      label: t("actions", { defaultValue: "Actions" }),
      renderCell: (row: { id: number }) => (
        <RequestPdfDownloadButton
          requestType="rtgs" // key used in the fetcherMap
          requestId={row.id} // pass only the primary-key
          title={t("downloadPdf", { defaultValue: "Download PDF" })}
        />
      ),
      width: 120,
    },
  ];

  /* ─────────────────────────── Grid-friendly data ───────────────────────── */
  const rowData = data.map((item) => ({
    ...item,
    refNum: new Date(item.refNum).toLocaleDateString(currentLocale),
    date: new Date(item.date).toLocaleDateString(currentLocale),
  }));

  /* ─────────────────────────── Handlers ─────────────────────────────────── */
  const handleAddClick = () => setShowForm(true);

  const handleFormSubmit = async (values: TRTGSFormValues) => {
    try {
      const created = await createRtgsRequest(values as unknown as TRTGSValues);
      setData((prev) => [created, ...prev]);

      setModalTitle(t("createSuccessTitle"));
      setModalMessage(t("createSuccessMsg"));
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("createErrorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleFormCancel = () => setShowForm(false);

  const closeModal = () => setModalOpen(false);
  const confirmModal = () => {
    if (modalSuccess) setShowForm(false);
    setModalOpen(false);
  };

  // Permissions
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const canEdit = permissionsSet.has("RTGSCanEdit");
  const canView = permissionsSet.has("RTGSCanView");
  const showAddButton = canEdit;
  const canOpenForm = canEdit || canView;
  const isReadOnly = !canEdit && canView;

  /* ─────────────────────────── Render ───────────────────────────────────── */
  return (
    <div className="p-4">
      {showForm && canOpenForm ? (
        <RTGSForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          readOnly={isReadOnly}
        />
      ) : (
        <CrudDataGrid
          data={rowData}
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

      {/*──────── Error / Success Modal ────────*/}
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

export default RTGSListPage;
