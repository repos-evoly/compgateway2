"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckRequestForm from "./components/CheckRequestForm";

// We import the *API* type for our local state
import { TCheckRequestValues } from "./types";
import { getCheckRequests, createCheckRequest } from "./services";

// The *form* type
import { TCheckRequestFormValues } from "./types";

const CheckRequestPage: React.FC = () => {
  const t = useTranslations("CheckRequest");

  // Data for the table
  const [data, setData] = useState<TCheckRequestValues[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  // Toggle for "Add" form
  const [showForm, setShowForm] = useState(false);

  // Fetch on mount / page change / search change
  useEffect(() => {
    const fetchData = async () => {
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
      }
    };

    fetchData();
  }, [currentPage, limit, searchTerm, searchBy]);

  // Columns
  const columns = [
    { key: "branch", label: t("branch") },
    { key: "branchNum", label: t("branchNum") },
    { key: "date", label: t("date") },
    { key: "customerName", label: t("customerName") },
    { key: "cardNum", label: t("cardNum") },
    { key: "accountNum", label: t("accountNum") },
    { key: "beneficiary", label: t("beneficiary") },
  ];

  // "Add" => show form
  const handleAddClick = () => {
    setShowForm(true);
  };

  // Form submit => create new check request
  const handleFormSubmit = async (formVals: TCheckRequestFormValues) => {
    try {
      // Convert Date -> ISO string
      const isoDate = formVals.date.toISOString();

      // Prepare body for the API
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

      // POST create
      const newItem = await createCheckRequest(payload);
      // Optionally, add to local data (so we don't re-fetch)
      setData((prev) => [newItem, ...prev]);

      setShowForm(false);
    } catch (error) {
      console.error("Failed to create check request:", error);
      alert("Error creating check request. See console for details.");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Searching
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  const handleDropdownSelect = (field: string) => {
    setSearchBy(field);
    setCurrentPage(1);
  };

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
        />
      )}
    </div>
  );
};

export default CheckRequestPage;
