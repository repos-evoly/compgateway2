"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { dataEn, dataAr, columnsEn, columnsAr, dropdownOptions } from "./data";
import InternalForm from "./InternalForm";
import { useTranslations, useLocale } from "next-intl";
// import FormTypeSelect from "./FormTypeSelect";

const Page = () => {
  const locale = useLocale();
  const [showForm, setShowForm] = useState(false);

  const data = locale === "ar" ? dataAr : dataEn;
  const columns = locale === "ar" ? columnsAr : columnsEn;

  const handleSearch = (value: string) => console.log("Search:", value);
  const handleDropdownSelect = (value: string) =>
    console.log("Dropdown Selected:", value);

  const handleAddClick = () => setShowForm(true);
  const handleFormClose = () => setShowForm(false);

  const t = useTranslations("internalTransferForm");

  return (
    <div className="p-4">
      {/* <FormTypeSelect /> */}
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
        />
      ) : (
        <div className="bg-white p-6 rounded ">
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

          {/* Internal Form */}
          <InternalForm />
        </div>
      )}
    </div>
  );
};

export default Page;
