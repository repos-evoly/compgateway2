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

export default function CreditFacilityPage() {

  // Table data states
  const [data, setData] = useState<CreditFacilityApiItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  // Show/hide "Add" form
  const [showForm, setShowForm] = useState(false);

  /** Fetch data from server with (page, limit, searchTerm, searchBy)
   * But only apply 'searchBy' if there's a non-empty searchTerm. */
  async function fetchData() {
    try {
      // If the user hasn't typed any searchTerm, don't pass searchBy
      const actualSearchBy = searchTerm ? searchBy : "";
      const actualSearchTerm = searchTerm ? searchTerm : "";

      const result: CreditFacilitiesApiResponse = await getCreditFacilities(
        currentPage,
        limit,
        actualSearchTerm,
        actualSearchBy
      );
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch credit facilities:", error);
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
    // If user typed something => store it. If empty => also clear searchBy
    setSearchTerm(term);
    if (!term) {
      setSearchBy("");
    }
    setCurrentPage(1);
  };

  const handleDropdownSelect = (val: string) => {
    // Only set searchBy if there's already a searchTerm typed
    if (searchTerm) {
      setSearchBy(val);
      setCurrentPage(1);
    } else {
      // If no searchTerm, ignore the dropdown or reset it
      setSearchBy("");
    }
  };

  // Add form => actually posts to server
  const handleFormSubmit = async (newItem: TCreditFacility) => {
    try {
      const { id, ...body } = newItem; // exclude "id"
      console.log("Submitting new credit facility:", id);
      await addCreditFacility(body);
      // After success => re-fetch
      fetchData();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create credit facility:", error);
      alert("حدث خطأ أثناء إنشاء التسهيل الائتماني");
    }
  };

  const handleFormCancel = () => setShowForm(false);

  // Double-click => detail page
  // const handleRowDoubleClick = (rowIndex: number) => {
  //   const item = data[rowIndex];
  //   if (item && item.id) {
  //     router.push(`/creditfacility/${item.id}`);
  //   }
  // };

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
    </div>
  );
}
