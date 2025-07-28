"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { BeneficiariesApiResponse } from "./types";
import { getBeneficiaries } from "./services";
import { BeneficiaryResponse } from "./types";

const Page = () => {
  const t = useTranslations("beneficiaries");
  const router = useRouter();

  // Table/pagination states
  const [data, setData] = useState<BeneficiariesApiResponse["data"]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // or whichever page size
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // We'll create a function to fetch data
  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true); // Set loading state
    try {
      const result = await getBeneficiaries(currentPage, limit, searchTerm);
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
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  // columns => minimal example
  const columns = [
    { key: "id", label: t("id") },
    { key: "name", label: t("name") },
    {
      key: "type",
      label: t("type"),
      renderCell: (row: BeneficiaryResponse) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.type === "international"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.type === "international" ? t("international") : t("local")}
        </span>
      ),
    },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "createdAt", label: t("createdAt") },
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
    // pushes to /beneficiaries/add (locale prefix is preserved automatically)
    router.push("/beneficiaries/add");
  };

  return (
    <div className="p-1">
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
        dropdownOptions={[
          { label: "Name", value: "name" },
          { label: "Account Number", value: "accountNumber" },
          { label: "Type", value: "type" },
          { label: "Bank", value: "bank" },
          { label: "Country", value: "country" },
        ]}
        onDropdownSelect={handleDropdownSelect}
        // Add button
        showAddButton
        onAddClick={handleAddClick}
        loading={loading}
      />

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
