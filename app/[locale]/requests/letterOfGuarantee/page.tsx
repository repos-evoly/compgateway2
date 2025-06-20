"use client";

import React, { useEffect, useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import LetterOfGuaranteeForm from "./components/LetterOfGuaranteeForm";
import type {
  LetterOfGuaranteeApiItem,
  LetterOfGuaranteeApiResponse,
  TLetterOfGuarantee,
} from "./types";
import { getLetterOfGuarantees, addLetterOfGuarantee } from "./services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function LetterOfGuaranteePage() {
  // Table data states
  const [data, setData] = useState<LetterOfGuaranteeApiItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  // Show/hide "Add" form
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMsg, setModalMsg] = useState("");
  const [modalOk, setModalOk] = useState(false); // success ↔︎ error

  /**
   * Fetch data from server with (page, limit, searchTerm, searchBy).
   * But only apply 'searchBy' if there's a non-empty searchTerm.
   */
  async function fetchData() {
    try {
      // If user hasn't typed any searchTerm, ignore searchBy
      const actualSearchBy = searchTerm ? searchBy : "";
      const actualSearchTerm = searchTerm ? searchTerm : "";

      const result: LetterOfGuaranteeApiResponse = await getLetterOfGuarantees(
        currentPage,
        limit,
        actualSearchTerm,
        actualSearchBy
      );
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch letterOfGuarantee:", error);
      setModalTitle("خطأ في الجلب");
      setModalMsg(
        error instanceof Error ? error.message : "تعذر تحميل البيانات."
      );
      setModalOk(false);
      setModalOpen(true);
    }
  }

  // On mount / whenever page or search changes => fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, searchTerm, searchBy]);

  // Table columns
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

  // Searching handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSearchBy("");
    }
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

  // Add form => actually posts to server with type="letterOfGuarantee"
  const handleFormSubmit = async (newItem: TLetterOfGuarantee) => {
    try {
      const { id, ...body } = newItem; // exclude "id"
      console.log("Submitting new letterOfGuarantee:", id);
      await addLetterOfGuarantee(body);
      setModalTitle("تم الحفظ");
      setModalMsg("تم إنشاء خطاب الضمان بنجاح.");
      setModalOk(true);
      setModalOpen(true);

      // After success => re-fetch
      fetchData();
      setShowForm(false);
    } catch (error) {
      setModalTitle("خطأ أثناء الإرسال");
      setModalMsg(
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الخطاب."
      );
      setModalOk(false);
      setModalOpen(true);
    }
  };

  const handleFormCancel = () => setShowForm(false);

  // Double-click => detail page
  // const handleRowDoubleClick = (rowIndex: number) => {
  //   const item = data[rowIndex];
  //   if (item && item.id) {
  //     router.push(`/letterofguarantee/${item.id}`);
  //   }
  // };

  return (
    <div className="p-4">
      {showForm ? (
        <LetterOfGuaranteeForm
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
          // Searching
          showSearchBar
          showSearchInput
          onSearch={handleSearch}
          showDropdown
          dropdownOptions={[
            { value: "accountNumber", label: "رقم الحساب" },
            { value: "type", label: "النوع" },
          ]}
          onDropdownSelect={handleDropdownSelect}
          // Add button
          showAddButton
          onAddClick={() => setShowForm(true)}
        />
      )}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalOk}
        title={modalTitle}
        message={modalMsg}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          if (modalOk) fetchData(); // refresh after successful create
        }}
      />
    </div>
  );
}
