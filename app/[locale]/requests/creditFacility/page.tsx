/* --------------------------------------------------------------------------
 * app/[locale]/requests/creditFacility/page.tsx
 * i18n-ready (en ⇄ ar) Credit-Facility list page — copy-paste
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CreditFacilityForm from "./components/CreditFacilityForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getCreditFacilities, addCreditFacility } from "./services";

import type {
  CreditFacilityApiItem,
  CreditFacilitiesApiResponse,
  TCreditFacility,
} from "./types";

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function CreditFacilityPage() {
  /* ─── i18n hooks ──────────────────────────────────────────────── */
  const tCol = useTranslations("creditFacility.page.columns");
  const tUi = useTranslations("creditFacility.page.ui");
  const tMsg = useTranslations("creditFacility.page.messages");

  /* ─── Table state ─────────────────────────────────────────────── */
  const [data, setData] = useState<CreditFacilityApiItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  /* ─── Search state ────────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  /* ─── Form toggle ─────────────────────────────────────────────── */
  const [showForm, setShowForm] = useState(false);

  /* ─── Modal state ─────────────────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  /* ─── Fetch helper ────────────────────────────────────────────── */
  const fetchData = async () => {
    setLoading(true); // Set loading state
    try {
      const res: CreditFacilitiesApiResponse = await getCreditFacilities(
        currentPage,
        limit,
        searchTerm.trim(),
        searchTerm ? searchBy : ""
      );
      setData(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : tMsg("fetchErrorGeneric");
      setModalTitle(tMsg("fetchErrorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  /* ─── initial + reactive fetch ───────────────────────────────── */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, searchTerm, searchBy]);

  /* ─── Column definitions ─────────────────────────────────────── */
  const columns = [
    { key: "accountNumber", label: tCol("accountNumber") },
    { key: "date", label: tCol("date") },
    { key: "amount", label: tCol("amount") },
    { key: "purpose", label: tCol("purpose") },
    { key: "curr", label: tCol("currency") },
    { key: "type", label: tCol("type") },
    { key: "status", label: tCol("status") },
    { key: "createdAt", label: tCol("createdAt") },
  ];

  /* ─── Search handlers ────────────────────────────────────────── */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) setSearchBy("");
    setCurrentPage(1);
  };

  const handleDropdownSelect = (val: string) => {
    if (searchTerm) setSearchBy(val);
    else setSearchBy("");
  };

  /* ─── Form submit (add) ──────────────────────────────────────── */
  const handleFormSubmit = async (newItem: TCreditFacility) => {
    try {
      const { id: _unused, ...body } = newItem;
      void _unused;
      await addCreditFacility(body);

      setModalTitle(tMsg("savedTitle"));
      setModalMessage(tMsg("savedMessage"));
      setModalSuccess(true);
      setModalOpen(true);

      fetchData();
      setShowForm(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : tMsg("submitErrorGeneric");
      setModalTitle(tMsg("submitErrorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleFormCancel = () => setShowForm(false);

  /* ─── JSX ────────────────────────────────────────────────────── */
  return (
    <div className="p-4">
      {showForm ? (
        <CreditFacilityForm
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
          /* search */
          showSearchBar
          showSearchInput
          onSearch={handleSearch}
          showDropdown
          dropdownOptions={[
            { value: "accountNumber", label: tCol("accountNumber") },
            { value: "type", label: tCol("type") },
          ]}
          onDropdownSelect={handleDropdownSelect}
          /* add */
          showAddButton
          addButtonLabel={tUi("addButton")}
          onAddClick={() => setShowForm(true)}
          loading={loading}
        />
      )}

      {/* Modal */}
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
