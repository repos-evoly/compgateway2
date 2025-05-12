"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CheckbookForm, { TCheckbookValues } from "./components/CheckbookForm";

const CheckbookPage: React.FC = () => {


  // 1) Dummy checkbook data (local)
  const [data, setData] = useState<TCheckbookValues[]>([
    {
      fullName: "John Doe",
      address: "123 Elm Street",
      accountNumber: "ACC-1001",
      pleaseSend: "Home",
      branch: "Central",
      date: new Date(2023, 7, 1),
      bookContaining: "24",
    },
    {
      fullName: "Jane Smith",
      address: "456 Oak Avenue",
      accountNumber: "ACC-2002",
      pleaseSend: "Office",
      branch: "Downtown",
      date: new Date(2023, 6, 15),
      bookContaining: "48",
    },
  ]);

  // For pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 1;

  // Toggle local Add form
  const [showForm, setShowForm] = useState<boolean>(false);

  // If we wanted local editing in the same page
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Columns for the grid
  const columns = [
    { key: "fullName", label: "Name" },
    { key: "address", label: "Address" },
    { key: "accountNumber", label: "Account Number" },
    { key: "branch", label: "Branch" },
    { key: "date", label: "Date" },
    { key: "pleaseSend", label: "Send To" },
  ];

  // Transform data for the grid
  const rowData = data.map((item) => ({
    fullName: item.fullName,
    address: item.address,
    accountNumber: item.accountNumber,
    branch: item.branch,
    date: item.date.toLocaleDateString("en-GB"),
    pleaseSend: item.pleaseSend,
  }));

  const handleAddClick = () => {
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleFormSubmit = (values: TCheckbookValues) => {
    if (editingIndex !== null) {
      // local in-page editing
      setData((prev) => {
        const updated = [...prev];
        updated[editingIndex] = values;
        return updated;
      });
    } else {
      // Add new
      setData((prev) => [...prev, values]);
    }
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Checkbook List</h1>

      {showForm ? (
        <CheckbookForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingIndex !== null ? data[editingIndex] : undefined}
        />
      ) : (
        <CrudDataGrid
          data={rowData}
          columns={columns}
          showAddButton
          onAddClick={handleAddClick}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default CheckbookPage;
