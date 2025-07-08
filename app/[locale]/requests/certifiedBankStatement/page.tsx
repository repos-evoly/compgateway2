"use client";

import React, { useEffect, useState } from "react";
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

  /*──────────────────────────── Fetch paginated data ────────────────────*/
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await getCertifiedBankStatements({
          page: currentPage,
          limit,
        });
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
    }
    fetchData();
  }, [currentPage, t]);

  /*──────────────────────────── Columns ─────────────────────────────────*/
  const columns = [
    { key: "accountHolderName", label: t("accountHolderName") },
    { key: "accountNumber", label: t("accountNumber") },
    {
      key: "authorizedOnTheAccountName",
      label: t("authorizedOnTheAccountName"),
    },
    { key: "statementRequest.fromDate", label: t("fromDate") },
    { key: "statementRequest.toDate", label: t("toDate") },
    { key: "status", label: t("status") },
  ];

  /*──────────────────────────── Handlers ───────────────────────────────*/
  const handleAddClick = () => setShowForm(true);

  async function handleFormSubmit(values: CertifiedBankStatementRequestWithID) {
    try {
      // Strip the placeholder id so the backend can generate its own
      const { id: _unused, ...rest } = values;
      void _unused; // ← mark as used

      const payload = rest as CertifiedBankStatementRequest;

      const created = await createCertifiedBankStatement(payload);
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
  }

  /* modal actions */
  const closeModal = () => setModalOpen(false);
  const confirmModal = () => {
    if (modalSuccess) setShowForm(false);
    setModalOpen(false);
  };

  /*──────────────────────────── Render ──────────────────────────────────*/
  return (
    <div className="p-6">
      {showForm ? (
        <CertifiedBankStatementForm onSubmit={handleFormSubmit} />
      ) : (
        <CrudDataGrid
          data={data}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showAddButton
          onAddClick={handleAddClick}
          loading={loading}
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
}
