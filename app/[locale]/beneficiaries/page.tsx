"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import type {
  BeneficiariesApiResponse,
  BeneficiaryPaymentRail,
  BeneficiaryResponse,
  BeneficiarySearchField,
} from "./types";
import { getBeneficiaries, deleteBeneficiary } from "./services";
import { FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import type { Action } from "@/types";
import BeneficiaryForm from "./components/BeneficiaryForm";
import {
  canApproveOnePayTransfer,
  canCreateOnePayTransfer,
} from "@/app/[locale]/transfers/onepay/permissions";

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
  const [searchBy, setSearchBy] =
    useState<BeneficiarySearchField>("name");
  const [railFilter, setRailFilter] =
    useState<BeneficiaryPaymentRail>("normal");
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [canManageProviderBeneficiaries, setCanManageProviderBeneficiaries] =
    useState(false);
  const [canViewProviderBeneficiaries, setCanViewProviderBeneficiaries] =
    useState(false);

  useEffect(() => {
    const canManage = canCreateOnePayTransfer();
    setCanManageProviderBeneficiaries(canManage);
    setCanViewProviderBeneficiaries(
      canManage || canApproveOnePayTransfer()
    );
  }, []);

  const canModifyCurrentRail =
    railFilter === "normal" || canManageProviderBeneficiaries;

  // We'll create a function to fetch data
  const fetchBeneficiaries = useMemo(
    () => async () => {
      setLoading(true); // Set loading state
      try {
        console.log("Fetching beneficiaries...");
        const result = await getBeneficiaries(
          currentPage,
          limit,
          searchTerm,
          searchBy,
          railFilter
        );
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
    [currentPage, limit, railFilter, searchBy, searchTerm, t]
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
          className={`p-1 rounded ${
            canModifyCurrentRail ? "cursor-pointer hover:bg-gray-100" : ""
          }`}
          onDoubleClick={() => {
            if (canModifyCurrentRail) {
              router.push(`/${locale}/beneficiaries/${row.id}`);
            }
          }}
          title={
            canModifyCurrentRail
              ? t("doubleClickToEdit", {
                  defaultValue: "Double-click to edit",
                })
              : undefined
          }
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
    {
      key: "paymentRail",
      label: t("paymentRail"),
      renderCell: (row: BeneficiaryResponse) => (
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
          {t(`rails.${row.paymentRail ?? "normal"}`)}
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
  const handleSearchFieldSelect = (val: string) => {
    if (val === "name" || val === "accountNumber" || val === "bank") {
      setSearchBy(val);
      setCurrentPage(1);
    }
  };

  const handleRailSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "normal" || value === "onePay" || value === "lyPay") {
      setRailFilter(value);
      setCurrentPage(1);
    }
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
          initialData={{ paymentRail: railFilter }}
          canManageProviderRails={canManageProviderBeneficiaries}
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
            { label: t("name"), value: "name" },
            { label: t("accountNumber"), value: "accountNumber" },
            { label: t("bankOrInstitution"), value: "bank" },
          ]}
          onDropdownSelect={handleSearchFieldSelect}
          haveChildrens
          childrens={
            <label className="flex h-10 items-center gap-2 rounded-md border border-white/40 bg-white/10 px-2 text-sm text-white">
              <span className="whitespace-nowrap font-medium">
                {t("paymentRail")}:
              </span>
              <span className="relative">
                <select
                  value={railFilter}
                  onChange={handleRailSelect}
                  aria-label={t("paymentRail")}
                  className="h-8 min-w-28 appearance-none border-0 bg-transparent px-2 pe-7 text-sm text-white outline-none focus:ring-0"
                >
                  <option className="bg-info-dark text-white" value="normal">
                    {t("rails.normal")}
                  </option>
                  {canViewProviderBeneficiaries && (
                    <option className="bg-info-dark text-white" value="onePay">
                      {t("rails.onePay")}
                    </option>
                  )}
                  {canViewProviderBeneficiaries && (
                    <option className="bg-info-dark text-white" value="lyPay">
                      {t("rails.lyPay")}
                    </option>
                  )}
                </select>
                <FaChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-white"
                />
              </span>
            </label>
          }
          // Add button
          showAddButton={canModifyCurrentRail}
          onAddClick={handleAddClick}
          // Actions
          showActions
          actions={canModifyCurrentRail ? actions : []}
          canEdit={canModifyCurrentRail}
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
