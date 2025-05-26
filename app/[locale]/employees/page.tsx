"use client";

import React, { useState } from "react";
// import { useRouter } from "next/navigation";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import type { Employee, EmployeesFormPayload } from "./types";
import EmployeeForm from "./components/EmployeesForm";

export default function EmployeesPage() {
  // const router = useRouter();

  // Dummy employees array
  const [employees] = useState<Employee[]>([
    {
      authUserId: 101,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 555-1234",
      roleId: 1,
    },
    {
      authUserId: 102,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+1 555-5678",
      roleId: 2,
    },
  ]);

  // Transform for CrudDataGrid
  const rowData = employees.map((emp) => ({
    // The grid requires a field named "id"
    id: emp.authUserId ?? 0, // fallback if undefined
    fullName: [emp.firstName, emp.lastName].filter(Boolean).join(" "),
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

  // State to show/hide the form
  const [showForm, setShowForm] = useState(false);

  // Hide grid and show blank form
  const handleAddClick = () => {
    setShowForm(true);
  };

  // If form is submitted, handle the new employee
  const handleFormSubmit = (values: EmployeesFormPayload) => {
    console.log("New Employee Submitted:", values);
    // TODO: Call your API or do any post-submission logic
    setShowForm(false);
  };

  // Double-click => navigate to [id] page
  // CrudDataGrid listens for doubleClick in your custom code or use the provided "onRowDoubleClick" if it exists.
  // For this example, we'll assume you do a rowDoubleClick => router.push...
  // const handleRowDoubleClick = (rowId: number) => {
  //   router.push(`/employees/${rowId}`);
  // };

  // If not showing form, we render the grid
  // If showing form, we hide the grid and display the form only
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
          showAddButton={true}
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
