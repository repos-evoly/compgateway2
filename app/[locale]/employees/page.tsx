"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { EmployeesApiResponse } from "./types";
import { getEmployees, deleteEmployee } from "./services";
import { EmployeeResponse } from "./types";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Action } from "@/types";
import EmployeeForm from "./components/EmployeesForm";

const Page = () => {
  const t = useTranslations("employees");
  const router = useRouter();

  // Table/pagination states
  const [data, setData] = useState<EmployeesApiResponse["data"]>([]);
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
  const fetchEmployees = useMemo(
    () => async () => {
      setLoading(true); // Set loading state
      try {
        console.log("Fetching employees...");
        console.log("Current page:", currentPage);
        console.log("Limit:", limit);
        console.log("Search term:", searchTerm);
        const result = await getEmployees(currentPage, limit, searchTerm);
        console.log("Employees result:", result);
        console.log("Employees data:", result.data);
        console.log("Total pages:", result.totalPages);
        setData(result.data);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Error fetching employees:", err);
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
    fetchEmployees();
  }, [fetchEmployees]);

  // Define actions for the data grid
  const actions: Action[] = [
    {
      name: "edit",
      tip: t("editEmployee", { defaultValue: "Edit Employee" }),
      icon: <FaEdit />,
      onClick: (row) => {
        router.push(`/employees/${row.id}`);
      },
    },
    {
      name: "delete",
      tip: t("deleteEmployee", { defaultValue: "Delete Employee" }),
      icon: <FaTrash />,
      onClick: async (row) => {
        if (
          confirm(
            t("confirmDelete", {
              defaultValue: "Are you sure you want to delete this employee?",
            })
          )
        ) {
          try {
            await deleteEmployee(Number(row.id));
            // Refresh the data after successful deletion
            fetchEmployees();
            setModalTitle(t("deleteSuccessTitle", { defaultValue: "Success" }));
            setModalMessage(
              t("deleteSuccessMsg", {
                defaultValue: "Employee deleted successfully",
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
      renderCell: (row: EmployeeResponse) => (
        <div
          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          onDoubleClick={() => router.push(`/employees/${row.id}`)}
          title={t("doubleClickToEdit", {
            defaultValue: "Double-click to edit",
          })}
        >
          {row.id}
        </div>
      ),
    },
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    {
      key: "salary",
      label: t("salary"),
      renderCell: (row: EmployeeResponse) => (
        <span>{row.salary?.toLocaleString() || "0"}</span>
      ),
    },
    {
      key: "date",
      label: t("date"),
      renderCell: (row: EmployeeResponse) => (
        <span>
          {row.date ? new Date(row.date).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType") },
    {
      key: "sendSalary",
      label: t("sendSalary"),
      renderCell: (row: EmployeeResponse) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.sendSalary
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.sendSalary ? t("yes") : t("no")}
        </span>
      ),
    },
    {
      key: "canPost",
      label: t("canPost"),
      renderCell: (row: EmployeeResponse) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.canPost
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.canPost ? t("yes") : t("no")}
        </span>
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

  const handleEmployeeCreated = () => {
    setShowForm(false);
    fetchEmployees(); // Refresh the data
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
        <EmployeeForm
          initialData={{}}
          onSuccess={handleEmployeeCreated}
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
            { label: "Email", value: "email" },
            { label: "Phone", value: "phone" },
            { label: "Account Number", value: "accountNumber" },
            { label: "Account Type", value: "accountType" },
          ]}
          onDropdownSelect={handleDropdownSelect}
          // Add button
          showAddButton
          onAddClick={handleAddClick}
          // Actions
          showActions
          actions={actions}
          // Enable double-click on ID
          canEdit={false}
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
