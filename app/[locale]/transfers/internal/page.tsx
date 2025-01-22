"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import {
  dataEn,
  dataAr,
  columnsEn,
  columnsAr,
  dropdownOptions,
} from "../../../components/forms/transfers/internal/data";
import InternalForm from "../../../components/forms/transfers/internal/InternalForm";
import BetweenForm from "../../../components/forms/transfers/internal/BetweenForm"; // New BetweenForm component
import { useTranslations, useLocale } from "next-intl";
import FormTypeSelect from "../../../components/forms/transfers/internal/FormTypeSelect";
import { InternalFormValues } from "@/types"; // Import the type

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
          {/* Header with Back Button and Title */}
          <div className="w-full bg-info-dark p-4 rounded-md rounded-b-none flex items-center justify-start gap-8 relative">
            {/* Back Button */}
            <button
              onClick={handleFormClose}
              className="text-white border px-4 py-2 rounded-md hover:bg-warning-light hover:text-info-dark hover:border-transparent transition duration-300"
            >
              {t("back")}
            </button>

            {/* FormTypeSelect Aligned Horizontally */}
            <div className="flex items-center">
              <FormTypeSelect
                selectedFormType={formType}
                onFormTypeChange={setFormType}
              />
            </div>
          </div>

          <div className="">
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
