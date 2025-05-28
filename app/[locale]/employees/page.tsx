"use client";

import React, { useState, useEffect } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import type {  EmployeesFormPayload } from "./types";
import EmployeeForm from "./components/EmployeesForm";

// Our service
import { getEmployees, createEmployee } from "./services";
import type { CompanyEmployee } from "./types";

/**
 * The main listing page for employees => now fetches from the API.
 */
export default function EmployeesPage() {
  // Real employees from API
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // On mount => fetch employees
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

  // Transform for CrudDataGrid
  const rowData = employees.map((emp) => ({
    id: emp.id, // or emp.authUserId, but your API returns 'id'
    fullName: `${emp.firstName} ${emp.lastName}`,
    email: emp.email ?? "",
    phone: emp.phone ?? "",
    role: emp.roleId ? `Role #${emp.roleId}` : "No role",
  }));

  // Columns
  const columns = [
    { key: "id", label: "ID" },
    { key: "fullName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
  ];

  // For "Add" => show blank form => after submit => createEmployee => re-fetch
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
      // Optionally re-fetch the entire list or push to local state
      setEmployees((prev) => [...prev, newEmployee]);
    } catch (err) {
      console.error("Failed to create employee:", err);
    } finally {
      setShowForm(false);
    }
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
    </div>
  );
}
