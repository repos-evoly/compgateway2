"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import FormTypeSelect from "./components/FormTypeSelect";
import InternalForm from "./components/InternalForm";
import BetweenForm from "./components/BetweenForm";
import { TransfersApiResponse } from "./types";

// The new API function
import { getTransfers } from "./services";

const Page = () => {
  const t = useTranslations("internalTransferForm");

  // Table/pagination states
  const [data, setData] = useState<TransfersApiResponse["data"]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // or whichever page size
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Show/hide form
  const [showForm, setShowForm] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [formType, setFormType] = useState("internal");

  // We'll create a function to fetch data
  const fetchTransfers = useCallback(async () => {
    try {
      const result = await getTransfers(currentPage, limit, searchTerm);
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Failed to fetch transfers:", err);
    }
  }, [currentPage, limit, searchTerm]);

  // On mount / whenever page or searchTerm changes => fetch data
  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // columns => minimal example
  const columns = [
    { key: "id", label: t("id") },
    { key: "categoryName", label: t("category") },
    { key: "fromAccount", label: t("from") },
    { key: "toAccount", label: t("to") },
    { key: "amount", label: t("amount") },
    { key: "status", label: t("status") },
    { key: "requestedAt", label: t("requestedAt") },
  ];

  // Searching & dropdown
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };
  const handleDropdownSelect = (val: string) => {
    console.log("Dropdown:", val);
  };

  // Show/hide form
  const handleAddClick = () => {
    setSelectedRowIndex(null);
    setShowForm(true);
  };
  const handleFormClose = () => {
    setShowForm(false);
  };

  // Called after the transfer is successfully created in InternalForm
  const handleTransferCreated = () => {
    // Hide form
    setShowForm(false);
    // Re-fetch data
    fetchTransfers();
  };

  return (
    <div className="p-1">
      {!showForm ? (
        <CrudDataGrid
          data={data}
          columns={columns}
          // pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          // Searching
          showSearchBar
          showSearchInput
          onSearch={handleSearch}
          // Example dropdown
          showDropdown
          dropdownOptions={[{ label: "Category", value: "categoryName" }]}
          onDropdownSelect={handleDropdownSelect}
          // Add button
          showAddButton
          onAddClick={handleAddClick}
        />
      ) : (
        <div className="bg-white rounded">
          <div className="w-full bg-info-dark p-4 rounded-md rounded-b-none flex items-center gap-8">
            <button
              onClick={handleFormClose}
              className="text-white border px-4 py-2 rounded-md hover:bg-warning-light hover:text-info-dark hover:border-transparent transition duration-300"
            >
              {t("back")}
            </button>

            <FormTypeSelect
              selectedFormType={formType}
              onFormTypeChange={setFormType}
            />
          </div>

          <div>
            {formType === "internal" ? (
              <InternalForm
                initialData={selectedRowIndex !== null ? {} : {}}
                onSuccess={handleTransferCreated}
              />
            ) : (
              <BetweenForm />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
