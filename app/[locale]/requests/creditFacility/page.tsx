"use client";

import React, { useEffect, useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CreditFacilityForm from "./components/CreditFacilityForm";
import type {
  CreditFacilityApiItem,
  CreditFacilitiesApiResponse,
  TCreditFacility,
} from "./types";
import { getCreditFacilities, addCreditFacility } from "./services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal"; // ← NEW

export default function CreditFacilityPage() {
  /* ─── Table state ─────────────────────────────────────────── */
  const [data, setData] = useState<CreditFacilityApiItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
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

  /* ─── Fetch data helper ───────────────────────────────────── */
  async function fetchData() {
    try {
      const result: CreditFacilitiesApiResponse = await getCreditFacilities(
        currentPage,
        limit,
        searchTerm || "",
        searchTerm ? searchBy : ""
      );
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "فشل في جلب البيانات";
      setModalTitle("خطأ");
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  }

  /* ─── Initial & reactive fetch ────────────────────────────── */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, searchTerm, searchBy]);

  /* ─── Columns ─────────────────────────────────────────────── */
  const columns = [
    { key: "accountNumber", label: "رقم الحساب" },
    { key: "date", label: "التاريخ" },
    { key: "amount", label: "المبلغ" },
    { key: "purpose", label: "الغرض" },
    { key: "curr", label: "العملة" },
    { key: "type", label: "النوع" },
    { key: "status", label: "الحالة" },
    { key: "createdAt", label: "تاريخ الإنشاء" },
  ];

  /* ─── Search handlers ─────────────────────────────────────── */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) setSearchBy("");
    setCurrentPage(1);
  };

  const handleDropdownSelect = (val: string) => {
    if (searchTerm) {
      setSearchBy(val);
      setCurrentPage(1);
    } else {
      setSearchBy("");
    }
  };

  /* ─── Form submit (add) ───────────────────────────────────── */
  /* ─── Form submit (add) ───────────────────────────────────── */
  const handleFormSubmit = async (newItem: TCreditFacility) => {
    try {
      // strip the placeholder id so it won’t be sent
      const { id: _unused, ...body } = newItem;
      void _unused; // ← counts as “used”

      await addCreditFacility(body);
      await fetchData(); // refresh list
      setShowForm(false);

      setModalTitle("تم");
      setModalMessage("تمت إضافة التسهيل الائتماني بنجاح.");
      setModalSuccess(true);
      setModalOpen(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطأ أثناء الإضافة";
      setModalTitle("خطأ");
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleFormCancel = () => setShowForm(false);

  /* ─── Render ──────────────────────────────────────────────── */
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
          onPageChange={(page) => setCurrentPage(page)}
          showSearchBar
          showSearchInput
          onSearch={handleSearch}
          showDropdown
          dropdownOptions={[
            { value: "accountNumber", label: "رقم الحساب" },
            { value: "type", label: "النوع" },
          ]}
          onDropdownSelect={handleDropdownSelect}
          showAddButton
          onAddClick={() => setShowForm(true)}
        />
      )}

      {/* Error / Success modal */}
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
