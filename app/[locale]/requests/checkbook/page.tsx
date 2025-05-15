"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckbookForm from "./components/CheckbookForm";
import { getCheckbookRequests } from "./services";
import type { TCheckbookFormValues } from "./types";

/**
 * Demonstration of listing checkbook requests with pagination & search.
 */
const CheckbookPage: React.FC = () => {
  const t = useTranslations("checkForm");

  // Local state for table data
  const [data, setData] = useState<TCheckbookFormValues[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  // Toggle Add form
  const [showForm, setShowForm] = useState(false);

  // Fetch data whenever page or search changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCheckbookRequests(
          currentPage,
          limit,
          searchTerm,
          searchBy
        );
        // result => { data, totalPages, etc. }
        setData(result.data);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Failed to fetch checkbooks:", error);
      }
    };

    fetchData();
  }, [currentPage, limit, searchTerm, searchBy]);

  // Table columns
  const columns = [
    { key: "fullName", label: t("name") },
    { key: "address", label: t("address") },
    { key: "accountNumber", label: t("accNum") },
    { key: "branch", label: t("branch") },
    { key: "date", label: t("date") },
    { key: "pleaseSend", label: t("sendTo") },
  ];

  // Data for the grid
  const rowData = data.map((item) => ({
    ...item,
    date: item.date,
  }));

  // "Add" button => open form
  const handleAddClick = () => {
    setShowForm(true);
  };

  // Form submit => add new item locally
  const handleFormSubmit = (newItem: TCheckbookFormValues) => {
    setData((prev) => [newItem, ...prev]);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="p-4">
      {showForm ? (
        <CheckbookForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <CrudDataGrid
          data={rowData}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showSearchInput
          showDropdown
          showSearchBar
          dropdownOptions={[
            { value: "fullName", label: t("name") },
            { value: "status", label: t("status") },
          ]}
          onDropdownSelect={(selected) => {
            if (selected) {
              setSearchBy(String(selected));
              setCurrentPage(1);
            }
          }}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          showAddButton
          onAddClick={handleAddClick}
        />
      )}
    </div>
  );
};

export default CheckbookPage;
