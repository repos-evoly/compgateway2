/* --------------------------------------------------------------------------
   app/[locale]/salaries/page.tsx
   – Uses reusable <Button> and fixes accountType union mismatch.
   – Columns include the new “accountType” field.
   -------------------------------------------------------------------------- */
"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
// import { useRouter } from "next/navigation";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import SalariesForm from "./components/SalariesForm";
import Button from "@/app/components/reusable/Button";

import type { TSalaryRecord, TSalaryFormValues } from "./types";
import salariesDataJson from "./salariesData.json";

const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ */
/* Cast JSON → TSalaryRecord[] (fixes accountType literal union)      */
/* ------------------------------------------------------------------ */
const salariesData: TSalaryRecord[] = (
  salariesDataJson as unknown as TSalaryRecord[]
).map((r) => ({
  ...r,
  accountType: r.accountType as "account" | "wallet",
}));

export default function SalariesPage() {
  const locale = useLocale();
  const t = useTranslations("salaries");
  // const router = useRouter();

  /* ------------------- state ---------------------------------------- */
  const [data, setData] = useState<TSalaryRecord[]>(salariesData);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* ------------------- paging helpers ------------------------------- */
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const handlePageChange = (p: number) => setCurrentPage(p);

  /* ------------------- add salary record ---------------------------- */
  const handleAddClick = () => setShowForm(true);

  const handleFormSubmit = (values: TSalaryFormValues) => {
    setData((prev) => {
      const nextId = (prev[0]?.id ?? 0) + 1;
      return [
        {
          id: nextId,
          name: values.name ?? "",
          email: values.email ?? "",
          phone: values.phone ?? "",
          salary: values.salary ?? 0,
          date: values.date ?? new Date().toISOString().slice(0, 10),
          accountNumber: values.accountNumber ?? "",
          accountType: values.accountType ?? "account",
          sendSalary: false,
          canPost: false,
        } as TSalaryRecord,
        ...prev,
      ];
    });
    setShowForm(false);
    setCurrentPage(1); // reset pagination
  };

  const handleFormCancel = () => setShowForm(false);

  /* ------------------- columns -------------------------------------- */
  const columns = [
    { key: "name", label: t("name") },
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
    { key: "salary", label: t("salary") },
    { key: "date", label: t("date") },
    { key: "accountNumber", label: t("accountNumber") },
    { key: "accountType", label: t("accountType", { defaultValue: "Type" }) },
  ];

  /* ------------------- header button (Button) ----------------------- */
  const setSalariesButton = (
    <Button
      actions={{ type: "navigate", href: `/${locale}/salaries/setSalaries` }}
      isTransparent
    >
      {t("setSalaries")}
    </Button>
  );

  /* ------------------- data slice ----------------------------------- */
  const pagedData = data.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ------------------- render --------------------------------------- */
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
          showAddButton
          onAddClick={handleAddClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          childrens={setSalariesButton}
        />
      )}
    </div>
  );
}
