"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import ForeignTransfersForm, {
  ForeignTransfersFormValues,
} from "./components/ForeignTransfersForm";

import { getForeignTransfers, createForeignTransfer } from "./services";

export default function ForeignTransfersListPage() {
  const t = useTranslations("foreignTransfers");

  // We'll store the full array of foreign transfers
  const [data, setData] = useState<ForeignTransfersFormValues[]>([]);

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");

  // Toggle form
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Each page => limit=10
  const limit = 10;

  // On mount or whenever page/search changes => fetch from API
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, searchBy]);

  async function fetchData() {
    try {
      const response = await getForeignTransfers(
        currentPage,
        limit,
        searchTerm,
        searchBy
      );
      // Transform the API data => array of ForeignTransfersFormValues
      const mapped: ForeignTransfersFormValues[] = response.data.map(
        (item) => ({
          id: item.id,
          toBank: item.toBank,
          branch: item.branch,
          residentSupplierName: item.residentSupplierName,
          residentSupplierNationality: item.residentSupplierNationality,
          nonResidentPassportNumber: Number(item.nonResidentPassportNumber),
          placeOfIssue: item.placeOfIssue,
          dateOfIssue: item.dateOfIssue,
          nonResidentNationality: item.nonResidentNationality,
          nonResidentAddress: item.nonResidentAddress,
          transferAmount: item.transferAmount,
          toCountry: item.toCountry,
          beneficiaryName: item.beneficiaryName,
          beneficiaryAddress: item.beneficiaryAddress,
          externalBankName: item.externalBankName,
          externalBankAddress: item.externalBankAddress,
          transferToAccountNumber: Number(item.transferToAccountNumber),
          transferToAddress: item.transferToAddress,
          accountHolderName: item.accountHolderName,
          permanentAddress: item.permanentAddress,
          purposeOfTransfer: item.purposeOfTransfer,
        })
      );

      setData(mapped);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch foreign transfers:", err);
      const msg = err instanceof Error ? err.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  }

  function handleAddClick() {
    setShowForm(true);
  }

  /**
   * When form is submitted, call createForeignTransfer, then re-fetch the data.
   */
  async function handleFormSubmit(values: ForeignTransfersFormValues) {
    try {
      // Convert needed fields to string if your API requires them:
      await createForeignTransfer({
        toBank: values.toBank,
        branch: values.branch,
        residentSupplierName: values.residentSupplierName,
        residentSupplierNationality: values.residentSupplierNationality,
        nonResidentPassportNumber: values.nonResidentPassportNumber.toString(),
        placeOfIssue: values.placeOfIssue,
        dateOfIssue: values.dateOfIssue,
        nonResidentNationality: values.nonResidentNationality,
        nonResidentAddress: values.nonResidentAddress,
        transferAmount: values.transferAmount,
        toCountry: values.toCountry,
        beneficiaryName: values.beneficiaryName,
        beneficiaryAddress: values.beneficiaryAddress,
        externalBankName: values.externalBankName,
        externalBankAddress: values.externalBankAddress,
        transferToAccountNumber: values.transferToAccountNumber.toString(),
        transferToAddress: values.transferToAddress,
        accountHolderName: values.accountHolderName,
        permanentAddress: values.permanentAddress,
        purposeOfTransfer: values.purposeOfTransfer,
      });

      // After successful creation, re-fetch data so new entry is shown
      await fetchData();

      // Hide the form => back to listing
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create foreign transfer:", error);
      const msg = error instanceof Error ? error.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  }

  // We'll create a smaller "gridData" with just a few columns displayed
  const gridData = data.map((item) => ({
    id: item.id,
    toBank: item.toBank ?? "",
    branch: item.branch ?? "",
    transferAmount: item.transferAmount ?? 0,
  }));

  // The columns we want to show
  const columns = [
    { key: "branch", label: t("branch") },
    { key: "toBank", label: t("toBank") },
    { key: "transferAmount", label: t("transferAmount") },
  ];

  return (
    <div className="p-4">
      {showForm ? (
        <ForeignTransfersForm onSubmit={handleFormSubmit} />
      ) : (
        <CrudDataGrid
          data={gridData}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          // Searching props
          showSearchBar
          showSearchInput
          showDropdown
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          onDropdownSelect={(val) => {
            setSearchBy(val);
            setCurrentPage(1);
          }}
          dropdownOptions={[
            { value: "branch", label: t("branch") },
            { value: "toBank", label: t("toBank") },
          ]}
          // Show "Add" button => open form wizard
          showAddButton
          onAddClick={handleAddClick}
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
}
