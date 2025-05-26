// app/visarequests/page.tsx (or wherever your list page is)

"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { getVisaRequests, createVisaRequest } from "./services";
import VisaWizardForm from "./components/VisaRequest";

import type { VisaRequestApiItem, VisaRequestFormValues } from "./types";

export default function VisaRequestListPage() {
  const t = useTranslations("visaRequest");

  // Store the fetched API items
  const [apiData, setApiData] = useState<VisaRequestApiItem[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10;

  // Search
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Toggle form
  const [showForm, setShowForm] = useState<boolean>(false);

  // Fetch data on mount / whenever page or search changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // 1) Fetch from API
  async function fetchData() {
    try {
      const response = await getVisaRequests(currentPage, limit, searchTerm);
      setApiData(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch visa requests:", error);
    }
  }

  // 2) Handle "Add" => open wizard
  function handleAddClick() {
    setShowForm(true);
  }

  // 3) Wizard form submit => create item, re-fetch, close wizard
  async function handleFormSubmit(values: VisaRequestFormValues) {
    try {
      await createVisaRequest(values);
      await fetchData();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create visa request:", err);
    }
  }

  // 4) Prepare data for CrudDataGrid => convert any undefined to null
  const gridData = apiData.map((item) => ({
    id: item.id, // the grid needs an "id"
    branch: item.branch ?? null,
    date: item.date ?? null,
    accountHolderName: item.accountHolderName ?? null,
  }));

  // 5) Define columns
  const columns = [
    { key: "branch", label: t("branch") },
    { key: "date", label: t("date") },
    { key: "accountHolderName", label: t("accountHolderName") },
  ];

  // 6) Render
  return (
    <div className="p-4">
      {showForm ? (
        // Show wizard form
        <VisaWizardForm onSubmit={handleFormSubmit} />
      ) : (
        // Show data grid
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
        />
      )}
    </div>
  );
}
