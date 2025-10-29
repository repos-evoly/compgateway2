"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FormikHelpers } from "formik";

import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import EdfaaliForm from "./components/EdfaaliForm";
import { TEdfaaliFormValues, TEdfaaliListItem } from "./types";
import { representativePlaceholderOptions } from "./data";

const formatAccountNumber = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length === 13) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 10)}-${digits.slice(10)}`;
  }
  return value;
};

const EdfaaliRequestsPage: React.FC = () => {
  const t = useTranslations("edfaaliForm");

  const [rows, setRows] = useState<TEdfaaliListItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const columns = useMemo(
    () => [
      { key: "companyEnglishName", label: t("companyEnglishName") },
      { key: "representativeName", label: t("representative") },
      { key: "servicePhoneNumber", label: t("servicePhoneNumber") },
      { key: "accountNumber", label: t("accountNumber") },
      { key: "createdAt", label: t("createdAt") },
    ],
    [t]
  );

  const resolveRepresentativeName = useCallback(
    (representativeId: string): string => {
      const found = representativePlaceholderOptions.find(
        (option) => option.value === representativeId
      );
      return found ? t(found.labelKey) : representativeId;
    },
    [t]
  );

  const handleFormSubmit = useCallback(
    (
      values: TEdfaaliFormValues,
      helpers: FormikHelpers<TEdfaaliFormValues>
    ) => {
      const representativeName = resolveRepresentativeName(
        values.representativeId
      );

      const cleanedAccount = formatAccountNumber(values.accountNumber);

      const newItem: TEdfaaliListItem = {
        ...values,
        accountNumber: cleanedAccount,
        id: `${Date.now()}`,
        createdAt: new Date().toLocaleString(),
        representativeName,
      };

      setRows((prev) => [newItem, ...prev]);
      helpers.resetForm();
      setShowForm(false);
    },
    [resolveRepresentativeName]
  );

  const handleCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleAddClick = useCallback(() => {
    setShowForm(true);
  }, []);

  return (
    <div className="p-4">
      {showForm ? (
        <EdfaaliForm
          onSubmit={handleFormSubmit}
          onBack={handleCancel}
        />
      ) : (
        <CrudDataGrid
          data={rows}
          columns={columns}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showAddButton
          onAddClick={handleAddClick}
          showSearchBar={false}
          showSearchInput={false}
          loading={false}
          noPagination
        />
      )}
    </div>
  );
};

export default EdfaaliRequestsPage;
