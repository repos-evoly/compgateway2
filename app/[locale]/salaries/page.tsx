"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SalariesForm from "./components/SalariesForm";
import { TSalaryRecord, TSalaryFormValues } from "./types";
import salariesData from "./salariesData.json";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

const SalariesPage = () => {
  const locale = useLocale();
  const t = useTranslations("salaries");
  const router = useRouter();

  // Data state
  const [data, setData] = useState<TSalaryRecord[]>(salariesData);
  const [showForm, setShowForm] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Columns definition
  const columns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "salary", label: t("salary") },
    { key: "date", label: t("date") },
    { key: "accountNumber", label: t("accountNumber") },
  ];

  // Add button handler
  const handleAddClick = () => setShowForm(true);
  const handleFormSubmit = (values: TSalaryFormValues) => {
    setData((prev) => [
      {
        ...values,
        salary: values.salary ?? 0,
        sendSalary: false,
        canPost: false,
      } as TSalaryRecord,
      ...prev,
    ]);
    setShowForm(false);
    setCurrentPage(1); // Reset to first page after add
  };
  const handleFormCancel = () => setShowForm(false);

  // Set Salaries button handler
  const handleSetSalaries = () => {
    router.push(`/${locale}/salaries/setSalaries`);
  };

  // Set Salaries button for header
  const setSalariesButton = (
    <button
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ml-2"
      onClick={handleSetSalaries}
    >
      {t("setSalaries")}
    </button>
  );

  // Slice data for current page
  const pagedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={`p-4 ${locale === "ar" ? "rtl" : "ltr"}`}>
      {showForm ? (
        <SalariesForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      ) : (
        <CrudDataGrid
          data={pagedData}
          columns={columns}
          showActions={false}
          showSearchBar={false}
          showAddButton={true}
          onAddClick={handleAddClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          childrens={setSalariesButton}
        />
      )}
    </div>
  );
};

export default SalariesPage;
