// app/visarequests/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { getVisaRequests, createVisaRequest } from "./services";
import VisaWizardForm from "./components/VisaRequest";

import type { VisaRequestApiItem, VisaRequestFormValues } from "./types";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function VisaRequestListPage() {
  const t = useTranslations("visaRequest");

  /*─────────────────────────── Table / pagination ───────────────────────────*/
  const [apiData, setApiData] = useState<VisaRequestApiItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  /*─────────────────────────── Search input  ────────────────────────────────*/
  const [searchTerm, setSearchTerm] = useState("");

  /*─────────────────────────── Form toggle  ─────────────────────────────────*/
  const [showForm, setShowForm] = useState(false);

  /*─────────────────────────── Modal state  ─────────────────────────────────*/
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);


  /*─────────────────────────── Fetch list  ─────────────────────────────────*/
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  async function fetchData() {
    setLoading(true); // Set loading state
    try {
      const res = await getVisaRequests(currentPage, limit, searchTerm);
      setApiData(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("fetchError"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  /*─────────────────────────── Add button  ─────────────────────────────────*/
  const handleAddClick = () => setShowForm(true);

  /*─────────────────────────── Form submit  ────────────────────────────────*/
  async function handleFormSubmit(values: VisaRequestFormValues & { files?: File[] }) {
    try {
      await createVisaRequest(values);
      await fetchData();
      setShowForm(false);

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
  }

  /*─────────────────────────── Data for grid  ──────────────────────────────*/
  const gridData = apiData.map((item) => ({
    id: item.id,
    branch: item.branch ?? null,
    date: item.date ?? null,
    accountHolderName: item.accountHolderName ?? null,
  }));

  const columns = [
    { key: "branch", label: t("branch") },
    { key: "date", label: t("date") },
    { key: "accountHolderName", label: t("accountHolderName") },
    {key:"status", label: t("status") }
  ];

  /*─────────────────────────── Modal handlers  ─────────────────────────────*/
  const closeModal = () => setModalOpen(false);
  const confirmModal = () => {
    if (modalSuccess) fetchData();
    setModalOpen(false);
  };

  /*─────────────────────────── Render  ─────────────────────────────────────*/
  return (
    <div className="p-4">
      {showForm ? (
        <VisaWizardForm onSubmit={handleFormSubmit} />
      ) : (
        <CrudDataGrid
          data={gridData}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showSearchBar
          showSearchInput
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          showAddButton
          onAddClick={handleAddClick}
          loading={loading}
        />
      )}

      {/*──────────── Error / Success Modal ────────────*/}
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
