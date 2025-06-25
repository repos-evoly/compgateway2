/* --------------------------------------------------------------------------
 * app/[locale]/requests/letterOfGuarantee/page.tsx
 * Complete, i18n-ready page component
 * ----------------------------------------------------------------------- */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import LetterOfGuaranteeForm from "./components/LetterOfGuaranteeForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getLetterOfGuarantees, addLetterOfGuarantee } from "./services";

import type {
  LetterOfGuaranteeApiItem,
  LetterOfGuaranteeApiResponse,
  TLetterOfGuarantee,
} from "./types";

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function LetterOfGuaranteePage() {
  /* --------------------------------------------------------------
   * Translation hooks
   * -------------------------------------------------------------- */
  const tCol = useTranslations("letterOfGuarantee.page.columns"); // table headers
  const tUi = useTranslations("letterOfGuarantee.page.ui"); // misc UI strings
  const tMsg = useTranslations("letterOfGuarantee.page.messages"); // modal texts

  /* --------------------------------------------------------------
   * Local state
   * -------------------------------------------------------------- */
  const [data, setData] = useState<LetterOfGuaranteeApiItem[]>([]);
  const [totalPages, setTotal] = useState<number>(1);
  const [currentPage, setPage] = useState<number>(1);
  const limit = 10;

  /* search */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  /* form / modal */
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOk, setModalOk] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMsg, setModalMsg] = useState("");
  const [loading, setLoading] = useState<boolean>(true);


  /* --------------------------------------------------------------
   * Fetch helper
   * -------------------------------------------------------------- */
  const fetchData = async () => {
    setLoading(true); // Set loading state
    try {
      const term = searchTerm.trim();
      const res: LetterOfGuaranteeApiResponse = await getLetterOfGuarantees(
        currentPage,
        limit,
        term,
        term ? searchBy : ""
      );
      setData(res.data);
      setTotal(res.totalPages);
    } catch (err) {
      console.error("Fetch error:", err);
      setModalTitle(tMsg("fetchErrorTitle"));
      setModalMsg(
        err instanceof Error ? err.message : tMsg("fetchErrorGeneric")
      );
      setModalOk(false);
      setModalOpen(true);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  /* run on mount / deps change */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, searchTerm, searchBy]);

  /* --------------------------------------------------------------
   * Columns
   * -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
   * Search handlers
   * -------------------------------------------------------------- */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) setSearchBy("");
    setPage(1);
  };

  const handleDropdownSelect = (val: string) => {
    if (searchTerm) setSearchBy(val);
    else setSearchBy("");
  };

  /* --------------------------------------------------------------
   * Add / submit handlers
   * -------------------------------------------------------------- */
  const handleFormSubmit = async (newItem: TLetterOfGuarantee) => {
    try {
      const { id, ...body } = newItem; // exclude id
      console.log("Submitting new letter of guarantee:", id);
      await addLetterOfGuarantee(body);

      setModalTitle(tMsg("savedTitle"));
      setModalMsg(tMsg("savedMessage"));
      setModalOk(true);
      setModalOpen(true);

      fetchData();
      setShowForm(false);
    } catch (err) {
      setModalTitle(tMsg("submitErrorTitle"));
      setModalMsg(
        err instanceof Error ? err.message : tMsg("submitErrorGeneric")
      );
      setModalOk(false);
      setModalOpen(true);
    }
  };

  /* --------------------------------------------------------------
   * JSX
   * -------------------------------------------------------------- */
  return (
    <div className="p-4">
      {/* Add / grid toggle */}
      {showForm ? (
        <LetterOfGuaranteeForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <CrudDataGrid
          data={data}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
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
          /* add button */
          showAddButton
          addButtonLabel={tUi("addButton")} /* if CrudDataGrid supports label */
          onAddClick={() => setShowForm(true)}
          loading={loading}
        />
      )}

      {/* Modal feedback */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalOk}
        title={modalTitle}
        message={modalMsg}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          if (modalOk) fetchData();
        }}
      />
    </div>
  );
}
