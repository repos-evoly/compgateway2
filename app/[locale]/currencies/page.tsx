"use client";

import React, { useEffect, useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { getCurrencies } from "./services";
import { T } from "@/types"; // Adjust path if necessary
import { useTranslations } from "next-intl";

const Page = () => {
  // Table data => T[] for the grid
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Each page shows 10 items
  const limit = 10;

  // Search logic
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("code");

  const t = useTranslations("currencies");

  // CrudDataGrid columns
  const columns = [
    { key: "code", label: t("code") },
    { key: "rate", label: t("rate") },
    { key: "description", label: t("description") },
  ];

  // Re-fetch whenever page, searchTerm, or searchBy changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, searchBy]);

  async function fetchData() {
    try {
      // We pass searchTerm + searchBy, along with page & limit
      const response = await getCurrencies(
        currentPage,
        limit,
        searchTerm,
        searchBy
      );

      // Convert the API data to T[] shape
      const rowData: T[] = response.data.map((curr) => ({
        id: curr.id,
        code: curr.code,
        rate: curr.rate,
        description: curr.description,
        createdAt: curr.createdAt,
        updatedAt: curr.updatedAt,
      }));

      setData(rowData);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching currencies:", err);
    }
  }

  // The dropdown options for searching
  const dropdownOptions = [
    { value: "code", label: "Code" },
    { value: "description", label: "Description" },
  ];

  return (
    <div className="p-4">
      <CrudDataGrid
        data={data}
        columns={columns}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showActions={false}
        showAddButton={false}
        // Enable search bar with input + dropdown
        showSearchBar={true}
        showSearchInput={true}
        showDropdown={true}
        dropdownOptions={dropdownOptions}
        // We'll update local states from the grid's handlers
        onSearch={(val) => {
          setSearchTerm(val);
          setCurrentPage(1); // reset to first page on new search
        }}
        onDropdownSelect={(val) => {
          setSearchBy(val);
          setCurrentPage(1); // reset to first page if user changes search field
        }}
      />
    </div>
  );
};

export default Page;
