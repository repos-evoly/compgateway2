"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import CBLForm from "./components/CBLForm";
import { getCblRequests } from "./service";
import { TCBLValues } from "./types";

// Permission helpers (copied from SideBar2.tsx)
const getCookieValue = (key: string): string | undefined =>
  typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`))
        ?.split("=")[1]
    : undefined;

const decodeCookieArray = (value: string | undefined): ReadonlySet<string> => {
  if (!value) return new Set<string>();
  try {
    return new Set(JSON.parse(decodeURIComponent(value)));
  } catch {
    return new Set<string>();
  }
};

const CBLListPage: React.FC = () => {
  const t = useTranslations("cblForm");

  /* ------------ state ------------ */
  const [rows, setRows] = useState<TCBLValues[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("partyName");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const canAdd = permissionsSet.has("CBLCanAdd");
  const canEdit = permissionsSet.has("CBLCanEdit");

  /* ------------ fetch list ------------ */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log("Fetching CBL requests with:", {
          page,
          limit,
          searchTerm,
          searchBy,
        });
        const res = await getCblRequests(page, limit, searchTerm, searchBy);
        console.log("CBL API Response:", res); // Debug log
        setRows(res.data);
        setTotalPages(res.totalPages);
        console.log("Updated state:", {
          rowsCount: res.data.length,
          totalPages: res.totalPages,
          currentPage: page,
        });
      } catch (e) {
        console.error("fetch CBLs", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, searchTerm, searchBy]);

  /* ------------ form callbacks ------------ */
  const onFormSave = (created: TCBLValues) => {
    // add new row on top and close form
    setRows((prev) => [created, ...prev]);
    setShowForm(false);
  };
  const onFormCancel = () => setShowForm(false);
  const onFormBack = () => setShowForm(false);

  /* ------------ pagination handler ------------ */
  const handlePageChange = (newPage: number) => {
    console.log("Page change requested:", { from: page, to: newPage });
    setPage(newPage);
  };

  /* ------------ grid columns ------------ */
  const cols = [
    { key: "partyName", label: t("partyName") },
    { key: "legalRepresentative", label: t("legalRepresentative") },
    { key: "mobile", label: t("mobile") },
    { key: "address", label: t("address") },
    { key: "status", label: t("status") },
  ];

  const dropdownOptions = [
    { value: "partyName", label: t("partyName") },
    { value: "status", label: t("status") },
  ];

  const handleDropdownSelect = useCallback(
    (value: string) => {
      if (value !== searchBy) {
        setSearchBy(value);
        setPage(1);
      }
    },
    [searchBy]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  /* ------------ render ------------ */
  return (
    <div className="p-4">
      {showForm ? (
        <CBLForm
          onSubmit={onFormSave}
          onCancel={onFormCancel}
          onBack={onFormBack}
        />
      ) : (
        <CrudDataGrid
          data={rows}
          columns={cols}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showSearchInput
          showDropdown
          showSearchBar
          dropdownOptions={dropdownOptions}
          onDropdownSelect={handleDropdownSelect}
          onSearch={handleSearch}
          showAddButton={canAdd}
          onAddClick={() => setShowForm(true)}
          loading={loading}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

export default CBLListPage;
