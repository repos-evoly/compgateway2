"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { BeneficiariesApiResponse } from "./types";
import { getBeneficiaries, deleteBeneficiary } from "./services";
import { BeneficiaryResponse } from "./types";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Action } from "@/types";
import BeneficiaryForm from "./components/BeneficiaryForm";

const Page = () => {
  const t = useTranslations("beneficiaries");
  const router = useRouter();
  const locale = useLocale();

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
  const [showForm, setShowForm] = useState(false);

  // We'll create a function to fetch data
  const fetchBeneficiaries = useMemo(
    () => async () => {
      setLoading(true); // Set loading state
      try {
        console.log("Fetching beneficiaries...");
        const result = await getBeneficiaries(currentPage, limit, searchTerm);
        console.log("Beneficiaries result:", result);
        setData(result.data);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Error fetching beneficiaries:", err);
        const msg = err instanceof Error ? err.message : t("unknownError");
        setModalTitle(t("fetchErrorTitle")); // use your i18n keys
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false); // Reset loading state
      }
    },
    [currentPage, limit, searchTerm, t]
  );

  // On mount / whenever page or searchTerm changes => fetch data
  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  // Define actions for the data grid
  const actions: Action[] = [
    {
      name: "edit",
      tip: t("editBeneficiary", { defaultValue: "Edit Beneficiary" }),
      icon: <FaEdit />,
      onClick: (row) => {
        router.push(`/${locale}/beneficiaries/${row.id}`);
      },
    },
    {
      name: "delete",
      tip: t("deleteBeneficiary", { defaultValue: "Delete Beneficiary" }),
      icon: <FaTrash />,
      onClick: async (row) => {
        if (
          confirm(
            t("confirmDelete", {
              defaultValue: "Are you sure you want to delete this beneficiary?",
            })
          )
        ) {
          try {
            await deleteBeneficiary(Number(row.id));
            // Refresh the data after successful deletion
            fetchBeneficiaries();
            setModalTitle(t("deleteSuccessTitle", { defaultValue: "Success" }));
            setModalMessage(
              t("deleteSuccessMsg", {
                defaultValue: "Beneficiary deleted successfully",
              })
            );
            setModalSuccess(true);
            setModalOpen(true);
          } catch (err) {
            const msg = err instanceof Error ? err.message : t("unknownError");
            setModalTitle(t("deleteErrorTitle", { defaultValue: "Error" }));
            setModalMessage(msg);
            setModalSuccess(false);
            setModalOpen(true);
          }
        }
      },
    },
  ];

  // columns => minimal example
  const columns = [
    {
      key: "id",
      label: t("id"),
      renderCell: (row: BeneficiaryResponse) => (
        <div
          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          onDoubleClick={() => router.push(`/${locale}/beneficiaries/${row.id}`)}
          title={t("doubleClickToEdit", {
            defaultValue: "Double-click to edit",
          })}
        >
          {row.id}
        </div>
      ),
    },
    { key: "name", label: t("name") },
    {
      key: "type",
      label: t("type"),
      renderCell: (row: BeneficiaryResponse) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.type === "international" ? " text-black" : " text-black"
          }`}
        >
          {row.type === "international"
            ? t("international")
            : row.type === "Individual"
            ? t("local")
            : row.type || t("local")}
        </span>
      ),
    },
    { key: "accountNumber", label: t("accountNumber") },
    {
      key: "createdAt",
      label: t("createdAt"),
      renderCell: (row: BeneficiaryResponse) => (
        <span>{row.createdAt || "N/A"}</span>
      ),
    },
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
  const handleAddClick = () => setShowForm(true);

  const handleBeneficiaryCreated = () => {
    setShowForm(false);
    fetchBeneficiaries(); // Refresh the data
    setModalTitle(t("createSuccessTitle"));
    setModalMessage(t("createSuccessMsg"));
    setModalSuccess(true);
    setModalOpen(true);
  };

  const handleFormBack = () => {
    setShowForm(false);
    // Don't show any modal, just hide the form
  };

  return (
    <div className="p-4">
      {showForm ? (
        <BeneficiaryForm
          initialData={{}}
          onSuccess={handleBeneficiaryCreated}
          onBack={handleFormBack}
        />
      ) : (
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
          // Actions
          showActions
          actions={actions}
          loading={loading}
        />
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
