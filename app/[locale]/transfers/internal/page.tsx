"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { dataEn, dataAr, columnsEn, columnsAr, dropdownOptions } from "./data";
import InternalForm from "./InternalForm";
import BetweenForm from "./BetweenForm"; // New BetweenForm component
import { useTranslations, useLocale } from "next-intl";
import FormTypeSelect from "./FormTypeSelect";
import { InternalFormValues } from "./InternalForm"; // Import the type


const Page = () => {
  const locale = useLocale();
  const [showForm, setShowForm] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null); // Track selected row index
  const [formType, setFormType] = useState("internal"); // Track the selected form type

  const data = locale === "ar" ? dataAr : dataEn;
  const columns = locale === "ar" ? columnsAr : columnsEn;

  const handleSearch = (value: string) => console.log("Search:", value);
  const handleDropdownSelect = (value: string) =>
    console.log("Dropdown Selected:", value);

  const handleAddClick = () => {
    setSelectedRowIndex(null); // Reset the selected row index for adding a new form
    setShowForm(true);
  };

  const handleRowClick = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex); // Set the clicked row index
    setShowForm(true); // Show the form
  };

  const handleFormClose = () => setShowForm(false);

  const t = useTranslations("internalTransferForm");

  const handleFormSubmit = (formValues: InternalFormValues) => {
    const submittedData = {
      ...formValues,
      formType, // Add the selected form type to the submitted data
    };
    console.log("Submitted Data:", submittedData);
  };

  return (
    <div className="p-4">
      {!showForm ? (
        <CrudDataGrid
          data={data}
          columns={columns}
          showSearchBar={true}
          onSearch={handleSearch}
          onDropdownSelect={handleDropdownSelect}
          dropdownOptions={dropdownOptions}
          showAddButton={true}
          onAddClick={handleAddClick}
          isComponent={true}
          componentToRender={
            selectedRowIndex !== null ? (
              <InternalForm
                initialData={data[selectedRowIndex]}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <InternalForm onSubmit={handleFormSubmit} />
            )
          }
          onComponentRender={(rowIndex) => handleRowClick(rowIndex)} // Handle row clicks
        />
      ) : (
        <div className="bg-white p-6 rounded">
          <div className="flex justify-center mb-6">
            <FormTypeSelect
              selectedFormType={formType}
              onFormTypeChange={setFormType}
            />
          </div>
          {/* Header with Back Button and Title */}
          <div className="w-full bg-info-dark p-4 rounded-md rounded-b-none flex items-center justify-between relative">
            {/* Title Centered */}
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-white text-xl font-bold">
              {t("title")}
            </h1>

            {/* Back Button Aligned to the Right */}
            <button
              onClick={handleFormClose}
              className="text-white border px-4 py-2 rounded-md hover:bg-warning-light hover:text-info-dark hover:border-none transition duration-300"
            >
              {t("back")}
            </button>
          </div>

          {/* Form with Radio Buttons */}
          <div>
            {/* Centered Radio Buttons */}

            {/* InternalForm or BetweenForm based on selected form type */}
            {formType === "internal" ? (
              <InternalForm
                initialData={
                  selectedRowIndex !== null ? data[selectedRowIndex] : {}
                }
                onSubmit={handleFormSubmit}
              />
            ) : (
              <BetweenForm
              // initialData={
              //   selectedRowIndex !== null ? data[selectedRowIndex] : {}
              // }
              // onSubmit={handleFormSubmit}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
