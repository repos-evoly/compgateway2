"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
// import FormTypeSelect from "./components/FormTypeSelect";
import InternalForm from "./components/InternalForm";
// import BetweenForm from "./components/BetweenForm";
import { TransfersApiResponse } from "./types";

// The new API function
import { getTransfers } from "./services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

const Page = () => {
  const t = useTranslations("internalTransferForm");

  // Table/pagination states
  const [data, setData] = useState<TransfersApiResponse["data"]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // or whichever page size
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Show/hide form
  const [showForm, setShowForm] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  // const [formType, setFormType] = useState("internal");

  // We'll create a function to fetch data
  const fetchTransfers = useCallback(async () => {
    setLoading(true); // Set loading state
    try {
      const result = await getTransfers(currentPage, limit, searchTerm);
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("unknownError");
      setModalTitle(t("fetchErrorTitle")); // use your i18n keys
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [currentPage, limit, searchTerm, t]);

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

    setModalTitle(t("createSuccessTitle"));
    setModalMessage(t("createSuccessMsg"));
    setModalSuccess(true);
    setModalOpen(true);
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
          loading={loading}
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

            {/* <FormTypeSelect
              selectedFormType={formType}
              onFormTypeChange={setFormType}
            /> */}
          </div>

          <div>
            <InternalForm
              initialData={selectedRowIndex !== null ? {} : {}}
              onSuccess={handleTransferCreated}
            />
          </div>
        </div>
      )}
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
};

export default Page;
