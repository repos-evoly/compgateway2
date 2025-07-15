// app/employees/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import EmployeeForm from "./components/EmployeesForm";
import { getEmployees, createEmployee } from "./services";
import type { EmployeesFormPayload, CompanyEmployee } from "./types";
import { FaLock } from "react-icons/fa";
import type { Action } from "@/types";
import { useRouter } from "next/navigation";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import { useTranslations } from "next-intl";

export default function EmployeesPage() {
  /* --------------------------------------------------
   * Local state
   * -------------------------------------------------- */
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const t = useTranslations("employees");
  const router = useRouter();

  /* --------------------------------------------------
   * Data helpers
   * -------------------------------------------------- */
  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setModalTitle("Fetch Error");
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* --------------------------------------------------
   * Datagrid config
   * -------------------------------------------------- */
  const rowData = employees.map((emp) => ({
    ...emp,
    permissions: emp.permissions.join(", "),
  }));

  const columns = [
    { key: "id", label: t("id") },
    { key: "firstName", label: t("firstName") },
    { key: "lastName", label: t("lastName") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "roleId", label: t("role") },
    { key: "permissions", label: t("permissions") },
    { 
      key: "isActive", 
      label: t("status"),
      renderCell: (row: CompanyEmployee) => {
        // Default to true if isActive is not present
        const isActive = row.isActive !== undefined ? row.isActive : true;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? t("active") : t("inactive")}
          </span>
        );
      }
    },
  ];

  const actions: Action[] = [
    {
      name: "permissions",
      tip: t("editPermissions"),
      icon: <FaLock />,
      onClick: (row) => {
        router.push(`/employees/permissions/${row.id}/${row.roleId}`);
      },
    },
  ];

  /* --------------------------------------------------
   * Handlers
   * -------------------------------------------------- */
  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (values: EmployeesFormPayload) => {
    try {
      const newEmployee = await createEmployee({
        username: values.username || "",
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        password: values.password || "",
        phone: values.phone || "",
        roleId: values.roleId || 0,
      });

      /* Update grid instantly */
      setEmployees((prev) => [...prev, newEmployee]);

      /* Success modal */
      setModalTitle("Employee Created");
      setModalMessage("The employee was created successfully.");
      setModalSuccess(true);
      setModalOpen(true);

      /* Return to grid */
      setShowForm(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setModalTitle("Creation Error");
      setModalMessage(errorMsg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => setModalOpen(false);
  const handleModalConfirm = () => setModalOpen(false);

  /* --------------------------------------------------
   * JSX
   * -------------------------------------------------- */
  return (
    <div className="p-4 space-y-8">
      {!showForm && (
        <CrudDataGrid
          data={rowData}
          columns={columns}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showSearchBar={false}
          showSearchInput={false}
          showDropdown={false}
          showAddButton
          onAddClick={handleAddClick}
          showActions
          actions={actions}
          loading={loading}
        />
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmployeeForm
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
