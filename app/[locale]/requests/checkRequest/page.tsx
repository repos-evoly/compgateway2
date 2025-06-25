"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckRequestForm from "./components/CheckRequestForm";

import { TCheckRequestValues } from "./types";
import { getCheckRequests, createCheckRequest } from "./services";
import { TCheckRequestFormValues } from "./types";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW

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
    { key: "branchNum", label: t("branchNum") },
    { key: "date", label: t("date") },
    { key: "customerName", label: t("customerName") },
    { key: "cardNum", label: t("cardNum") },
    { key: "accountNum", label: t("accountNum") },
    { key: "beneficiary", label: t("beneficiary") },
  ];

  /* ─── Handlers ────────────────────────────────────────────── */
  const handleAddClick = () => setShowForm(true);

  const handleFormSubmit = async (formVals: TCheckRequestFormValues) => {
    try {
      const isoDate = formVals.date.toISOString();
      const payload = {
        branch: formVals.branch,
        branchNum: formVals.branchNum,
        date: isoDate,
        customerName: formVals.customerName,
        cardNum: formVals.cardNum,
        accountNum: formVals.accountNum,
        beneficiary: formVals.beneficiary,
        lineItems: formVals.lineItems,
      };

      const newItem = await createCheckRequest(payload);
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
      {showForm ? (
        <CheckRequestForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
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
          showAddButton
          onAddClick={handleAddClick}
          loading={loading}
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
