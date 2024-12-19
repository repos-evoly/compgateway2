"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

const ExamplePage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{
    [key: string]: string | number;
  } | null>(null);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
  ];

  const data = [
    { id: 1, name: "John Doe", email: "john.doe@example.com" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com" },
  ];

  const handleModalOpen = (
    rowIndex: number,
    row: { [key: string]: string | number }
  ) => {
    setSelectedRow(row); // Store the selected row data
    setIsModalVisible(true); // Show the modal
  };

  const handleModalClose = () => {
    setIsModalVisible(false); // Hide the modal
    setSelectedRow(null); // Clear the selected row
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <h1 className="text-2xl font-semibold mb-6">Crud Data Grid Example</h1>

      {/* Render Data Grid */}
      <CrudDataGrid
        columns={columns}
        data={data}
        showActions={false}
        isModal
        modalComponent={
          isModalVisible && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                <h2 className="text-xl font-semibold mb-4">Row Details</h2>
                {selectedRow && (
                  <div>
                    <p>
                      <strong>ID:</strong> {selectedRow.id}
                    </p>
                    <p>
                      <strong>Name:</strong> {selectedRow.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedRow.email}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleModalClose}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )
        }
        onModalOpen={handleModalOpen}
      />
    </div>
  );
};

export default ExamplePage;
