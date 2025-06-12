// app/employees/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import type { EmployeesFormPayload } from "./types";
import EmployeeForm from "./components/EmployeesForm";
import { getEmployees, createEmployee } from "./services";
import type { CompanyEmployee } from "./types";
import { FaLock } from "react-icons/fa";
import type { Action } from "@/types";
import { useRouter } from "next/navigation";

// Import the modal
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return <div className="p-4">Loading employees...</div>;
  }

  // Convert permissions[] => comma-separated string for display
  const rowData = employees.map((emp) => ({
    ...emp,
    permissions: emp.permissions.join(", "),
  }));

  console.log("Employees Data =>", rowData);

  const columns = [
    { key: "id", label: "ID" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "roleId", label: "Role ID" },
    { key: "permissions", label: "Permissions" },
  ];

  const actions: Action[] = [
    {
      name: "permissions",
      tip: "Edit Permissions",
      icon: <FaLock />,
      onClick: (row) => {
        // push to dynamic route => /employees/permissions/[id]/[roleId]
        router.push(`/employees/permissions/${row.id}/${row.roleId}`);
      },
    },
  ];

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
      console.log("New Employee Submitted =>", newEmployee);

      // Show success modal
      setModalTitle("Employee Created");
      setModalMessage("The employee was created successfully.");
      setModalSuccess(true);
      setModalOpen(true);
    } catch (err) {
      // Show error modal; do NOT hide the form or reset it
      console.error("Failed to create employee:", err);

      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred.";

      setModalTitle("Creation Error");
      setModalMessage(errorMsg);
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalConfirm = () => {
    if (modalSuccess) {
      // If success => refresh page and hide form
      router.refresh();
      setShowForm(false);
    }
    setModalOpen(false);
  };

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

      {/* Render the modal */}
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
