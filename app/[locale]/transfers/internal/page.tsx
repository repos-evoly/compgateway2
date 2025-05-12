"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import FormTypeSelect from "./components/FormTypeSelect";
import InternalForm from "./components/InternalForm";
import BetweenForm from "./components/BetweenForm";

// Data & columns
import {
  dataEn,
  dataAr,
  columnsEn,
  columnsAr,
  dropdownOptions,
} from "./components/data";

// Types
import { InternalFormValues } from "@/types";

const Page = () => {
  const locale = useLocale();
  const t = useTranslations("internalTransferForm");

  // 1) locale-based data
  const data = locale === "ar" ? dataAr : dataEn;
  const columns = locale === "ar" ? columnsAr : columnsEn;

  // Local Add form
  const [showForm, setShowForm] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [formType, setFormType] = useState("internal");

  // Searching & dropdown
  const handleSearch = (val: string) => console.log("Search:", val);
  const handleDropdownSelect = (val: string) => console.log("Dropdown:", val);

  const handleAddClick = () => {
    setSelectedRowIndex(null);
    setShowForm(true);
  };
  const handleFormClose = () => setShowForm(false);

  const handleFormSubmit = (formValues: InternalFormValues) => {
    console.log("Submitted Data Locally:", formValues, "FormType:", formType);
    alert("Form submitted locally!");
    setShowForm(false);
    setSelectedRowIndex(null);
  };

  return (
    <div className="p-4">
      {!showForm ? (
        <CrudDataGrid
          data={data}
          columns={columns}
          showSearchBar
          onSearch={handleSearch}
          onDropdownSelect={handleDropdownSelect}
          dropdownOptions={dropdownOptions}
          showAddButton
          onAddClick={handleAddClick}
          // Provide pagination props
          totalPages={1}
          currentPage={1}
          onPageChange={() => {}}
        />
      ) : (
        <div className="bg-white p-6 rounded">
          <div className="w-full bg-info-dark p-4 rounded-md rounded-b-none flex items-center gap-8">
            <button
              onClick={handleFormClose}
              className="text-white border px-4 py-2 rounded-md hover:bg-warning-light hover:text-info-dark hover:border-transparent transition duration-300"
            >
              {t("back")}
            </button>

            <FormTypeSelect
              selectedFormType={formType}
              onFormTypeChange={setFormType}
            />
          </div>

          <div className="p-4">
            {formType === "internal" ? (
              <InternalForm
                initialData={
                  selectedRowIndex !== null ? data[selectedRowIndex] : {}
                }
                onSubmit={handleFormSubmit}
              />
            ) : (
              <BetweenForm />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
