"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CBLForm from "./components/CBLForm";
import { getCblRequests } from "./service";
import { TCBLValues } from "./types";

/**
 * The main listing page for CBLs, including:
 * - Pagination
 * - Search input
 * - Dropdown to select "search by" field
 * - "Add" button that toggles the form
 */
const CBLListPage: React.FC = () => {
  const t = useTranslations("cblForm");

  // -----------------------------------------
  // 1) Local state for data, pagination, etc.
  // -----------------------------------------
  const [data, setData] = useState<TCBLValues[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // or any desired page size

  // Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchBy, setSearchBy] = useState<string>("partyName"); // default or "status"

  // Add form toggle
  const [showForm, setShowForm] = useState(false);

  // -----------------------------------------
  // 2) Fetch data whenever page/search changes
  // -----------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCblRequests(
          currentPage,
          limit,
          searchTerm,
          searchBy
        );
        // { data, page, limit, totalPages, totalRecords }
        setData(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to fetch CBL requests:", error);
      }
    };

    fetchData();
  }, [currentPage, limit, searchTerm, searchBy]);

  // -----------------------------------------
  // 3) Handle "Add" form submit
  // -----------------------------------------
  const handleFormSubmit = (values: TCBLValues) => {
    console.log("CBLForm submitted with:", values);
    // Normally you'd do an API call to create a new record, then refetch.
    // For now, we just add it locally:
    const newId = Math.random();
    const newEntry = { ...values, id: newId };
    setData((prev) => [newEntry, ...prev]);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleAddClick = () => {
    setShowForm(true);
  };

  // -----------------------------------------
  // 4) Grid columns
  // -----------------------------------------
  const columns = [
    { key: "partyName", label: t("partyName") },
    { key: "legalRepresentative", label: t("legalRepresentative") },
    { key: "mobile", label: t("mobile") },
    { key: "address", label: t("address") },
  ];

  // Data to pass to the grid
  const fullDataForGrid = data.map((item) => ({
    ...item,
    partyName: item.partyName,
    legalRepresentative: item.legalRepresentative,
    mobile: item.mobile,
    address: item.address,
  }));

  // -----------------------------------------
  // 5) Dropdown options for "search by"
  // -----------------------------------------
  const dropdownOptions = [
    { value: "partyName", label: t("partyName") },
    { value: "status", label: t("status") },
  ];

  // -----------------------------------------
  // 6) Render
  // -----------------------------------------
  return (
    <div className="p-4">
      {showForm ? (
        <CBLForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      ) : (
        <CrudDataGrid
          data={fullDataForGrid}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          // Pass props for search & dropdown
          showSearchInput
          showDropdown
          showSearchBar
          dropdownOptions={dropdownOptions}
          onDropdownSelect={(selected) => {
            setSearchBy(selected);
            setCurrentPage(1);
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          // Show add button => local "Add"
          showAddButton
          onAddClick={handleAddClick}
        />
      )}
    </div>
  );
};

export default CBLListPage;
